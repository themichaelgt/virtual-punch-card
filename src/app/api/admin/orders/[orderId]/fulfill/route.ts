import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// Helper function to generate random alphanumeric string
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Helper function to generate UUID (simple version)
function generateUUID(): string {
  return crypto.randomUUID()
}

// POST - Fulfill order and generate activation codes
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (you'll need to add this check)
    // For now, we'll skip it since RLS is disabled

    const params = await context.params
    const orderId = params.orderId

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, establishments(id, name)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order already fulfilled' }, { status: 400 })
    }

    // Generate activation codes and tags
    const tags = []

    for (let i = 0; i < order.quantity; i++) {
      const token = generateUUID()
      const activationCode = 'VPC' + generateRandomString(8)

      tags.push({
        token: token,
        activation_code: activationCode,
        purchased_by_establishment_id: order.establishment_id,
        order_id: orderId,
        status: 'inactive',
        label: `Tag ${i + 1}`,
        registered_at: null,
        claimed_at: null
      })
    }

    // Insert all tags
    const { data: insertedTags, error: tagError } = await supabase
      .from('tags')
      .insert(tags)
      .select('token, activation_code, label')

    if (tagError) {
      return NextResponse.json({ error: tagError.message }, { status: 500 })
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        fulfilled_by: user.id
      })
      .eq('id', orderId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tags: insertedTags, // Return both token and activation_code
      order: {
        id: order.id,
        establishment_name: order.establishments?.name,
        quantity: order.quantity
      }
    })
  } catch (error) {
    console.error('Error fulfilling order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}