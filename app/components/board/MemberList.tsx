'use client'

import { useState } from 'react'
import { Users, UserPlus, Clock, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/types'
import { sendInvitation } from '@/app/actions/invitation'

interface MemberListProps {
  members: Profile[]
  boardMemberIds: string[]
  pendingInviteeIds: string[]
  currentUserId: string | null
  boardId: string
  onInviteSent: () => void
}

export function MemberList({ 
  members, 
  boardMemberIds, 
  pendingInviteeIds,
  currentUserId, 
  boardId,
  onInviteSent,
}: MemberListProps) {
  const [invitingId, setInvitingId] = useState<string | null>(null)

  // 초대 발송
  const handleInvite = async (memberId: string, memberName: string) => {
    setInvitingId(memberId)
    
    const result = await sendInvitation({ boardId, inviteeId: memberId })
    
    if (result.success) {
      toast.success(`${memberName}님에게 초대를 보냈습니다.`)
      onInviteSent() // 목록 새로고침
    } else {
      toast.error(result.error || '초대 발송에 실패했습니다.')
    }
    
    setInvitingId(null)
  }

  return (
    <div className='space-y-4'>
      {/* 헤더 */}
      <div className='flex items-center gap-3 text-sm text-[rgb(var(--muted-foreground))]'>
        <Users className='w-4 h-4' />
        <span>팀원 ({members.length}명)</span>
      </div>

      {/* 팀원 목록 */}
      <div className='space-y-3'>
        {members.map((member) => {
          const isMe = member.id === currentUserId
          const isBoardMember = boardMemberIds.includes(member.id)
          const isPendingInvite = pendingInviteeIds.includes(member.id)
          const isInviting = invitingId === member.id
          const canInvite = !isMe && !isBoardMember && !isPendingInvite

          return (
            <div
              key={member.id}
              className='flex items-center justify-between p-4 rounded-xl
                       bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary-hover))] transition-all duration-200'
            >
              <div className='flex items-center gap-4'>
                {/* 아바타 */}
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.username || ''}
                    referrerPolicy='no-referrer'
                    className='w-10 h-10 rounded-full'
                  />
                ) : (
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center'>
                    <span className='text-sm font-bold text-white'>
                      {(member.username || member.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}

                {/* 이름 & 이메일 */}
                <div className='min-w-0'>
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-semibold text-[rgb(var(--foreground))] truncate'>
                      {member.username || '이름 없음'}
                    </span>
                    {isMe && (
                      <span className='px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded'>
                        나
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-[rgb(var(--muted-foreground))] truncate'>
                    {member.email}
                  </p>
                </div>
              </div>

              {/* 상태/액션 버튼 */}
              <div className='flex-shrink-0'>
                {isBoardMember ? (
                  // 이미 보드 멤버
                  <span className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                    <Check className='w-3.5 h-3.5' />
                    참여 중
                  </span>
                ) : isPendingInvite ? (
                  // 초대 대기 중
                  <span className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400'>
                    <Clock className='w-3.5 h-3.5' />
                    대기 중
                  </span>
                ) : canInvite ? (
                  // 초대 버튼
                  <button
                    onClick={() => handleInvite(member.id, member.username || '팀원')}
                    disabled={isInviting}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                             bg-indigo-500 hover:bg-indigo-600 text-white
                             disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
                  >
                    <UserPlus className='w-3.5 h-3.5' />
                    {isInviting ? '초대 중...' : '초대하기'}
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
