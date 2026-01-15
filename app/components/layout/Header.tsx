'use client'

import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { UserMenu } from '@/app/components/auth/UserMenu'
import { ThemeToggle } from '@/app/components/ui/ThemeToggle'

interface HeaderProps {
  user: User | null
  title?: string
  showBack?: boolean
}

export function Header({ user, title, showBack }: HeaderProps) {
  return (
    <header className='sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {showBack && (
            <Link
              href='/'
              className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
            >
              <svg
                className='w-5 h-5 text-gray-700 dark:text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </Link>
          )}
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20'>
              <svg
                className='w-4 h-4 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7'
                />
              </svg>
            </div>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white'>{title || 'Plank'}</h1>
          </Link>
        </div>

        <div className='flex items-center gap-2'>
          <ThemeToggle />
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  )
}
