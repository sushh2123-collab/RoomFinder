import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { signIn } from '../../lib/auth'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div className="max-w-md mx-auto card-surface p-6 rounded-md shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Login</h2>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Logging...' : 'Login'}</Button>
        </div>
      </form>
      <div className="text-sm text-teal-200 mt-4">Don't have an account? <a href="/register" className="text-white">Register</a></div>
    </div>
  )
}
