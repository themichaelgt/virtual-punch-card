// src/app/api/business/validate-reward/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { rateLimiters } from '@/lib/rate-limit'
import { validateRewardSchema, formatValidationError } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

interface RewardWithDetails {
  id: string
  code: string
  redeemed_at: string | null
  issued_at: string
  user_id: string
  event_id: string
  events: {
    id: string
    name: string
    establishment_id: string
  }
  users: {
    id: string
    email: string
    name: string | null
  }
}

const serviceSupabase = createServiceSupabase()

export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting to prevent brute force attacks (5 requests per minute)
    const rateLimitResult = await rateLimiters.strict(request)
    if (rateLimitResult) return rateLimitResult

    // Get authenticated business user
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user's establishment
    const { data: establishment } = await serviceSupabase
      .from('establishments')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (!establishment) {
      return NextResponse.json({ 
        message: 'No business account found' 
      }, { status: 404 })
    }

    // Validate request body
    const body = await request.json()
    const validation = validateRewardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        valid: false,
        message: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const { code } = validation.data

    // Look up the reward
    const { data: reward, error: rewardError } = await serviceSupabase
      .from('rewards')
      .select(`
        id,
        code,
        redeemed_at,
        issued_at,
        user_id,
        event_id,
        events!inner(
          id,
          name,
          establishment_id
        ),
        users!inner(
          id,
          email,
          name
        )
      `)
      .eq('code', code)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid reward code'
      }, { status: 200 })
    }

    const typedReward = reward as unknown as RewardWithDetails

    // Verify the reward belongs to this establishment
    if (typedReward.events.establishment_id !== establishment.id) {
      return NextResponse.json({
        valid: false,
        message: 'This reward code is not for your business'
      }, { status: 200 })
    }

    // Check if already redeemed
    if (typedReward.redeemed_at) {
      return NextResponse.json({
        valid: false,
        message: 'This reward has already been redeemed',
        redeemed_at: typedReward.redeemed_at
      }, { status: 200 })
    }

    // Mark as redeemed
    const { error: updateError } = await serviceSupabase
      .from('rewards')
      .update({
        redeemed_at: new Date().toISOString()
      })
      .eq('id', reward.id)

    if (updateError) {
      console.error('Reward update error:', updateError)
      return NextResponse.json({ 
        valid: false,
        message: 'Failed to redeem reward'
      }, { status: 500 })
    }

    // Return success with details
    return NextResponse.json({
      valid: true,
      message: 'Reward is valid! Marked as redeemed.',
      reward: {
        code: typedReward.code,
        event_name: typedReward.events.name,
        customer_email: typedReward.users.email,
        customer_name: typedReward.users.name,
        issued_at: typedReward.issued_at
      }
    })

  } catch (error) {
    console.error('Reward validation error:', error)
    return NextResponse.json({ 
      valid: false,
      message: 'Internal server error' 
    }, { status: 500 })
  }
}