import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Room } from '../types/room'

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRooms = async (filters?: { location?: string; minPrice?: number; maxPrice?: number }) => {
    setLoading(true)
    // include related images from room_images
    let query = supabase.from('rooms').select('*, room_images(image_url)')
    if (filters?.location) query = query.ilike('location', `%${filters.location}%`)
    if (filters?.minPrice) query = query.gte('rent', filters.minPrice)
    if (filters?.maxPrice) query = query.lte('rent', filters.maxPrice)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      // fallback to local dev rooms if server call fails
      try {
        const local = JSON.parse(localStorage.getItem('dev_rooms') || '[]')
        setRooms(local as Room[])
      } catch (e) {
        setRooms([])
      }
    } else {
      // map related room_images to images array
      const mapped = (data ?? []).map((r: any) => {
        const imgsFromRelation = (r.room_images ?? []).map((i: any) => i.image_url)
        return { ...r, images: imgsFromRelation.length ? imgsFromRelation : (r.images ?? []) }
      })
      // set only server-provided rooms. Do not automatically merge local dev_rooms
      // to avoid showing placeholder/demo items that aren't actually in the database.
      setRooms(mapped as Room[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRooms()
    // real-time subscription could be added later
  }, [])

  return { rooms, loading, fetchRooms }
}
