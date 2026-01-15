'use client'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-3',
  lg: 'w-16 h-16 border-4',
}

export function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className='flex items-center justify-center py-20'>
      <div className='flex flex-col items-center gap-4'>
        <div
          className={`${sizeClasses[size]} border-bg-tertiary border-t-pastel-violet rounded-full animate-spin`}
        />
        {message && <p className='text-text-muted font-medium'>{message}</p>}
      </div>
    </div>
  )
}
