import { NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'

interface RewardWithRelations {
  id: string
  code: string
  redeemed: boolean
  created_at: string
  redeemed_at: string | null
  events: {
    id: string
    name: string
    establishments: {
      id: string
      name: string
    }
  }
}

/**
 * GET /api/customer/rewards
 * Fetch all rewards (used and unused) for the authenticated customer
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

    // Fetch user's rewards with event and establishment details
    const serviceSupabase = createServiceSupabase()
    const { data: rewards, error } = await serviceSupabase
      .from('rewards')
      .select(`
        id,
        code,
        redeemed,
        created_at,
        redeemed_at,
        events (
          id,
          name,
          establishments (
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rewards:', error)
      return NextResponse.json(
        { status: 'error', message: 'Failed to fetch rewards' },
        { status: 500 }
      )
    }

    // Transform data for easier client consumption
    const transformedRewards = (rewards as unknown as RewardWithRelations[]).map((reward) => ({
      id: reward.id,
      code: reward.code,
      redeemed: reward.redeemed,
      createdAt: reward.created_at,
      redeemedAt: reward.redeemed_at,
      event: {
        id: reward.events.id,
        name: reward.events.name
      },
      establishment: {
        id: reward.events.establishments.id,
        name: reward.events.establishments.name
      }
    }))

    return NextResponse.json({
      status: 'success',
      rewards: transformedRewards
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/customer/rewards:', error)
    return NextResponse.json(
      { status: 'error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
