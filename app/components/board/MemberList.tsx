'use client'

import { Users } from 'lucide-react'
import type { Profile } from '@/types'

interface MemberListProps {
  members: Profile[]
  currentUserId: string | null
}

export function MemberList({ members, currentUserId }: MemberListProps) {
  return (
    <div className='space-y-3'>
      {/* 헤더 */}
      <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
        <Users className='w-4 h-4' />
        <span>팀원 ({members.length}명)</span>
      </div>

      {/* 팀원 목록 */}
      <div className='space-y-1'>
        {members.map((member) => {
          const isMe = member.id === currentUserId

          return (
            <div
              key={member.id}
              className='flex items-center justify-between p-2 rounded-lg
                       hover:bg-gray-100 dark:hover:bg-white/5 transition-colors'
            >
              <div className='flex items-center gap-3'>
                {/* 아바타 */}
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.username || ''}
                    referrerPolicy='no-referrer'
                    className='w-8 h-8 rounded-full'
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center'>
                    <span className='text-xs font-medium text-violet-600 dark:text-violet-400'>
                      {(member.username || member.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}

                {/* 이름 & 이메일 */}
                <div className='min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                      {member.username || '이름 없음'}
                    </span>
                    {isMe && (
                      <span className='px-1.5 py-0.5 text-[10px] font-medium bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded'>
                        나
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>
                    {member.email}
                  </p>
                </div>
              </div>

              {/* 팀원 표시 */}
              <span
                className='flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md
                             bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
              >
                팀원
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
