import { supabase } from './supabase'

export async function checkSupabaseDiagnostics() {
  const result: {
    hasEnv: boolean
    session?: any
    storageBucketExists?: boolean
    errors: string[]
  } = { hasEnv: true, errors: [] }

  try {
    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    result.session = sessionData.session ?? null
  } catch (e: any) {
    result.errors.push(`Session fetch failed: ${e?.message ?? String(e)}`)
  }

  try {
    // check if 'rooms' bucket exists by listing objects (limit 1) — will error if bucket missing
    // pass an empty prefix string as first arg; `.list()` expects (prefix?, options?)
    const { data, error } = await supabase.storage.from('room-images').list('', { limit: 1 })
    if (error) {
      result.storageBucketExists = false
      result.errors.push(`Storage check failed: ${error.message}`)
    } else {
      result.storageBucketExists = true
    }
  } catch (e: any) {
    result.storageBucketExists = false
    result.errors.push(`Storage check failed: ${e?.message ?? String(e)}`)
  }

  return result
}
