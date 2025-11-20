// src/app/api/business/events/[eventId]/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { updateEventSchema, formatValidationError } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

// PATCH - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    
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

    // Verify event belongs to this establishment
    const { data: event } = await serviceSupabase
      .from('events')
      .select('id, establishment_id')
      .eq('id', eventId)
      .single()

    if (!event || event.establishment_id !== establishment.id) {
      return NextResponse.json({ 
        message: 'Event not found or access denied' 
      }, { status: 404 })
    }

    // Validate request body
    const body = await request.json()
    const validation = updateEventSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        message: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const updateData = validation.data
    const allowedFields: Partial<{
      name: string
      description: string | null
      status: string
      rules_json: Record<string, unknown>
    }> = {}

    // Only allow specific fields to be updated
    if (updateData.name !== undefined) allowedFields.name = updateData.name
    if (updateData.description !== undefined) allowedFields.description = updateData.description
    if (updateData.status !== undefined) allowedFields.status = updateData.status
    if (updateData.rules_json !== undefined) allowedFields.rules_json = updateData.rules_json

    // Update the event
    const { error: updateError } = await serviceSupabase
      .from('events')
      .update(allowedFields)
      .eq('id', eventId)

    if (updateError) {
      console.error('Event update error:', updateError)
      return NextResponse.json({ 
        message: 'Failed to update event' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Event updated successfully'
    })

  } catch (error) {
    console.error('Event PATCH error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}

// DELETE - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    
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

    // Verify event belongs to this establishment
    const { data: event } = await serviceSupabase
      .from('events')
      .select('id, establishment_id')
      .eq('id', eventId)
      .single()

    if (!event || event.establishment_id !== establishment.id) {
      return NextResponse.json({ 
        message: 'Event not found or access denied' 
      }, { status: 404 })
    }

    // Check if event has any completed cards (we might want to prevent deletion in this case)
    const { data: completedCards } = await serviceSupabase
      .from('cards')
      .select('id')
      .eq('event_id', eventId)
      .eq('status', 'completed')

    if (completedCards && completedCards.length > 0) {
      return NextResponse.json({ 
        message: 'Cannot delete event with completed cards. Consider ending it instead.' 
      }, { status: 400 })
    }

    // Delete in order to respect foreign key constraints
    // 1. Delete punches
    const { error: punchesDeleteError } = await serviceSupabase
      .from('punches')
      .delete()
      .eq('event_id', eventId)

    if (punchesDeleteError) {
      console.error('Punches deletion error:', punchesDeleteError)
      return NextResponse.json({ 
        message: 'Failed to delete event punches' 
      }, { status: 500 })
    }

    // 2. Delete rewards
    const { error: rewardsDeleteError } = await serviceSupabase
      .from('rewards')
      .delete()
      .eq('event_id', eventId)

    if (rewardsDeleteError) {
      console.error('Rewards deletion error:', rewardsDeleteError)
      return NextResponse.json({ 
        message: 'Failed to delete event rewards' 
      }, { status: 500 })
    }

    // 3. Delete cards
    const { error: cardsDeleteError } = await serviceSupabase
      .from('cards')
      .delete()
      .eq('event_id', eventId)

    if (cardsDeleteError) {
      console.error('Cards deletion error:', cardsDeleteError)
      return NextResponse.json({ 
        message: 'Failed to delete event cards' 
      }, { status: 500 })
    }

    // 4. Delete tags
    const { error: tagsDeleteError } = await serviceSupabase
      .from('tags')
      .delete()
      .eq('event_id', eventId)

    if (tagsDeleteError) {
      console.error('Tags deletion error:', tagsDeleteError)
      return NextResponse.json({ 
        message: 'Failed to delete event tags' 
      }, { status: 500 })
    }

    // 5. Finally delete the event
    const { error: deleteError } = await serviceSupabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (deleteError) {
      console.error('Event deletion error:', deleteError)
      return NextResponse.json({ 
        message: 'Failed to delete event' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Event DELETE error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}