export type Room = {
  id: string
  title: string
  location: string
  rent: number
  property_type: 'apartment' | 'house' | 'studio' | string
  tenant_preference: 'male' | 'female' | 'any' | string
  contact_number: string
  images: string[]
  owner_id: string
  created_at?: string
}
