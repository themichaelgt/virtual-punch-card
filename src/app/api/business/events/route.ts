// src/app/api/business/events/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { rateLimiters } from '@/lib/rate-limit'
import { createEventSchema, formatValidationError } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

// GET - Load events for the business
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.generous(request)
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

    const { data: events, error: eventsError } = await serviceSupabase
      .from('events')
      .select(`
        id,
        name,
        description,
        rules_json,
        status,
        created_at,
        starts_at,
        ends_at
      `)
      .eq('establishment_id', establishment.id)
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Events query error:', eventsError)
      return NextResponse.json({ 
        message: 'Failed to load events' 
      }, { status: 500 })
    }

    // Get card counts for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event) => {
        const { data: cards } = await serviceSupabase
          .from('cards')
          .select('id, status')
          .eq('event_id', event.id)

        const totalCards = cards?.length || 0
        const completedCards = cards?.filter(card => card.status === 'completed').length || 0

        return {
          ...event,
          _count: {
            cards: totalCards,
            completed_cards: completedCards
          }
        }
      })
    )

    return NextResponse.json({
      events: eventsWithCounts
    })

  } catch (error) {
    console.error('Events GET error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.standard(request)
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
    const validation = createEventSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        message: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const {
      name,
      description,
      target_punches,
      cooldown_hours,
      max_punches_per_day,
      allow_repeat
    } = validation.data

    // Create rules object
    const rules = {
      target_punches,
      cooldown_hours,
      max_punches_per_day,
      allow_repeat
    }

    // Create event
    const { data: event, error: eventError } = await serviceSupabase
      .from('events')
      .insert({
        establishment_id: establishment.id,
        name: name,
        description: description || null,
        rules_json: rules,
        status: 'active',
        starts_at: new Date().toISOString()
      })
      .select()
      .single()

    if (eventError) {
      console.error('Event creation error:', eventError)
      return NextResponse.json({ 
        message: 'Failed to create campaign' 
      }, { status: 500 })
    }

    // Generate 3 NFC tag tokens for this event
    const tokens = []
    for (let i = 1; i <= 3; i++) {
      const token = `${event.id.substring(0, 8)}_TAG_${i}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      const { error: tagError } = await serviceSupabase
        .from('tags')
        .insert({
          token: token,
          event_id: event.id,
          label: `Tag ${i}`,
          status: 'active'
        })

      if (!tagError) {
        tokens.push(token)
      }
    }

    return NextResponse.json({
      message: 'Campaign created successfully. Assign tags from your inventory to activate it.',
      event: event
    })

  } catch (error) {
    console.error('Events POST error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}