import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// GET - List all orders (admin only)
export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get all orders with establishment info
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        establishments (
          id,
          name,
          profile_json
        )
      `)
      .order('created_at', { ascending: false })

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}