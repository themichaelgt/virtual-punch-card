/**
 * Database Type Definitions
 *
 * These types represent the Supabase database schema.
 * Manually defined based on the database structure.
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id'>>
      }
      establishments: {
        Row: Establishment
        Insert: Omit<Establishment, 'id' | 'created_at'>
        Update: Partial<Omit<Establishment, 'id'>>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at'>
        Update: Partial<Omit<Event, 'id'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'>
        Update: Partial<Omit<Tag, 'id'>>
      }
      cards: {
        Row: Card
        Insert: Omit<Card, 'id' | 'created_at'>
        Update: Partial<Omit<Card, 'id'>>
      }
      punches: {
        Row: Punch
        Insert: Omit<Punch, 'id' | 'created_at'>
        Update: Partial<Omit<Punch, 'id'>>
      }
      rewards: {
        Row: Reward
        Insert: Omit<Reward, 'id' | 'created_at'>
        Update: Partial<Omit<Reward, 'id'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id'>>
      }
    }
  }
}

// Table Row Types

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Establishment {
  id: string
  owner_id: string
  name: string
  description: string | null
  address: string | null
  created_at: string
}

export interface Event {
  id: string
  establishment_id: string
  name: string
  description: string | null
  rules_json: EventRules
  status: string
  created_at: string
}

export interface EventRules {
  target_punches: number
  cooldown_hours?: number
  max_punches_per_day?: number
  allow_repeat?: boolean
}

export interface Tag {
  id: string
  token: string
  activation_code: string
  status: 'inactive' | 'active' | 'lost' | 'damaged'
  event_id: string | null
  order_id: string | null
  claimed_by: string | null
  claimed_at: string | null
  created_at: string
}

export interface Card {
  id: string
  user_id: string
  event_id: string
  current_punches: number
  status: 'active' | 'completed' | 'expired'
  created_at: string
  completed_at: string | null
}

export interface Punch {
  id: string
  card_id: string
  user_id: string
  event_id: string
  tag_id: string
  location: {
    latitude: number
    longitude: number
  } | null
  created_at: string
}

export interface Reward {
  id: string
  card_id: string
  event_id: string
  user_id: string
  code: string
  redeemed: boolean
  created_at: string
  redeemed_at: string | null
}

export interface Order {
  id: string
  establishment_id: string
  quantity: number
  status: 'pending' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_zip: string
  shipping_country: string
  created_at: string
  fulfilled_at: string | null
  shipped_at: string | null
}
