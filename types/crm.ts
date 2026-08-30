import type { PaginatedList } from './api'

export type ContactMessageStatus = 'new' | 'read' | 'archived'

export interface ContactMessage {
  _id: string
  name: string
  email: string
  message: string
  status: ContactMessageStatus
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  coffeeId: string
  slug: string
  name: string
  weight: 250 | 500 | 1000
  quantity: number
  price: number
}

export interface OrderCustomer {
  name: string
  phone: string
  email: string
  city: string
  address: string
  comment?: string
}

export interface Order {
  _id: string
  items: OrderItem[]
  customer: OrderCustomer
  totalPrice: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface CoffeeLocalizedContent {
  name?: string
  country: string
  region: string
  variety?: string
  process: string
  altitude?: string
  description: string
  story: string
  flavorNotes: string[]
}

export interface Coffee {
  _id: string
  name: string
  slug: string
  country: string
  region: string
  variety: string
  process: string
  altitude: string
  description: string
  story: string
  flavorNotes: string[]
  price: number
  weights: Array<250 | 500 | 1000>
  image: string
  gallery: string[]
  stock: number
  translations?: {
    en?: CoffeeLocalizedContent
  }
  createdAt?: string
  updatedAt?: string
}

export interface CoffeeTextFields {
  name: string
  country: string
  region: string
  variety: string
  process: string
  altitude: string
  description: string
  story: string
  flavorNotes: string[]
}

export interface CreateCoffeeInput extends CoffeeTextFields {
  slug: string
  price: number
  stock: number
  weights: Array<250 | 500 | 1000>
  image: string
}

export type ContactList = PaginatedList<ContactMessage>
export type OrderList = PaginatedList<Order>
