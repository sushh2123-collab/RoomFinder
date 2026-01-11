import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

export default function Button({ children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-md glow-cta ${className}`}
    >
      {children}
    </button>
  )
}
