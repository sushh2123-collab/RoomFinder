import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type Props = {
  children: React.ReactElement
  requiredRole?: 'owner' | 'user'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, loading } = useAuth()

  if (loading) return <div />
  if (!user) return <Navigate to={requiredRole === 'owner' ? '/owner/dashboard' : '/login'} replace />
  // NOTE: owner access does not require explicit profile.role verification — any authenticated user can access owner routes
  if (requiredRole && requiredRole !== 'owner' && user.role !== requiredRole) return <Navigate to={requiredRole === 'owner' ? '/owner/dashboard' : '/login'} replace />
  return children
}
