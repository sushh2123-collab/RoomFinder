import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { signUp } from '../../lib/auth'
import { useAuth } from '../../hooks/useAuth'

export default function Register() {
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
    if (!email || !password) return setError('Email and password are required')
    setLoading(true)
    const res = await signUp(email, password)
    setLoading(false)
    if (res.error) return setError(res.error.message)

    // if the signUp returns a user (email confirmations disabled), create profile and go home (auto-login)
    const userId = (res.data as any)?.user?.id
    if (userId) {
      const { error: profileError } = await (await import('../../lib/supabase')).supabase.from('profiles').insert({ id: userId, role: 'user' })
      if (profileError) console.error('Profile create error:', profileError)
      // navigate to home — auth state should be updated by onAuthStateChange
      navigate('/')
      return
    }

    // otherwise, ask user to check email for confirmation
    navigate('/login')
  }

  return (
    <div className="max-w-md mx-auto bg-[#071028] p-6 rounded-md shadow">
      <h2 className="text-2xl font-semibold mb-4 text-white">Register</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
        </div>
      </form>
      <div className="text-sm text-teal-200 mt-4">Already have an account? <a href="/login" className="text-white">Login</a></div>
    </div>
  ) 
}
