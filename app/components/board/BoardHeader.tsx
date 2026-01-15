'use client'

import Link from 'next/link'

interface BoardHeaderProps {
  title: string
}

export function BoardHeader({ title }: BoardHeaderProps) {
  return (
    <header className='flex-shrink-0 sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-white/5'>
      <div className='px-4 sm:px-6 py-3'>
        <div className='flex items-center gap-3'>
          <Link
            href='/'
            className='w-9 h-9 rounded-lg bg-white/5 border border-white/10 
                      flex items-center justify-center
                      hover:bg-white/10 hover:border-white/20 transition-all active:scale-95'
            title='보드 목록으로'
          >
            <svg className='w-4 h-4 text-text-tertiary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          </Link>
          <h1 className='text-lg font-bold text-text-primary truncate flex-1'>{title}</h1>
        </div>
      </div>
    </header>
  )
}
