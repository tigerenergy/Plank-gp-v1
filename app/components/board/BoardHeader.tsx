'use client'

import { Users, CheckCircle2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { NavLink } from '../NavLink'
import { ThemeToggle } from '../ui/ThemeToggle'
import { UserMenu } from '../auth/UserMenu'

interface BoardHeaderProps {
  boardId: string
  title: string
  user: User | null
  members: Profile[]
  onSettingsClick?: () => void
}

export function BoardHeader({ boardId, title, user, members, onSettingsClick }: BoardHeaderProps) {
  const displayMembers = members.slice(0, 4)
  const remainingCount = members.length - displayMembers.length

  return (
    <header className='flex-shrink-0 sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/95 backdrop-blur-sm'>
      <div className='px-4 sm:px-6 py-3'>
        <div className='flex items-center justify-between gap-4'>
          {/* 왼쪽: 뒤로가기 + 제목 */}
          <div className='flex items-center gap-3 min-w-0'>
            <NavLink href='/' className='w-10 h-10 rounded-xl flex items-center justify-center btn-ghost border border-[rgb(var(--border))]' title='보드 목록'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </NavLink>
            
            <h1 className='text-lg font-bold text-[rgb(var(--foreground))] truncate'>
              {title}
            </h1>
          </div>

          {/* 오른쪽: 완료된 작업 + 멤버 + 설정 */}
          <div className='flex items-center gap-3 flex-shrink-0'>
            {/* 완료된 작업 버튼 */}
            <NavLink
              href={`/board/${boardId}/completed`}
              className='hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-ghost border border-[rgb(var(--border))] text-sm font-medium'
              title='완료된 작업 보기'
            >
              <CheckCircle2 className='w-4 h-4 text-emerald-500' />
              <span className='hidden md:inline'>완료된 작업</span>
            </NavLink>

            {/* 멤버 아바타 */}
            {members.length > 0 && (
              <button
                onClick={onSettingsClick}
                className='hidden sm:flex items-center -space-x-2 hover:opacity-90 transition-opacity'
                title='팀원 보기'
              >
                {displayMembers.map((member) =>
                  member.avatar_url ? (
                    <img
                      key={member.id}
                      src={member.avatar_url}
                      alt=''
                      referrerPolicy='no-referrer'
                      className='w-8 h-8 rounded-full ring-2 ring-[rgb(var(--card))] shadow-sm'
                    />
                  ) : (
                    <div
                      key={member.id}
                      className='w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-[rgb(var(--card))] flex items-center justify-center shadow-sm'
                    >
                      <span className='text-[10px] font-bold text-white'>
                        {(member.username || member.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                  )
                )}
                {remainingCount > 0 && (
                  <div className='w-8 h-8 rounded-full bg-[rgb(var(--secondary))] ring-2 ring-[rgb(var(--card))] flex items-center justify-center'>
                    <span className='text-[10px] font-bold text-[rgb(var(--muted-foreground))]'>
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </button>
            )}

            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className='w-10 h-10 rounded-xl flex items-center justify-center btn-ghost border border-[rgb(var(--border))]'
                title='팀원'
              >
                <Users className='w-4 h-4' />
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
