// src/app/api/business/tags/update/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { updateTagSchema, formatValidationError } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

export async function POST(request: NextRequest) {
  try {
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
    const validation = updateTagSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        message: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const { tagId, status } = validation.data

    // Verify the tag belongs to this establishment's events
    const { data: tag } = await serviceSupabase
      .from('tags')
      .select(`
        id,
        event_id,
        events!inner(
          establishment_id
        )
      `)
      .eq('id', tagId)
      .single()

    if (!tag || !tag.events || (tag.events as any).establishment_id !== establishment.id) {
      return NextResponse.json({
        message: 'Tag not found or access denied'
      }, { status: 404 })
    }

    // Update tag status
    const { error: updateError } = await serviceSupabase
      .from('tags')
      .update({ status })
      .eq('id', tagId)

    if (updateError) {
      console.error('Tag update error:', updateError)
      return NextResponse.json({ 
        message: 'Failed to update tag' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Tag status updated successfully'
    })

  } catch (error) {
    console.error('Tag update error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}