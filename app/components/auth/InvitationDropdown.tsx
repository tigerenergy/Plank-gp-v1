'use client'

// 🚀 React Compiler + Zustand: useState 최소화
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { useNotificationStore } from '@/store/useNotificationStore'
import { getMyInvitations, acceptInvitation, rejectInvitation } from '@/app/actions/invitation'
import type { BoardInvitation } from '@/types'

export function InvitationDropdown() {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Zustand 스토어에서 상태 가져오기
  const {
    isOpen,
    invitations,
    isLoading,
    processingId,
    setIsOpen,
    setInvitations,
    removeInvitation,
    setIsLoading,
    setProcessingId,
  } = useNotificationStore()

  // 초대 목록 로드
  const loadInvitations = async () => {
    setIsLoading(true)
    const result = await getMyInvitations()
    if (result.success && result.data) {
      setInvitations(result.data)
    }
    setIsLoading(false)
  }

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsOpen])

  // 컴포넌트 마운트 시 초대 목록 로드
  useEffect(() => {
    loadInvitations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 초대 수락
  const handleAccept = async (invitation: BoardInvitation) => {
    setProcessingId(invitation.id)
    const result = await acceptInvitation(invitation.id)

    if (result.success && result.data) {
      toast.success('초대를 수락했습니다!')
      removeInvitation(invitation.id)
      setIsOpen(false)
      // 해당 보드로 이동
      router.push(`/board/${result.data.boardId}`)
    } else {
      toast.error(result.error || '초대 수락에 실패했습니다.')
    }
    setProcessingId(null)
  }

  // 초대 거절
  const handleReject = async (invitationId: string) => {
    setProcessingId(invitationId)
    const result = await rejectInvitation(invitationId)

    if (result.success) {
      toast.success('초대를 거절했습니다.')
      removeInvitation(invitationId)
    } else {
      toast.error(result.error || '초대 거절에 실패했습니다.')
    }
    setProcessingId(null)
  }

  const pendingCount = invitations.length

  return (
    <div className='relative' ref={dropdownRef}>
      {/* 알림 버튼 */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) loadInvitations()
        }}
        className='relative w-10 h-10 rounded-xl flex items-center justify-center btn-ghost border border-[rgb(var(--border))]'
        title='초대 알림'
      >
        <Bell className='w-4 h-4' />
        {/* 배지 */}
        {pendingCount > 0 && (
          <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center'>
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className='absolute right-0 top-full mt-2 w-80 bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] shadow-xl overflow-hidden z-50'
          >
            {/* 헤더 */}
            <div className='px-5 py-4 border-b border-[rgb(var(--border))] flex items-center justify-between'>
              <h3 className='font-semibold text-[rgb(var(--foreground))]'>초대 알림</h3>
              <span className='text-xs text-[rgb(var(--muted-foreground))]'>
                {pendingCount}개의 초대
              </span>
            </div>

            {/* 초대 목록 */}
            <div className='max-h-80 overflow-y-auto'>
              {isLoading ? (
                <div className='py-8 text-center text-[rgb(var(--muted-foreground))]'>
                  불러오는 중...
                </div>
              ) : invitations.length === 0 ? (
                <div className='py-8 text-center'>
                  <Inbox className='w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted-foreground))] opacity-50' />
                  <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                    받은 초대가 없습니다
                  </p>
                </div>
              ) : (
                <div className='p-3 space-y-3'>
                  {invitations.map((invitation) => (
                    <motion.div
                      key={invitation.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className='p-4 rounded-xl bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary))]/80 transition-all duration-200'
                    >
                      <div className='flex items-start gap-4'>
                        {/* 초대자 아바타 */}
                        {invitation.inviter?.avatar_url ? (
                          <img
                            src={invitation.inviter.avatar_url}
                            alt=''
                            referrerPolicy='no-referrer'
                            className='w-10 h-10 rounded-full flex-shrink-0'
                          />
                        ) : (
                          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0'>
                            <span className='text-sm font-bold text-white'>
                              {(invitation.inviter?.username || '?')[0].toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className='flex-1 min-w-0'>
                          <p className='text-sm text-[rgb(var(--foreground))]'>
                            <span className='font-semibold'>
                              {invitation.inviter?.username || '알 수 없음'}
                            </span>
                            님이 초대했습니다
                          </p>
                          <p className='text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate mt-0.5'>
                            📋 {invitation.board?.title || '보드'}
                          </p>

                          {/* 액션 버튼 */}
                          <div className='flex gap-3 mt-4'>
                            <button
                              onClick={() => handleAccept(invitation)}
                              disabled={processingId === invitation.id}
                              className='flex-1 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 hover:shadow-md'
                            >
                              <Check className='w-4 h-4' />
                              수락
                            </button>
                            <button
                              onClick={() => handleReject(invitation.id)}
                              disabled={processingId === invitation.id}
                              className='flex-1 py-2.5 px-4 bg-[rgb(var(--card))] hover:bg-red-50 dark:hover:bg-red-500/10 text-[rgb(var(--foreground))] hover:text-red-500 text-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 border border-[rgb(var(--border))] transition-all duration-200'
                            >
                              <X className='w-4 h-4' />
                              거절
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
