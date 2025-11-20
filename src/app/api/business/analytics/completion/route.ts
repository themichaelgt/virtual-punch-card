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
            totalCards: 0,
            completedCards: 0,
            completionRate: 0,
            avgDaysToComplete: 0
        })
    }

    // Fetch cards
    const { data: cards, error } = await serviceSupabase
        .from('cards')
        .select('created_at, completed_at, status')
        .in('event_id', eventIds)

    if (error) {
        console.error('Error fetching cards:', error)
        return NextResponse.json({ message: 'Failed to fetch analytics' }, { status: 500 })
    }

    const totalCards = cards.length
    const completedCards = cards.filter(c => c.status === 'completed').length
    const completionRate = totalCards > 0 ? (completedCards / totalCards) * 100 : 0

    // Calculate average time to complete
    let totalCompletionTimeMs = 0
    let completedCountWithDates = 0

    cards.forEach(card => {
        if (card.status === 'completed' && card.completed_at && card.created_at) {
            const start = new Date(card.created_at).getTime()
            const end = new Date(card.completed_at).getTime()
            totalCompletionTimeMs += (end - start)
            completedCountWithDates++
        }
    })

    const avgDaysToComplete = completedCountWithDates > 0
        ? (totalCompletionTimeMs / completedCountWithDates) / (1000 * 60 * 60 * 24)
        : 0

    return NextResponse.json({
        totalCards,
        completedCards,
        completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
        avgDaysToComplete: Math.round(avgDaysToComplete * 10) / 10
    })
}
