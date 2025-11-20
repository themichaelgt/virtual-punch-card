import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createServiceSupabase } from '@/lib/supabase'
import { rateLimiters } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
    const rateLimitResult = await rateLimiters.standard(request)
    if (rateLimitResult) return rateLimitResult

    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const serviceSupabase = createServiceSupabase()

    // Verify ownership if eventId is provided
    if (eventId) {
        const { data: event } = await serviceSupabase
            .from('events')
            .select('establishment_id')
            .eq('id', eventId)
            .single()

        if (event) {
            const { data: establishment } = await serviceSupabase
                .from('establishments')
                .select('owner_id')
                .eq('id', event.establishment_id)
                .single()

            if (!establishment || establishment.owner_id !== user.id) {
                return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
            }
        }
    } else {
        // If no eventId, get all events for user's establishment
        const { data: establishment } = await serviceSupabase
            .from('establishments')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (!establishment) {
            return NextResponse.json({ message: 'Establishment not found' }, { status: 404 })
        }
    }

    let query = serviceSupabase
        .from('punches')
        .select('created_at, event_id')
        .order('created_at', { ascending: true })

    if (eventId) {
        query = query.eq('event_id', eventId)
    } else {
        // Filter by user's establishment events
        const { data: establishment } = await serviceSupabase
            .from('establishments')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (establishment) {
            const { data: events } = await serviceSupabase
                .from('events')
                .select('id')
                .eq('establishment_id', establishment.id)

            if (events && events.length > 0) {
                query = query.in('event_id', events.map((e: { id: string }) => e.id))
            } else {
                return NextResponse.json({ data: [] })
            }
        }
    }

    if (startDate) {
        query = query.gte('created_at', startDate)
    }
    if (endDate) {
        query = query.lte('created_at', endDate)
    }

    const { data: punches, error } = await query

    if (error) {
        console.error('Error fetching punches:', error)
        return NextResponse.json({ message: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Aggregate data by date
    const aggregated = punches.reduce((acc: Record<string, number>, punch: { created_at: string }) => {
        const date = new Date(punch.created_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {})

    const result = Object.entries(aggregated).map(([date, count]) => ({
        date,
        count
    })).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({ data: result })
}
