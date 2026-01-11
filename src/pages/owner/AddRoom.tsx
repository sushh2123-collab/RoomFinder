import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { supabase } from '../../lib/supabase'
import { checkSupabaseDiagnostics } from '../../lib/supabaseDiagnostics'
import { useAuth } from '../../hooks/useAuth'

export default function AddRoom() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [rent, setRent] = useState<number | ''>('')
  const [propertyType, setPropertyType] = useState('apartment')
  const [tenantPreference, setTenantPreference] = useState('any')
  const [contact, setContact] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [diag, setDiag] = useState<{ storageBucketExists?: boolean; session?: any; errors?: string[] } | null>(null)

  React.useEffect(() => {
    // run a quick diagnostic (dev-friendly) to check storage bucket / session so we can show errors early
    let mounted = true
    ;(async () => {
      try {
        const { checkSupabaseDiagnostics } = await import('../../lib/supabaseDiagnostics')
        const res = await checkSupabaseDiagnostics()
        if (!mounted) return
        setDiag({ storageBucketExists: res.storageBucketExists, session: res.session, errors: res.errors })
        if (!res.storageBucketExists) setErrorMessage(`Storage bucket 'room-images' not found in Supabase project. Create a bucket named 'room-images' in Supabase Console.`)
      } catch (e: any) {
        console.error('Diagnostics error:', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    if (!user) return setErrorMessage('Please login')
    // owner role check is optional; keep only as an informative message
    if (user.role && user.role !== 'owner') setErrorMessage('Only owners should add rooms; if you have an owner account, switch to it.')
    if (diag && diag.storageBucketExists === false) {
      // allow creating the room even when the storage bucket is missing — use placeholder images so the listing shows up
      setErrorMessage("Note: storage bucket 'room-images' not found — using placeholder images instead of uploads.")
    }

    setLoading(true)

    // upload images
    const imageUrls: string[] = []
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
          try {
          // if bucket missing, skip actual upload and use a placeholder image
          if (diag && diag.storageBucketExists === false) {
            const placeholder = `https://picsum.photos/seed/${user.id}_${Date.now()}_${i}/800/600`
            imageUrls.push(placeholder)
            continue
          }

          const path = `${user.id}/${Date.now()}_${file.name}`
          const { error: uploadError } = await supabase.storage.from('room-images').upload(path, file)
          if (uploadError) {
            console.error('Upload error:', uploadError)
            // fallback to placeholder so room creation still succeeds
            const placeholder = `https://picsum.photos/seed/${user.id}_${Date.now()}_${i}/800/600`
            imageUrls.push(placeholder)
            setErrorMessage(`Image upload failed: ${uploadError.message}. Using placeholder image.`)
            continue
          }
          const { data } = supabase.storage.from('room-images').getPublicUrl(path)
          imageUrls.push(data.publicUrl)
        } catch (err: any) {
          console.error('Upload exception', err)
          const placeholder = `https://picsum.photos/seed/${user.id}_${Date.now()}_${i}/800/600`
          imageUrls.push(placeholder)
          setErrorMessage(`Image upload exception: ${err?.message ?? String(err)}. Using placeholder image.`)
        }
      }
    }

    try {
      // insert room and return id
      // Insert room (do not include an `images` column — images are stored in `room_images` table)
      const { data: inserted, error } = await supabase.from('rooms').insert({
        title,
        location,
        rent: Number(rent),
        property_type: propertyType,
        tenant_preference: tenantPreference,
        contact_number: contact,
        owner_id: user.id,
      }).select('id').single()

      if (error) {
        console.error('Room insert error:', error)
        setErrorMessage(`Failed to create room: ${error.message}`)
        // fallback: save room locally so it appears in the UI for demo purposes
        try {
          const local = JSON.parse(localStorage.getItem('dev_rooms') || '[]')
          const lr = { id: crypto.randomUUID(), title, location, rent: Number(rent), property_type: propertyType, tenant_preference: tenantPreference, contact_number: contact, images: imageUrls, owner_id: user.id }
          local.push(lr)
          localStorage.setItem('dev_rooms', JSON.stringify(local))
          setSuccessMessage('Room could not be saved to server; saved locally for demo.')
        } catch (lsErr: any) {
          console.error('Local save failed:', lsErr)
          setErrorMessage(`Failed to persist room locally: ${lsErr?.message ?? String(lsErr)}`)
        }
        setLoading(false)
        // since server insert failed, do not attempt to create `room_images` rows that reference a missing room id
        return
      }

      // if images were uploaded, also create rows in room_images so listing queries pick them up
      if (imageUrls.length > 0 && inserted && (inserted as any).id) {
        const imgs = imageUrls.map((u) => ({ id: crypto.randomUUID(), room_id: (inserted as any).id, image_url: u }))
        const { error: iErr } = await supabase.from('room_images').insert(imgs)
        if (iErr) {
          console.error('room_images insert', iErr)
          // do not block the user; show message
          setErrorMessage(`Room created but adding images failed: ${iErr.message}`)
        }
      }

      setLoading(false)
      navigate('/owner/dashboard')
    } catch (e: any) {
      console.error('Add room exception:', e)
      setErrorMessage(`Unexpected error creating room: ${e?.message ?? String(e)}`)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto card-surface p-6 rounded-md shadow">
      <h2 className="text-2xl font-semibold mb-4 text-white">Add room</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <Input label="Rent" type="number" value={rent === '' ? '' : String(rent)} onChange={(e) => setRent(e.target.value ? Number(e.target.value) : '')} required />
        <Select label="Property" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="studio">Studio</option>
        </Select>
        <Select label="Tenant preference" value={tenantPreference} onChange={(e) => setTenantPreference(e.target.value)}>
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
        <Input label="Contact number" value={contact} onChange={(e) => setContact(e.target.value)} required />
        <div>
          <label className="block text-sm font-medium text-teal-200">Images</label>
          <input type="file" className="mt-1 block text-white" multiple onChange={(e) => setFiles(e.target.files)} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
        {errorMessage && <div className="text-red-400 mt-2">{errorMessage}</div>}
        {successMessage && <div className="text-green-400 mt-2">{successMessage}</div>}
      </form>
    </div>
  ) 
}
