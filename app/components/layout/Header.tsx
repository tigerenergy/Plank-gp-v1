'use client'

import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import { NavLink } from '../NavLink'
import { ThemeToggle } from '../ui/ThemeToggle'
import { UserMenu } from '../auth/UserMenu'
import { NotificationDropdown } from '../auth/NotificationDropdown'

interface HeaderProps {
  user: User | null
  title?: string
  showBack?: boolean
}

export function Header({ user, title, showBack }: HeaderProps) {
  return (
    <header className='sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/95 backdrop-blur-sm'>
      <div className='max-w-6xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {showBack && (
            <NavLink href='/' className='p-2 rounded-xl btn-ghost'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </NavLink>
          )}
          
          <NavLink href='/' className='flex items-center'>
            {/* 라이트 모드 로고 (다크모드에서 숨김) */}
            <Image
              src='/blackLogo.png'
              alt='Plank'
              width={100}
              height={32}
              className='h-8 w-auto dark:hidden'
              priority
            />
            {/* 다크 모드 로고 (라이트모드에서 숨김) */}
            <Image
              src='/whiteLogo.png'
              alt='Plank'
              width={100}
              height={32}
              className='h-8 w-auto hidden dark:block'
              priority
            />
          </NavLink>
        </div>

        <div className='flex items-center gap-3'>
          {user && <NotificationDropdown />}
          <ThemeToggle />
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </header>
  )
}
