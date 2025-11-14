// src/app/api/business/establishment/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

const serviceSupabase = createServiceSupabase()

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        message: 'Authentication required' 
      }, { status: 401 })
    }

    // Get user's establishment
    const { data: establishment, error: establishmentError } = await serviceSupabase
      .from('establishments')
      .select('*')
      .eq('owner_user_id', user.id)
      .single()

    if (establishmentError) {
      if (establishmentError.code === 'PGRST116') {
        // No establishment found
        return NextResponse.json({ 
          message: 'No business account found' 
        }, { status: 404 })
      }
      
      console.error('Establishment query error:', establishmentError)
      return NextResponse.json({ 
        message: 'Database error' 
      }, { status: 500 })
    }

    return NextResponse.json({
      establishment: {
        id: establishment.id,
        name: establishment.name,
        profile_json: establishment.profile_json,
        created_at: establishment.created_at
      }
    })

  } catch (error) {
    console.error('Establishment API error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}