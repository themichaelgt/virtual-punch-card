// src/app/api/business/tags/register/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { rateLimiters } from '@/lib/rate-limit'
import { registerTagSchema, formatValidationError } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

export async function POST(request: NextRequest) {
  try {
    // Apply strict rate limiting to prevent brute force attacks on activation codes
    const rateLimitResult = await rateLimiters.strict(request)
    if (rateLimitResult) return rateLimitResult

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
    const validation = registerTagSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        message: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const { activationCode } = validation.data

    // Normalize the code (uppercase, remove spaces/dashes)
    const normalizedCode = activationCode.toUpperCase().replace(/[\s-]/g, '')

console.log('Searching for code:', normalizedCode)
console.log('Original input:', activationCode)

    // Look up tag by activation code
    const { data: tag, error: tagError } = await serviceSupabase
      .from('tags')
      .select('id, activation_code, purchased_by_establishment_id, registered_at')
      .eq('activation_code', normalizedCode)
      .single()

    if (tagError || !tag) {
      return NextResponse.json({ 
        message: 'Invalid activation code. Please check and try again.' 
      }, { status: 404 })
    }

    // Check if already registered to a different establishment
    if (tag.purchased_by_establishment_id && tag.purchased_by_establishment_id !== establishment.id) {
      return NextResponse.json({ 
        message: 'This tag has already been registered to another business.' 
      }, { status: 400 })
    }

    // Check if already registered to this establishment
    if (tag.purchased_by_establishment_id === establishment.id && tag.registered_at) {
      return NextResponse.json({ 
        message: 'This tag is already registered to your account.' 
      }, { status: 400 })
    }

    // Register the tag
    const { error: updateError } = await serviceSupabase
      .from('tags')
      .update({
        purchased_by_establishment_id: establishment.id,
        registered_at: new Date().toISOString(),
        status: 'inactive' // Unclaimed but registered
      })
      .eq('id', tag.id)

    if (updateError) {
      console.error('Tag registration error:', updateError)
      return NextResponse.json({ 
        message: 'Failed to register tag' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Tag registered successfully! You can now assign it to a campaign.',
      tag_id: tag.id
    })

  } catch (error) {
    console.error('Tag registration error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}