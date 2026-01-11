import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'
import logo from './room.jpg'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (e) {
      console.error('Logout error', e)
    }
    navigate('/')
  }

  const handleClearAuth = async () => {
    try {
      // try a normal sign out first
      await signOut()
    } catch (e) {
      console.error('signOut failed during clear:', e)
    }
    try {
      // clear storage keys used by Supabase
      localStorage.clear()
      sessionStorage.clear()
      // attempt to clear cookies by setting expires
      document.cookie.split(';').forEach(function(c) { 
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      })
    } catch (e) {
      console.error('clear storage failed', e)
    }
    // reload app
    window.location.reload()
  }

  return (
    <nav className="bg-[#02131a] border-b border-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Room Finder" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-lg font-semibold text-white">Room Finder</span>
        </Link>

        <div className="space-x-3 flex items-center">
          <Link to="/rooms" className="text-sm text-teal-200 hover:text-white">Rooms</Link>

          {/* Diagnostics link removed from navbar for production */}

          <Link to={user ? '/owner/dashboard' : '/owner/login'} className="text-sm text-teal-200 hover:text-white">Owner</Link>

          {user ? (
            <>
              <span className="text-sm text-teal-200">{user.email ?? 'Account'}</span>
              <button onClick={handleLogout} className="text-sm text-teal-200 hover:text-white">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-teal-200">Login</Link>
              <Link to="/register" className="text-sm text-white font-semibold px-3 py-2 rounded glow-cta">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
