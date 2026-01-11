import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#075e54]">
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-teal-100">
        <div>
          <h4 className="font-semibold text-white">Room Finder</h4>
          <p className="text-sm text-teal-100 mt-2">
            Find rooms, list your property, and connect with owners nearby.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Resources</h4>
          <ul className="mt-2 text-sm text-teal-100 space-y-1">
            <li>Help</li>
            <li>Contact</li>
            <li>Privacy</li>
          </ul>
        </div>

        <div className="text-sm text-teal-100 text-right md:text-left">
          <div>© {new Date().getFullYear()} Room Finder</div>
        </div>
      </div>
    </footer>
  )
}
