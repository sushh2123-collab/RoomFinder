import { supabase } from './supabase'

export async function signUp(email: string, password: string) {
  const res = await supabase.auth.signUp({ email, password })
  return res
}

export async function signIn(email: string, password: string) {
  const res = await supabase.auth.signInWithPassword({ email, password })
  return res
}

export async function signOut() {
  const res = await supabase.auth.signOut()
  return res
}
