import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params

    // Get tags for this order
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('token, activation_code, label, status')
      .eq('order_id', params.orderId)
      .order('label')

    if (tagsError) {
      return NextResponse.json({ error: tagsError.message }, { status: 500 })
    }

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error fetching order tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

