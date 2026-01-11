import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Home from '../pages/public/Home'
import Rooms from '../pages/public/Rooms'
import RoomDetails from '../pages/public/RoomDetails'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import OwnerLogin from '../pages/auth/OwnerLogin'
import OwnerRegister from '../pages/auth/OwnerRegister'
import Dashboard from '../pages/owner/Dashboard'
import AddRoom from '../pages/owner/AddRoom'
import EditRoom from '../pages/owner/EditRoom'
import ProtectedRoute from './ProtectedRoute'
import SeedImages from '../pages/admin/SeedImages'
import Diagnostics from '../pages/admin/Diagnostics'

export default function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/register" element={<OwnerRegister />} />

          <Route path="/admin/seed-images" element={<ProtectedRoute requiredRole="owner"><SeedImages /></ProtectedRoute>} />
          <Route path="/admin/diagnostics" element={<Diagnostics />} />

          <Route path="/owner/dashboard" element={<ProtectedRoute requiredRole="owner"><Dashboard /></ProtectedRoute>} />
          <Route path="/owner/add-room" element={<ProtectedRoute requiredRole="owner"><AddRoom /></ProtectedRoute>} />
          <Route path="/owner/edit-room/:id" element={<ProtectedRoute requiredRole="owner"><EditRoom /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
