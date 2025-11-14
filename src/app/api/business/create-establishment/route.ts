// src/app/api/business/create-establishment/route.ts
import { createServiceSupabase } from '@/lib/supabase'
import { createEstablishmentSchema, formatValidationError } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createServiceSupabase()

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json()
    const validation = createEstablishmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        message: formatValidationError(validation.error)
      }, { status: 400 })
    }

    const { name, ownerName, phone, address, userEmail, userId } = validation.data

    // Ensure user exists in our users table
    const { error: userUpsertError } = await supabase
      .from('users')
      .upsert({ 
        id: userId, 
        email: userEmail,
        name: ownerName
      }, { 
        onConflict: 'id' 
      })

    if (userUpsertError) {
      console.error('User upsert error:', userUpsertError)
      return NextResponse.json({ 
        message: 'Failed to create user account' 
      }, { status: 500 })
    }

    // Check if user already has an establishment
    const { data: existingEstablishment } = await supabase
      .from('establishments')
      .select('id')
      .eq('owner_user_id', userId)
      .single()

    if (existingEstablishment) {
      return NextResponse.json({ 
        message: 'You already have a business account',
        establishment_id: existingEstablishment.id
      }, { status: 200 })
    }

    // Create establishment
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .insert({
        owner_user_id: userId,
        name: name,
        profile_json: {
          owner_name: ownerName,
          phone: phone || null,
          address: address || null,
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (establishmentError) {
      console.error('Establishment creation error:', establishmentError)
      return NextResponse.json({ 
        message: 'Failed to create business account' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Business account created successfully',
      establishment: {
        id: establishment.id,
        name: establishment.name,
        owner_name: ownerName
      }
    })

  } catch (error) {
    console.error('Create establishment error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}