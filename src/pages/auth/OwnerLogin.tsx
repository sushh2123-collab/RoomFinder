import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { signIn } from '../../lib/auth'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function OwnerLogin() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  // if already logged in, redirect to dashboard (wait for auth to finish loading)
  React.useEffect(() => {
    if (!loading && user) navigate('/owner/dashboard')
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await signIn(email, password)
    setSubmitting(false)
    if (res.error) return setError(res.error.message)

    // no additional owner verification required — any authenticated user can access owner dashboard
    navigate('/owner/dashboard')
  }

  return (
    <div className="max-w-md mx-auto bg-[#071028] p-6 rounded-md shadow">
      <h2 className="text-2xl font-semibold mb-4 text-white">Owner Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>{submitting ? 'Logging...' : 'Login'}</Button>
        </div>
      </form>
      <div className="text-sm text-teal-200 mt-4">Don't have an owner account? <Link to="/owner/register" className="text-white">Register as Owner</Link></div>
    </div>
  ) 
}
