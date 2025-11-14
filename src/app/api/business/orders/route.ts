import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { rateLimiters } from '@/lib/rate-limit'
import { createOrderSchema, formatValidationError } from '@/lib/validations'

// GET - List all orders for the authenticated business
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.generous(request)
    if (rateLimitResult) return rateLimitResult

    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
 console.log('User from auth:', user?.id, user?.email)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get establishment for this user
    const { data: establishment, error: estError } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()  // Changed from .single() to .maybeSingle()

    console.log('Establishment query result:', establishment, estError) // Add logging

    if (estError) {
      console.log('Establishment error:', estError)
      return NextResponse.json({ error: estError.message }, { status: 500 })
    }

    if (!establishment) {
      console.log('No establishment found for user:', user.id)
      return NextResponse.json({ error: 'No establishment found' }, { status: 404 })
    }

    // Get all orders for this establishment
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('establishment_id', establishment.id)
      .order('created_at', { ascending: false })

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (stricter for order creation)
    const rateLimitResult = await rateLimiters.strict(request)
    if (rateLimitResult) return rateLimitResult

    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get establishment for this user
    const { data: establishment, error: estError } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (estError || !establishment) {
      return NextResponse.json({ error: 'No establishment found' }, { status: 404 })
    }

    // Validate request body
    const body = await request.json()
    const validation = createOrderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const { quantity, shipping_address, notes } = validation.data

    // Calculate price
    const priceMap: { [key: number]: number } = { 3: 10, 5: 15, 10: 20 }
    const total_price = priceMap[quantity]

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        establishment_id: establishment.id,
        quantity,
        shipping_address_json: shipping_address,
        notes: notes || null,
        total_price,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}