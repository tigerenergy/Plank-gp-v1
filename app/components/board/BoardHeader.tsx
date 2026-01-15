'use client'

import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { Users } from 'lucide-react'
import { UserMenu } from '@/app/components/auth/UserMenu'
import { ThemeToggle } from '@/app/components/ui/ThemeToggle'
import type { Profile } from '@/types'

interface BoardHeaderProps {
  title: string
  user: User | null
  members?: Profile[]
  onSettingsClick?: () => void
}

export function BoardHeader({ title, user, members = [], onSettingsClick }: BoardHeaderProps) {
  // 최대 4명까지 아바타 표시
  const displayMembers = members.slice(0, 4)
  const remainingCount = members.length - 4

  return (
    <header className='flex-shrink-0 sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5'>
      <div className='px-4 sm:px-6 py-3'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            <Link
              href='/'
              className='w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 
                        flex items-center justify-center flex-shrink-0
                        hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all active:scale-95'
              title='보드 목록으로'
            >
              <svg
                className='w-4 h-4 text-gray-500 dark:text-gray-400'
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
            <h1 className='text-lg font-bold text-gray-900 dark:text-white truncate'>
              {title}
            </h1>
          </div>

          <div className='flex items-center gap-3 flex-shrink-0'>
            {/* 팀원 아바타 */}
            {members.length > 0 && (
              <button
                onClick={onSettingsClick}
                className='hidden sm:flex items-center -space-x-2 hover:opacity-80 transition-opacity'
                title='팀원 보기'
              >
                {displayMembers.map((member) =>
                  member.avatar_url ? (
                    <img
                      key={member.id}
                      src={member.avatar_url}
                      alt={member.username || ''}
                      referrerPolicy='no-referrer'
                      className='w-7 h-7 rounded-full border-2 border-white dark:border-[#0f0f1a]'
                    />
                  ) : (
                    <div
                      key={member.id}
                      className='w-7 h-7 rounded-full bg-violet-500/20 border-2 border-white dark:border-[#0f0f1a]
                               flex items-center justify-center'
                    >
                      <span className='text-[10px] font-medium text-violet-600 dark:text-violet-400'>
                        {(member.username || member.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                  )
                )}
                {remainingCount > 0 && (
                  <div
                    className='w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10 border-2 border-white dark:border-[#0f0f1a]
                                flex items-center justify-center'
                  >
                    <span className='text-[10px] font-medium text-gray-600 dark:text-gray-400'>
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </button>
            )}

            {/* 팀원 버튼 */}
            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className='w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 
                          flex items-center justify-center
                          hover:bg-gray-200 dark:hover:bg-white/10 transition-all'
                title='팀원'
              >
                <Users className='w-4 h-4 text-gray-500 dark:text-gray-400' />
              </button>
            )}

            <ThemeToggle />
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  )
}
