// src/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

// Server client for API routes (with auth context)
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Client for cached public reads (no auth context)
const publicClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const getCachedEvent = unstable_cache(
  async (eventId: string) => {
    const { data } = await publicClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
    return data
  },
  ['event-by-id'],
  { revalidate: 60, tags: ['events'] }
)

export const getCachedTag = unstable_cache(
  async (token: string) => {
    const { data } = await publicClient
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
    return data
  },
  ['tag-by-token'],
  { revalidate: 60, tags: ['tags'] }
)