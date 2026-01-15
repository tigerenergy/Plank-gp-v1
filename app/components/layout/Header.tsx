'use client'

import type { User } from '@supabase/supabase-js'
import { NavLink } from '../NavLink'
import { ThemeToggle } from '../ui/ThemeToggle'
import { UserMenu } from '../auth/UserMenu'

interface HeaderProps {
  user: User | null
  title?: string
  showBack?: boolean
}

export function Header({ user, title, showBack }: HeaderProps) {
  return (
    <header className='sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/95 backdrop-blur-sm'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {showBack && (
            <NavLink href='/' className='p-2 rounded-xl btn-ghost'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </NavLink>
          )}
          
          <NavLink href='/' className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md'>
              <span className='text-lg'>📋</span>
            </div>
            <span className='text-lg font-bold text-[rgb(var(--foreground))]'>
              {title || 'Plank'}
            </span>
          </NavLink>
        </div>

        <div className='flex items-center gap-2'>
          <ThemeToggle />
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  )
}
