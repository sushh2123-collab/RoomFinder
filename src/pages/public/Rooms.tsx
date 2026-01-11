import React from 'react'
import { useRooms } from '../../hooks/useRooms'
import RoomCard from '../../components/room/RoomCard'
import RoomFilters from '../../components/room/RoomFilters'
import Loader from '../../components/common/Loader'

export default function Rooms() {
  const { rooms, loading, fetchRooms } = useRooms()

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <div className="card-surface p-4 rounded">
          <RoomFilters onFilter={(params) => fetchRooms(params)} />
        </div>
      </div>
      <div className="md:col-span-3">
        {loading ? <Loader /> : (
          rooms.length === 0 ? (
            <div className="text-center text-gray-600 py-20">No rooms found — try adjusting filters or add some rooms.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((r) => <RoomCard key={r.id} room={r} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}
