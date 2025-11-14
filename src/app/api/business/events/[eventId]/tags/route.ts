// src/app/api/business/events/[eventId]/tags/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createServiceSupabase()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const params = await context.params
    const eventId = params.eventId

    // Get tags for this event
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

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
    console.error('Tags API error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}