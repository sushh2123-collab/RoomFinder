import React from 'react'
import { Link } from 'react-router-dom'
import { useRooms } from '../../hooks/useRooms'
import RoomCard from '../../components/room/RoomCard'
import hero from './hero.jpeg'
import hero1 from './hero1.jpeg'
import hero2 from './hero2.jpeg'
import hero3 from './hero3.jpeg'

export default function Home() {
  const { rooms, loading } = useRooms()

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#02131a] opacity-80"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white">
              More comfort, fewer compromises
            </h1>
            <p className="mt-4 text-lg text-teal-200">
              Discover verified rooms in friendly neighborhoods. Fast search, clear pricing, and direct owner contact — all designed around your needs.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Link to="/rooms" className="px-6 py-3 rounded shadow glow-cta text-sm font-semibold">Browse rooms</Link>
              <Link to="/owner/register" className="px-6 py-3 rounded secondary-cta border border-white/8 text-sm">List a room</Link>
            </div>

            <div className="mt-10 carousel">
              <div className="carousel-track">
                <div className="carousel-item"><img src={hero} alt="c1" /></div>
                <div className="carousel-item"><img src={hero1} alt="c2" /></div>
                <div className="carousel-item"><img src={hero2} alt="c3" /></div>
                <div className="carousel-item"><img src={hero3} alt="c4" /></div>
                <div className="carousel-item"><img src={hero} alt="c1b" /></div>
                <div className="carousel-item"><img src={hero1} alt="c2b" /></div>
                <div className="carousel-item"><img src={hero2} alt="c3b" /></div>
                <div className="carousel-item"><img src={hero3} alt="c4b" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Latest listings</h2>
          <Link to="/rooms" className="text-primary">See all</Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading rooms…</div>
        ) : (
          rooms.length === 0 ? (
            <div className="text-center text-gray-600 py-12">No rooms yet — add your first listing.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rooms.slice(0,6).map((r) => <RoomCard key={r.id} room={r} />)}
            </div>
          )
        )}
      </section>

      <section className="bg-gradient-to-r from-[#02131a] via-[#022f2c] to-[#001f21] py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-white mb-6">Why Room Finder stands out</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="flex-none z-10">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-teal-900 font-bold">1</div>
              </div>
              <div className="flex-1 card-surface p-4 rounded-md shadow">
                <h3 className="font-semibold text-white">Verified owners</h3>
                <p className="text-teal-200 mt-2">Listings are posted by verified owners. Profiles include ID verification, ratings and trust indicators to make renting safer.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-none z-10">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-teal-900 font-bold">2</div>
              </div>
              <div className="flex-1 card-surface p-4 rounded-md shadow">
                <h3 className="font-semibold text-white">Neighborhood insights</h3>
                <p className="text-teal-200 mt-2">Contextual information about neighborhoods, transport links, and nearby facilities so you can pick the perfect location.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-none z-10">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-teal-900 font-bold">3</div>
              </div>
              <div className="flex-1 card-surface p-4 rounded-md shadow">
                <h3 className="font-semibold text-white">Flexible leases</h3>
                <p className="text-teal-200 mt-2">Short or long-term options, clear terms, and flexible move-in dates to match your needs.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-none z-10">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-teal-900 font-bold">4</div>
              </div>
              <div className="flex-1 card-surface p-4 rounded-md shadow">
                <h3 className="font-semibold text-white">Instant messaging</h3>
                <p className="text-teal-200 mt-2">Chat directly with owners using the in-app messaging feature to schedule visits and ask quick questions.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white/5 rounded-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold">Ready to explore?</h3>
              <p className="text-teal-200">Browse curated neighborhoods, save searches, and contact owners directly — all in one place.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/rooms" className="glow-cta px-4 py-2 rounded">Browse rooms</Link>
              <Link to="/rooms" className="secondary-cta px-4 py-2 rounded border">Explore neighborhoods</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
