// src/app/api/punch/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { rateLimiters } from '@/lib/rate-limit'
import { punchSchema, formatValidationError } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (30 requests per minute per IP)
    const rateLimitResult = await rateLimiters.standard(request)
    if (rateLimitResult) return rateLimitResult

    // Get authenticated user
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Please sign in to continue' 
      }, { status: 401 })
    }

    const userId = user.id

    // Validate request body
    const body = await request.json()
    const validation = punchSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const { token } = validation.data

    // Look up tag and event
    const { data: tagData, error: tagError } = await serviceSupabase
      .from('tags')
      .select(`
        id,
        event_id,
        status,
        events!inner(
          id,
          name,
          status,
          rules_json
        )
      `)
      .eq('token', token)
      .single()

    if (tagError || !tagData) {
      return NextResponse.json({
        status: 'error',
        message: 'Tag not found'
      }, { status: 404 })
    }

    const event = tagData.events as any

    // Verify tag is active
    if (tagData.status !== 'active') {
      return NextResponse.json({
        status: 'error',
        message: 'This tag is no longer active'
      }, { status: 400 })
    }

    // Validate event is still active
    if (event.status !== 'active') {
      return NextResponse.json({
        status: 'error',
        message: 'This event has ended'
      }, { status: 400 })
    }

    // Ensure user exists in our users table
    const { error: userUpsertError } = await serviceSupabase
      .from('users')
      .upsert({ 
        id: userId, 
        email: user.email!,
        name: user.user_metadata?.full_name || 'User'
      }, { 
        onConflict: 'id' 
      })

    if (userUpsertError) {
      console.error('User upsert error:', userUpsertError)
      // Continue anyway - this is not critical
    }

    // Get or create user card (check for ANY status first)
    let { data: existingCard, error: existingCardError } = await serviceSupabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', tagData.event_id)
      .single()

    let card

    if (existingCard) {
      // Card exists - use it regardless of status
      card = existingCard
    } else if (existingCardError && existingCardError.code === 'PGRST116') {
      // No card exists - create new one
      const { data: newCard, error: createError } = await serviceSupabase
        .from('cards')
        .insert({
          user_id: userId,
          event_id: tagData.event_id,
          progress: 0,
          status: 'active'
        })
        .select()
        .single()

      if (createError) {
        console.error('Card creation error:', createError)
        console.error('Card creation details:', JSON.stringify(createError, null, 2))
        return NextResponse.json({ 
          status: 'error', 
          message: `Failed to create card: ${createError.message || 'Unknown error'}` 
        }, { status: 500 })
      }
      card = newCard
    } else {
      console.error('Card query error:', existingCardError)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Database error occurred' 
      }, { status: 500 })
    }

    if (!card) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Card error' 
      }, { status: 500 })
    }

    // Check if already completed
    if (card.status === 'completed') {
      const rules = event.rules_json
      
      // Check if repeat cards are allowed
      if (rules.allow_repeat) {
        // Reset the card for a new round
        const { error: resetError } = await serviceSupabase
          .from('cards')
          .update({
            progress: 0,
            status: 'active',
            completed_at: null
          })
          .eq('id', card.id)

        if (resetError) {
          console.error('Card reset error:', resetError)
          return NextResponse.json({ 
            status: 'error', 
            message: 'Failed to reset card' 
          }, { status: 500 })
        }

        // Update local card object
        card.progress = 0
        card.status = 'active'
        card.completed_at = null
      } else {
        // Repeat not allowed
        return NextResponse.json({ 
          status: 'error', 
          message: 'This punch card is already completed! Repeat cards are not allowed for this event.' 
        }, { status: 400 })
      }
    }

    // Validate rules (basic implementation - can be expanded)
    const rules = event.rules_json

    // Get user's location from request if available
    // const userLocation = body?.location // { latitude, longitude }

    const violations = await validateRules(rules, userId, tagData.event_id, card)

    if (violations.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: violations[0].message,
        next_eligible_at: violations[0].next_eligible_at
      }, { status: 400 })
    }

    // Record the punch
    const { error: punchError } = await serviceSupabase
      .from('punches')
      .insert({
        card_id: card.id,
        tag_id: tagData.id,
        user_id: userId,
        event_id: tagData.event_id,
        timestamp: new Date().toISOString(),
        trust_score: 100
      })

    if (punchError) {
      console.error('Punch creation error:', punchError)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to record punch' 
      }, { status: 500 })
    }

    // Update progress
    const newProgress = card.progress + 1
    const isCompleted = newProgress >= rules.target_punches

    const { error: updateError } = await serviceSupabase
      .from('cards')
      .update({
        progress: newProgress,
        status: isCompleted ? 'completed' : 'active',
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', card.id)

    if (updateError) {
      console.error('Card update error:', updateError)
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to update progress' 
      }, { status: 500 })
    }

    // Return result
    return isCompleted 
      ? NextResponse.json({
          status: 'completed' as const,
          reward: await generateReward(card.id, tagData.event_id, userId)
        })
      : NextResponse.json({
          status: 'punched' as const,
          progress: newProgress,
          remaining: rules.target_punches - newProgress
        })

  } catch (error) {
    console.error('Punch API error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Server error occurred' 
    }, { status: 500 })
  }
}

async function generateReward(cardId: string, eventId: string, userId: string) {
  const rewardCode = Math.random().toString(36).substring(2, 10).toUpperCase()
  
  const { data: reward, error } = await serviceSupabase
    .from('rewards')
    .insert({
      card_id: cardId,
      event_id: eventId,
      user_id: userId,
      code: rewardCode,
      issued_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Reward creation error:', error)
    // Return a code anyway - better than failing the whole punch
    return { code: rewardCode }
  }

  return { code: rewardCode }
}

async function validateRules(
  rules: any, 
  userId: string, 
  eventId: string, 
  card: any
): Promise<Array<{type: string, message: string, next_eligible_at?: string}>> {
  const violations = []
  const now = new Date()

  // Cooldown check
  if (rules.cooldown_hours > 0) {
    const { data: lastPunch } = await serviceSupabase
      .from('punches')
      .select('timestamp')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (lastPunch) {
      const cooldownEnd = new Date(lastPunch.timestamp)
      cooldownEnd.setHours(cooldownEnd.getHours() + rules.cooldown_hours)
      
      if (now < cooldownEnd) {
        const minutesLeft = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60))
        violations.push({
          type: 'cooldown',
          message: `You can punch again in ${minutesLeft} minutes`,
          next_eligible_at: cooldownEnd.toISOString()
        })
      }
    }
  }

  // Daily limit check
  if (rules.max_punches_per_day > 0) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const { data: todayPunches } = await serviceSupabase
      .from('punches')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .gte('timestamp', todayStart.toISOString())

    if (todayPunches && todayPunches.length >= rules.max_punches_per_day) {
      const tomorrow = new Date(todayStart)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      violations.push({
        type: 'daily_limit',
        message: `Daily limit reached (${rules.max_punches_per_day} punches per day)`,
        next_eligible_at: tomorrow.toISOString()
      })
    }
  }

  return violations
}