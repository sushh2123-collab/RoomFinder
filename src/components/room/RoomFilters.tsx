import React, { useState } from 'react'

type Props = {
  onFilter: (params?: { location?: string; minPrice?: number; maxPrice?: number }) => void
}

export default function RoomFilters({ onFilter }: Props) {
  const [location, setLocation] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    onFilter({
      location: location.trim() || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    })
  }

  const clearFilters = () => {
    setLocation('')
    setMinPrice('')
    setMaxPrice('')
    onFilter()
  }

  return (
    <form className="card-surface p-4 rounded-md shadow-sm" onSubmit={submitSearch}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="px-3 py-2 border rounded bg-white/5 text-white placeholder-gray-400" />
        <input placeholder="Min price" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="px-3 py-2 border rounded bg-white/5 text-white placeholder-gray-400" />
        <input placeholder="Max price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="px-3 py-2 border rounded bg-white/5 text-white placeholder-gray-400" />
      </div>
      <div className="flex gap-2 justify-end mt-3">
        <button type="button" onClick={clearFilters} className="px-3 py-2 rounded bg-white/5 text-white">Show all</button>
        <button type="submit" className="px-3 py-2 rounded glow-cta text-white">Search</button>
      </div>
    </form>
  )
}
