import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { signUp } from '../../lib/auth'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function OwnerRegister() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email || !password) return setError('Email and password are required')
    setLoading(true)
    let res
    try {
      res = await signUp(email, password)
    } catch (ex: any) {
      console.error('Sign up exception', ex)
      setError(ex?.message ?? String(ex))
      setLoading(false)
      return
    } finally {
      setLoading(false)
    }

    if (res?.error) return setError(res.error.message)

    // if the user is returned immediately (might be the case if confirmations are disabled)
    const userId = (res.data as any)?.user?.id
    if (userId) {
      // try to create profile with role owner; if it fails, just log
      const { error: profileError } = await supabase.from('profiles').insert({ id: userId, role: 'owner' })
      if (profileError) console.error('Profile create error:', profileError)
      // if the user was created and logged in immediately, navigate to dashboard
      navigate('/owner/dashboard')
      return
    }

    setMessage('Registration successful. Check your email for a confirmation link. After confirming, login at /owner/login')
    navigate('/owner/login')
  }

  return (
    <div className="max-w-md mx-auto bg-[#071028] p-6 rounded-md shadow">
      <h2 className="text-2xl font-semibold mb-4 text-white">Owner Register</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {message && <div className="text-teal-200 mb-2">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
        </div>
      </form>
      <div className="text-sm text-teal-200 mt-4">Already have an owner account? <Link to="/owner/login" className="text-white">Owner Login</Link></div>
    </div>
  ) 
}
