import React from 'react'

type Props = {
  images: string[]
}

export default function RoomGallery({ images }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {images.map((src) => (
        <img key={src} src={src} className="w-full h-48 object-cover rounded" alt="room" />
      ))}
    </div>
  )
}
