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

    const serviceSupabase = createServiceSupabase()

    // Get establishment ID
    const { data: establishment } = await serviceSupabase
        .from('establishments')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!establishment) {
        return NextResponse.json({ message: 'Establishment not found' }, { status: 404 })
    }

    // Get events to filter by
    let eventIds: string[] = []
    if (eventId) {
        // Verify ownership
        const { data: event } = await serviceSupabase
            .from('events')
            .select('id, establishment_id')
            .eq('id', eventId)
            .single()

        if (!event || event.establishment_id !== establishment.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
        }
        eventIds = [eventId]
    } else {
        const { data: events } = await serviceSupabase
            .from('events')
            .select('id')
            .eq('establishment_id', establishment.id)

        if (events) {
            eventIds = events.map(e => e.id)
        }
    }

    if (eventIds.length === 0) {
        return NextResponse.json({
            totalCustomers: 0,
            returningCustomers: 0,
            loyalCustomers: 0
        })
    }

    // Fetch punches to analyze customer behavior
    const { data: punches, error: punchesError } = await serviceSupabase
        .from('punches')
        .select('user_id')
        .in('event_id', eventIds)

    if (punchesError) {
        return NextResponse.json({ message: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Fetch completed cards for loyalty metric
    const { data: completedCards, error: cardsError } = await serviceSupabase
        .from('cards')
        .select('user_id')
        .in('event_id', eventIds)
        .eq('status', 'completed')

    if (cardsError) {
        return NextResponse.json({ message: 'Failed to fetch analytics' }, { status: 500 })
    }

    // Analyze punches
    const punchCounts: Record<string, number> = {}
    punches.forEach(p => {
        punchCounts[p.user_id] = (punchCounts[p.user_id] || 0) + 1
    })

    const totalCustomers = Object.keys(punchCounts).length
    const returningCustomers = Object.values(punchCounts).filter(count => count > 1).length

    // Analyze completed cards
    const completedCounts: Record<string, number> = {}
    completedCards.forEach(c => {
        completedCounts[c.user_id] = (completedCounts[c.user_id] || 0) + 1
    })

    const loyalCustomers = Object.values(completedCounts).filter(count => count > 1).length

    return NextResponse.json({
        totalCustomers,
        returningCustomers,
        loyalCustomers
    })
}
