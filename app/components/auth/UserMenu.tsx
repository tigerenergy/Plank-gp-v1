'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자'

  return (
    <div ref={menuRef} className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-2 py-1.5 rounded-lg 
                   hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            referrerPolicy='no-referrer'
            className='w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-white/20'
          />
        ) : (
          <div className='w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center'>
            <UserIcon className='w-4 h-4 text-white' />
          </div>
        )}
        <span className='hidden sm:block text-sm text-gray-700 dark:text-white/90 font-medium max-w-[120px] truncate'>
          {displayName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className='absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50'
          >
            {/* 유저 정보 */}
            <div className='px-4 py-3 border-b border-gray-200 dark:border-white/10'>
              <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>{displayName}</p>
              <p className='text-xs text-gray-500 dark:text-slate-400 truncate'>{user.email}</p>
            </div>

            {/* 메뉴 항목 */}
            <div className='py-1'>
              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                로그아웃
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
