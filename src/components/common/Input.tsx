import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export default function Input({ label, ...inputProps }: InputProps) {
  return (
    <label className="block">
      {label && <span className="text-sm font-medium text-teal-200">{label}</span>}
      <input
        {...inputProps}
        className="mt-1 w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder-gray-400 border-white/6 focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </label>
  )
} 
