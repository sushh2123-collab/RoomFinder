import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SeedImages() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSeed = async () => {
    setMessage(null)
    setLoading(true)
    try {
      // find rooms with no images
      const { data: rooms, error } = await supabase.from('rooms').select('id')
      if (error) throw error
      let inserted = 0
      for (const r of rooms ?? []) {
        const { data: imgs } = await supabase.from('room_images').select('id').eq('room_id', r.id).limit(1)
        if (!imgs || imgs.length === 0) {
          const url = `https://picsum.photos/seed/${r.id}/800/600`
          const { error: insErr } = await supabase.from('room_images').insert({ id: crypto.randomUUID(), room_id: r.id, image_url: url })
          if (!insErr) inserted++
        }
      }
      setMessage(`${inserted} images added.`)
    } catch (e: any) {
      console.error(e)
      setMessage('Error seeding images: ' + (e.message ?? String(e)))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto card-surface p-6 rounded-md shadow">
      <h2 className="text-2xl font-semibold text-white mb-4">Seed images for all rooms</h2>
      {message && <div className="text-sm text-teal-200 mb-3">{message}</div>}
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded glow-cta" onClick={handleSeed} disabled={loading}>{loading ? 'Seeding...' : 'Add placeholder images'}</button>
      </div>
    </div>
  )
}
