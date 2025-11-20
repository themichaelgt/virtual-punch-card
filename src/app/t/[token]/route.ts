// src/app/t/[token]/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { EventRules } from '@/types/database'

interface TagWithEvent {
  id: string
  token: string
  status: string
  events: {
    id: string
    name: string
    status: string
    rules_json: EventRules
  }
}

const supabase = createServiceSupabase()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    // Verify the token exists and is active
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select(`
        id,
        token,
        status,
        events!inner(
          id,
          name,
          status,
          rules_json
        )
      `)
      .eq('token', token)
      .eq('status', 'active')
      .single()

    if (tagError || !tag) {
      return NextResponse.redirect(new URL('/?error=invalid_tag', request.url))
    }

    const typedTag = tag as unknown as TagWithEvent
    const event = typedTag.events

    if (event.status !== 'active') {
      return NextResponse.redirect(new URL('/?error=event_ended', request.url))
    }

    // Redirect to tap interface with token in URL
    // This persists through the auth flow
    const response = NextResponse.redirect(new URL(`/tap?token=${token}`, request.url))

    return response

  } catch (error) {
    console.error('NFC tap error:', error)
    return NextResponse.redirect(new URL('/?error=server_error', request.url))
  }
}