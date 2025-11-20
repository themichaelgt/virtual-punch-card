import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { EventRules } from '@/types/database'

interface CardWithRelations {
  id: string
  current_punches: number
  status: string
  created_at: string
  completed_at: string | null
  events: {
    id: string
    name: string
    description: string | null
    rules_json: EventRules
    establishments: {
      id: string
      name: string
    }
  }
}

/**
 * GET /api/customer/cards
 * Fetch all cards (active and completed) for the authenticated customer
 */
export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { status: 'error', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch user's cards with event and establishment details
    const serviceSupabase = createServiceSupabase()
    const { data: cards, error } = await serviceSupabase
      .from('cards')
      .select(`
        id,
        current_punches,
        status,
        created_at,
        completed_at,
        events (
          id,
          name,
          description,
          rules_json,
          establishments (
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json(
        { status: 'error', message: 'Failed to fetch cards' },
        { status: 500 }
      )
    }

    // Transform data for easier client consumption
    const transformedCards = (cards as unknown as CardWithRelations[]).map((card) => ({
      id: card.id,
      currentPunches: card.current_punches,
      targetPunches: card.events.rules_json?.target_punches || 10,
      status: card.status,
      createdAt: card.created_at,
      completedAt: card.completed_at,
      event: {
        id: card.events.id,
        name: card.events.name,
        description: card.events.description
      },
      establishment: {
        id: card.events.establishments.id,
        name: card.events.establishments.name
      }
    }))

    return NextResponse.json({
      status: 'success',
      cards: transformedCards
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/customer/cards:', error)
    return NextResponse.json(
      { status: 'error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
