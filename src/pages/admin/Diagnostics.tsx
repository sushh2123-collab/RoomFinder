import React from 'react'
import { checkSupabaseDiagnostics } from '../../lib/supabaseDiagnostics'

export default function Diagnostics() {
  const [result, setResult] = React.useState<any | null>(null)
  const [running, setRunning] = React.useState(false)

  const run = async () => {
    setRunning(true)
    try {
      const res = await checkSupabaseDiagnostics()
      setResult(res)
    } catch (e: any) {
      setResult({ errors: [e?.message ?? String(e)] })
    } finally {
      setRunning(false)
    }
  }

  React.useEffect(() => { run() }, [])

  const masked = (v?: string) => {
    if (!v) return 'MISSING'
    if (v.length > 16) return `${v.slice(0, 8)}...${v.slice(-6)}`
    return v
  }

  return (
    <div className="max-w-3xl mx-auto card-surface p-6 rounded-md shadow text-white">
      <h2 className="text-2xl font-semibold mb-4">Supabase Diagnostics</h2>
      <p className="text-teal-200 mb-4">Quick checks for environment, auth session, and storage bucket availability.</p>

      <div className="mb-4">
        <div><strong>VITE_SUPABASE_URL:</strong> {masked(import.meta.env.VITE_SUPABASE_URL)}</div>
        <div><strong>VITE_SUPABASE_ANON_KEY:</strong> {masked(import.meta.env.VITE_SUPABASE_ANON_KEY)}</div>
      </div>

      <div className="mb-4">
        <button disabled={running} onClick={run} className="glow-cta px-4 py-2 rounded">{running ? 'Checking…' : 'Run diagnostics'}</button>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold">Results</h3>
          <pre className="mt-2 p-3 bg-white/5 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="mt-4 text-teal-200">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc ml-6 mt-2">
          <li>If env values are <em>MISSING</em>, add them to <code>.env</code> and restart the dev server.</li>
          <li>If <code>storageBucketExists</code> is false, create a bucket named <code>room-images</code> in Supabase Console → Storage.</li>
          <li>If auth token or profile requests fail (400/406), ensure your keys match the Supabase project and check RLS policies.</li>
        </ul>
      </div>
    </div>
  )
}
