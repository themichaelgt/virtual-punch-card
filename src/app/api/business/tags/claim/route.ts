// src/app/api/business/tags/claim/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { claimTagsSchema, formatValidationError } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Get establishment
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
    const validation = claimTagsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        message: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const { eventId, quantity } = validation.data

    // Check how many unclaimed tags the business has purchased
    const { data: unclaimedTags, error: unclaimedError } = await serviceSupabase
      .from('tags')
      .select('id, token, label')
      .is('event_id', null) // Unclaimed tags
      .eq('purchased_by_establishment_id', establishment.id)
      .eq('status', 'inactive')
      .limit(quantity)

    if (unclaimedError || !unclaimedTags || unclaimedTags.length < quantity) {
      return NextResponse.json({ 
        message: `Not enough unclaimed tags. You have ${unclaimedTags?.length || 0} available. Purchase more tags to continue.` 
      }, { status: 400 })
    }

    // Claim the tags by assigning them to the event
    const tagIds = unclaimedTags.map(t => t.id)
    const { error: claimError } = await serviceSupabase
      .from('tags')
      .update({
        event_id: eventId,
        claimed_at: new Date().toISOString(),
        status: 'active'
      })
      .in('id', tagIds)

    if (claimError) {
      console.error('Tag claim error:', claimError)
      return NextResponse.json({ 
        message: 'Failed to claim tags' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: `Successfully claimed ${quantity} tags for your event`,
      tags: unclaimedTags
    })

  } catch (error) {
    console.error('Tag claim error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}