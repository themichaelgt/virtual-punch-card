/**
 * Application Type Definitions
 *
 * These types are used throughout the application for API responses,
 * component props, and business logic.
 */

import { Event, Establishment, Tag, Card, Reward } from './database'

// API Response Types

export interface ApiResponse<T = void> {
  status: 'success' | 'error'
  message?: string
  data?: T
}

export interface PunchResponse {
  status: 'punched' | 'completed' | 'error'
  progress?: number
  remaining?: number
  reward?: { code: string }
  message?: string
  next_eligible_at?: string
}

export interface ValidationError {
  field: string
  message: string
  next_eligible_at?: string
}

// Extended Types with Relations

export interface EventWithEstablishment extends Event {
  establishments: Establishment
}

export interface CardWithDetails extends Card {
  event: {
    id: string
    name: string
    description: string
  }
  establishment: {
    id: string
    name: string
  }
}

export interface RewardWithDetails extends Reward {
  event: {
    id: string
    name: string
  }
  establishment: {
    id: string
    name: string
  }
}

export interface TagWithEvent extends Tag {
  events?: Event | null
}

export interface OrderWithTags {
  id: string
  establishment_id: string
  quantity: number
  status: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_zip: string
  shipping_country: string
  created_at: string
  fulfilled_at: string | null
  shipped_at: string | null
  tags?: Tag[]
}

// Component Props Types

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export interface ConfirmDialogOptions {
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger'
}

export interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: () => void
  establishmentId: string
}

export interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventUpdated: () => void
  event: Event
}

export interface TagManagementModalProps {
  isOpen: boolean
  onClose: () => void
  event: EventWithEstablishment
  onTagsUpdated: () => void
}

export interface ClaimTagsModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  onTagsClaimed: () => void
}

// Re-export database types for convenience
export type {
  User,
  Establishment,
  Event,
  EventRules,
  Tag,
  Card,
  Punch,
  Reward,
  Order
} from './database'
