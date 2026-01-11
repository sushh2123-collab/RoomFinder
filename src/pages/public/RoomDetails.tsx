import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Room } from '../../types/room'
import Loader from '../../components/common/Loader'
import RoomGallery from '../../components/room/RoomGallery'

export default function RoomDetails() {
  const { id } = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRoom() {
      if (!id) return
      const { data, error } = await supabase.from('rooms').select('*, room_images(image_url)').eq('id', id).single()
      if (error) {
        console.error(error)
        setRoom(null)
      } else {
        const r = data as any
        const imgsFromRelation = (r.room_images ?? []).map((i: any) => i.image_url)
        const mapped = { ...r, images: imgsFromRelation.length ? imgsFromRelation : (r.images ?? []) }
        setRoom(mapped as Room)
      }
      setLoading(false)
    }
    fetchRoom()
  }, [id])

  if (loading) return <Loader />
  if (!room) return <div>Room not found</div>

  return (
    <div className="max-w-4xl mx-auto card-surface p-6 rounded-md shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {room.images && room.images.length > 0 ? (
            <div className="rounded-md overflow-hidden shadow-lg">
              <img src={room.images[0]} alt={room.title} className="w-full h-72 md:h-96 object-cover" />
            </div>
          ) : (
            <div className="rounded-md bg-[#01322e] h-72 md:h-96 flex items-center justify-center text-white">No photo</div>
          )}

          {room.images && room.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {room.images.slice(1,5).map((img) => (
                <img key={img} src={img} alt="thumb" className="h-20 w-full object-cover rounded" />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-tight">{room.title}</h2>
            <p className="mt-2 text-teal-200">{room.location}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-white/10 text-white text-sm">{room.property_type}</span>
              <span className="px-3 py-1 rounded bg-white/10 text-white text-sm">{room.tenant_preference}</span>
            </div>

            <div className="mt-6">
              <div className="text-sm text-teal-200">Rent</div>
              <div className="text-2xl font-bold text-accent">${room.rent}<span className="text-sm font-normal">/mo</span></div>
            </div>

            <div className="mt-6 text-teal-100 space-y-2">
              <p><strong>Contact:</strong> <a href={`tel:${room.contact_number}`} className="text-white underline">{room.contact_number}</a></p>
            </div>

            <div className="mt-6">
              <p className="text-teal-200">{room.description ?? ''}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <a href={`tel:${room.contact_number}`} className="glow-cta px-4 py-2 rounded">Contact owner</a>
            <button className="px-4 py-2 rounded bg-white/8 text-teal-200">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
