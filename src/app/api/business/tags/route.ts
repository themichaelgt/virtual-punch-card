// src/app/api/business/tags/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

export async function GET(request: NextRequest) {
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

    // Get all tags purchased by this establishment (both claimed and unclaimed)
    const { data: tags, error: tagsError } = await serviceSupabase
      .from('tags')
      .select(`
        id,
        token,
        label,
        status,
        created_at,
        event_id,
        event:events(
          id,
          name,
          status
        )
      `)
      .eq('purchased_by_establishment_id', establishment.id)
      .order('created_at', { ascending: false })

    if (tagsError) {
      console.error('Tags query error:', tagsError)
      return NextResponse.json({ 
        message: 'Failed to load tags' 
      }, { status: 500 })
    }

    return NextResponse.json({
      tags: tags || []
    })

  } catch (error) {
    console.error('Tags GET error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}