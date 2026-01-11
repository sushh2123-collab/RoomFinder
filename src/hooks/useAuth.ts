import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '../types/user'

// simple in-memory rate limiter to avoid spamming profile requests
const lastRoleFetch = new Map<string, number>()

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchRole = async (userId: string) => {
      try {
        const now = Date.now()
        const last = lastRoleFetch.get(userId) ?? 0
        // skip if fetched less than 3s ago
        if (now - last < 3000) return null
        lastRoleFetch.set(userId, now)

        // use maybeSingle so missing rows don't throw
        const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
        if (error) {
          console.error('profiles select error:', error)
          return null
        }
        return (data as any)?.role ?? null
      } catch (e: any) {
        console.error('fetchRole error:', e?.message ?? e)
        return null
      }
    }

    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        if (data.session?.user) {
          const role = await fetchRole(data.session.user.id)
          setUser({ id: data.session.user.id, email: data.session.user.email ?? null, role })
        } else {
          setUser(null)
        }
      } catch (e: any) {
        console.error('getSession error:', e)
        // if session refresh failed (invalid refresh token), clear any stored session
        try {
          await supabase.auth.signOut()
        } catch (se) {
          console.error('signOut after getSession error failed:', se)
        }
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // clear bad refresh sessions to avoid repeated token-refresh errors
      if (event === 'TOKEN_REFRESH_FAILED') {
        ;(async () => {
          try {
            await supabase.auth.signOut()
          } catch (e) {
            console.error('signOut after token refresh failed:', e)
          }
          setUser(null)
          setLoading(false)
        })()
        return
      }

      if (session?.user) {
        ;(async () => {
          try {
            const role = await fetchRole(session.user.id)
            setUser({ id: session.user.id, email: session.user.email ?? null, role })
          } catch (e: any) {
            console.error('onAuthStateChange fetchRole error', e)
            setUser({ id: session.user.id, email: session.user.email ?? null, role: null })
          }
          setLoading(false)
        })()
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      try {
        data.subscription.unsubscribe()
      } catch (e) {
        // ignore
      }
    }
  }, [])

  return { user, loading }
}
