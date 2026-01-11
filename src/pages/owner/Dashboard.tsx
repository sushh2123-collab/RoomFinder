import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Room } from '../../types/room'
import Loader from '../../components/common/Loader'
import { useAuth } from '../../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase
        .from('rooms')
        .select('*, room_images(image_url)')
        .eq('owner_id', user.id)

      if (error) console.error(error)

      const mapped = (data ?? []).map((r: any) => {
        const imgsFromRelation = (r.room_images ?? []).map((i: any) => i.image_url)
        return { ...r, images: imgsFromRelation.length ? imgsFromRelation : (r.images ?? []) }
      })

      setRooms(mapped as Room[])
      setLoading(false)
    }
    load()
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this room?')) return
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) console.error(error)
    else setRooms((r) => r.filter((x) => x.id !== id))
  }

  if (!user) return <div>Please login</div>
  if (loading) return <Loader />

  return (
    <div className="min-h-screen p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-white">My Rooms</h2>

        <div className="flex items-center gap-3">
          <Link
            className="bg-gradient-to-r from-[#0F766E] to-accent text-white px-3 py-2 rounded shadow-sm"
            to="/owner/add-room"
          >
            Add room
          </Link>

          <button
            onClick={async () => {
              if (!user) return
              setLoading(true)
              try {
                const { data: roomsData, error: rErr } = await supabase
                  .from('rooms')
                  .select('id')
                  .eq('owner_id', user.id)

                if (rErr) throw rErr

                for (const rm of roomsData ?? []) {
                  const { data: imgs } = await supabase
                    .from('room_images')
                    .select('id')
                    .eq('room_id', rm.id)
                    .limit(1)

                  if (!imgs || imgs.length === 0) {
                    const url = `https://picsum.photos/seed/${rm.id}/800/600`
                    await supabase.from('room_images').insert({
                      id: crypto.randomUUID(),
                      room_id: rm.id,
                      image_url: url,
                    })
                  }
                }

                const { data: updated } = await supabase
                  .from('rooms')
                  .select('*, room_images(image_url)')
                  .eq('owner_id', user.id)

                const mapped = (updated ?? []).map((r: any) => ({
                  ...r,
                  images: (r.room_images ?? []).map((i: any) => i.image_url),
                }))

                setRooms(mapped)
              } catch (e) {
                console.error(e)
              }
              setLoading(false)
            }}
            className="bg-white/6 text-sm px-3 py-2 rounded text-teal-900"
          >
            Populate images
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((r) => (
          <div
            key={r.id}
            className="card-surface p-4 rounded-md shadow flex items-center gap-4 text-white"
          >
            {r.images && r.images[0] ? (
              <img
                src={r.images[0]}
                alt={r.title}
                className="w-28 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-28 h-20 bg-[#01322e] rounded" />
            )}

            <div className="flex-1">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm text-teal-200">{r.location}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <a
                className="text-teal-200 hover:underline"
                href={`/owner/edit-room/${r.id}`}
              >
                Edit
              </a>
              <button
                className="text-red-400"
                onClick={() => handleDelete(r.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
