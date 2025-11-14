// src/app/api/business/tags/available/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        message: 'Authentication required' 
      }, { status: 401 })
    }

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

    // Count unclaimed tags
    const { data: unclaimedTags } = await serviceSupabase
      .from('tags')
      .select('id')
      .is('event_id', null)
      .eq('purchased_by_establishment_id', establishment.id)
      .eq('status', 'inactive')

    return NextResponse.json({
      available: unclaimedTags?.length || 0
    })

  } catch (error) {
    console.error('Available tags error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}