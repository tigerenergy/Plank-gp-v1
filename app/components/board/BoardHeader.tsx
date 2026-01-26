'use client'

import { Users, FileText } from 'lucide-react'
import Link from 'next/link'
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
      <div className='px-4 sm:px-5 py-3'>
        <div className='flex items-center justify-between gap-3'>
          {/* 왼쪽: 뒤로가기 + 제목 */}
          <div className='flex items-center gap-3 min-w-0'>
            <NavLink href='/' className='w-9 h-9 rounded-lg flex items-center justify-center btn-ghost border border-[rgb(var(--border))]' title='보드 목록'>
              <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </NavLink>
            
            <h1 className='text-base font-bold text-[rgb(var(--foreground))] truncate'>
              {title}
            </h1>
          </div>

          {/* 오른쪽: 완료된 작업 + 멤버 + 설정 */}
          <div className='flex items-center gap-2 flex-shrink-0'>
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
                      className='w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-[rgb(var(--card))] flex items-center justify-center shadow-sm'
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

            {/* 주간보고 버튼 (드롭다운) - 완료된 작업 포함 */}
            <div className='relative group'>
              <Link
                href='/weekly-report/share'
                className='w-9 h-9 rounded-lg flex items-center justify-center btn-ghost border border-[rgb(var(--border))]'
                title='주간보고 공유 (모든 보드)'
              >
                <FileText className='w-4 h-4 text-violet-500' />
              </Link>
              <div className='absolute right-0 top-full mt-2 w-48 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50'>
                <Link
                  href={`/board/${boardId}/weekly-report/new`}
                  className='w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(var(--secondary))] rounded-t-xl flex items-center gap-2'
                >
                  <FileText className='w-4 h-4' />
                  주간보고 작성
                </Link>
                <Link
                  href='/weekly-report/share'
                  className='w-full px-4 py-2.5 text-left text-sm hover:bg-[rgb(var(--secondary))] rounded-b-xl flex items-center gap-2'
                >
                  <FileText className='w-4 h-4' />
                  주간보고 공유 (전체)
                </Link>
              </div>
            </div>

            {/* 팀원 관리 버튼 */}
            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className='w-9 h-9 rounded-lg flex items-center justify-center btn-ghost border border-[rgb(var(--border))]'
              >
                <Users className='w-5 h-5' />
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
