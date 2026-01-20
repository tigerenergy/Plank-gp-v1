'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown, User as UserIcon } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useOutsideClick } from '@/hooks'

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useOutsideClick(menuRef, () => setIsOpen(false), isOpen)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div ref={menuRef} className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[rgb(var(--secondary))] transition-all duration-200'
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=''
            referrerPolicy='no-referrer'
            className='w-9 h-9 rounded-full ring-2 ring-[rgb(var(--border))] shadow-sm'
          />
        ) : (
          <div className='w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-sm'>
            <UserIcon className='w-4 h-4 text-white' />
          </div>
        )}
        <span className='hidden sm:block text-sm text-[rgb(var(--foreground))] font-semibold max-w-[100px] truncate'>
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-[rgb(var(--muted-foreground))] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-56 py-2 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150'>
          {/* 유저 정보 */}
          <div className='px-5 py-4 border-b border-[rgb(var(--border))]'>
            <p className='text-sm font-semibold text-[rgb(var(--foreground))] truncate'>
              {displayName}
            </p>
            <p className='text-xs text-[rgb(var(--muted-foreground))] truncate'>{user.email}</p>
          </div>

          {/* 메뉴 */}
          <div className='py-1'>
            <button
              onClick={handleLogout}
              className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
            >
              <LogOut className='w-4 h-4' />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
