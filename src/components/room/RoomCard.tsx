import React from 'react'
import { Link } from 'react-router-dom'
import { Room } from '../../types/room'

type Props = {
  room: Room
}

export default function RoomCard({ room }: Props) {
  return (
    <div className="card-surface rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow transform hover:-translate-y-1">
      <div className="relative">
        {room.images && room.images[0] ? (
          <img src={room.images[0]} alt={room.title} className="h-48 sm:h-40 md:h-48 w-full object-cover" />
        ) : (
          <div className="h-48 sm:h-40 md:h-48 w-full bg-[#01322e] flex items-center justify-center text-teal-200">No photo</div>
        )}
        <div className="absolute top-3 left-3 bg-white/6 text-xs text-white px-2 py-1 rounded-full">{room.property_type}</div>
        <div className="absolute top-3 right-3 bg-white/6 text-xs text-white px-2 py-1 rounded-full">{room.tenant_preference}</div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate text-white">{room.title}</h3>
        <p className="text-sm text-teal-200 truncate">{room.location}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-accent font-bold">${room.rent}/mo</span>
          <Link to={`/rooms/${room.id}`} className="text-sm text-teal-200">Details</Link>
        </div>
      </div>
    </div>
  )
}
