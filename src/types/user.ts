export type User = {
  id: string
  email: string | null
  role?: 'owner' | 'user' | null
} 
