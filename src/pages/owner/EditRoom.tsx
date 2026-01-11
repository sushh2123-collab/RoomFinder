import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Room } from '../../types/room'

export default function EditRoom() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<FileList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [removedImages, setRemovedImages] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      if (!id) return
      // fetch room fields (exclude an `images` column which may not exist)
      const { data, error } = await supabase.from('rooms').select('id, title, location, rent, property_type, tenant_preference, contact_number, owner_id, created_at').eq('id', id).single()
      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // fetch images from room_images table
      const { data: imgs } = await supabase.from('room_images').select('image_url').eq('room_id', id)
      const images = Array.isArray(imgs) ? imgs.map((r: any) => r.image_url) : []
      setRoom({ ...(data as any), images } as Room)
      setLoading(false)
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !room) return
    setLoading(true)

    setError(null)
    let imageUrls = [...room.images]
    const newUploadedUrls: string[] = []
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const path = `${user.id}/${Date.now()}_${file.name}`
          const { error: uploadError } = await supabase.storage.from('room-images').upload(path, file)
          if (uploadError) {
            console.error('Upload error:', uploadError)
            setError(`Image upload failed: ${uploadError.message}`)
            continue
          }
          const { data } = supabase.storage.from('room-images').getPublicUrl(path)
          const publicUrl = data.publicUrl
          imageUrls.push(publicUrl)
          newUploadedUrls.push(publicUrl)
        } catch (ex: any) {
          console.error('Upload exception', ex)
          setError(`Image upload exception: ${ex?.message ?? String(ex)}`)
        }
      }

      // insert only newly uploaded images into room_images so listing queries see them
      if (newUploadedUrls.length > 0) {
        const newImgs = newUploadedUrls.map((u) => ({ id: crypto.randomUUID(), room_id: room.id, image_url: u }))
        const { error: iErr } = await supabase.from('room_images').insert(newImgs)
        if (iErr) {
          console.error('room_images insert', iErr)
          setError(`Images saved to storage but failed to insert metadata: ${iErr.message}`)
        }
      }
    }

    // remove any images the user removed from the gallery
    if (removedImages.length > 0) {
      try {
        await supabase.from('room_images').delete().eq('room_id', room.id).in('image_url', removedImages)
      } catch (delErr) {
        console.error('Failed to delete removed images metadata', delErr)
      }
    }

    // update room fields (do not touch an `images` column on the rooms table)
    const updatePayload = {
      title: room.title,
      location: room.location,
      rent: Number(room.rent),
      property_type: room.property_type,
      tenant_preference: room.tenant_preference,
      contact_number: room.contact_number,
    }

    const { error } = await supabase.from('rooms').update(updatePayload).eq('id', room.id)

    setLoading(false)
    if (error) {
      console.error('Room update error:', error)
      setError(`Failed to update room: ${error.message}`)
    } else navigate('/owner/dashboard')
  }

  if (loading) return <div>Loading...</div>
  if (!room) return <div>Room not found</div>

  const removeImage = (url: string) => {
    setRoom({ ...room, images: room.images.filter((i) => i !== url) } as Room)
    setRemovedImages((prev) => [...prev, url])
  }

  return (
    <div className="max-w-2xl mx-auto card-surface p-6 rounded-md shadow text-white">
      <h2 className="text-2xl font-semibold mb-4">Edit room</h2>

      {room.images && room.images.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Current images</h3>
          <div className="grid grid-cols-3 gap-2">
            {room.images.map((src) => (
              <div key={src} className="relative">
                <img src={src} className="w-full h-28 object-cover rounded" alt="img" />
                <button type="button" onClick={() => removeImage(src)} className="absolute top-1 right-1 bg-white/10 rounded-full px-2 py-1 text-sm border text-white">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Title" value={room.title} onChange={(e) => setRoom({ ...room, title: e.target.value })} required />
        <Input label="Location" value={room.location} onChange={(e) => setRoom({ ...room, location: e.target.value })} required />
        <Input label="Rent" type="number" value={String(room.rent)} onChange={(e) => setRoom({ ...room, rent: Number(e.target.value) })} required />
        <Select label="Property" value={room.property_type} onChange={(e) => setRoom({ ...room, property_type: e.target.value })}>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="studio">Studio</option>
        </Select>
        <Select label="Tenant preference" value={room.tenant_preference} onChange={(e) => setRoom({ ...room, tenant_preference: e.target.value })}>
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
        <Input label="Contact number" value={room.contact_number} onChange={(e) => setRoom({ ...room, contact_number: e.target.value })} required />
        <div>
          <label className="block text-sm font-medium text-teal-200">Add images</label>
          <input type="file" className="mt-1" multiple onChange={(e) => setFiles(e.target.files)} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
        {error && <div className="text-red-400 mt-2">{error}</div>}
      </form>
    </div>
  )
}
