'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Inbox, MessageSquare, UserPlus, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { getMyNotifications, markAsRead, markAllAsRead } from '@/app/actions/notification'
import { getMyInvitations, acceptInvitation, rejectInvitation } from '@/app/actions/invitation'
import type { Notification, BoardInvitation } from '@/types'

export function NotificationDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [invitations, setInvitations] = useState<BoardInvitation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true)
    
    const [notifResult, invResult] = await Promise.all([
      getMyNotifications(),
      getMyInvitations(),
    ])
    
    if (notifResult.success && notifResult.data) {
      setNotifications(notifResult.data)
    }
    
    if (invResult.success && invResult.data) {
      setInvitations(invResult.data)
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
  }, [])

  // 컴포넌트 마운트 시 로드
  useEffect(() => {
    loadData()
  }, [])

  // 초대 수락
  const handleAcceptInvitation = async (invitation: BoardInvitation) => {
    setProcessingId(invitation.id)
    const result = await acceptInvitation(invitation.id)

    if (result.success && result.data) {
      toast.success('초대를 수락했습니다!')
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id))
      setIsOpen(false)
      router.push(`/board/${result.data.boardId}`)
    } else {
      toast.error(result.error || '초대 수락에 실패했습니다.')
    }
    setProcessingId(null)
  }

  // 초대 거절
  const handleRejectInvitation = async (invitationId: string) => {
    setProcessingId(invitationId)
    const result = await rejectInvitation(invitationId)

    if (result.success) {
      toast.success('초대를 거절했습니다.')
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
    } else {
      toast.error(result.error || '초대 거절에 실패했습니다.')
    }
    setProcessingId(null)
  }

  // 알림 클릭 (읽음 처리 + 이동)
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      )
    }
    
    if (notification.link) {
      setIsOpen(false)
      router.push(notification.link)
    }
  }

  // 모두 읽음 처리
  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead()
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('모든 알림을 읽음 처리했습니다.')
    }
  }

  // 총 개수 (읽지 않은 알림 + 대기 중인 초대)
  const unreadNotifCount = notifications.filter((n) => !n.is_read).length
  const pendingInviteCount = invitations.length
  const totalCount = unreadNotifCount + pendingInviteCount

  // 알림 아이콘 선택
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className='w-4 h-4 text-blue-500' />
      case 'invitation':
        return <UserPlus className='w-4 h-4 text-indigo-500' />
      default:
        return <Bell className='w-4 h-4 text-gray-500' />
    }
  }

  return (
    <div className='relative' ref={dropdownRef}>
      {/* 알림 버튼 */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) loadData()
        }}
        className='relative w-10 h-10 rounded-xl flex items-center justify-center btn-ghost border border-[rgb(var(--border))]'
        title='알림'
      >
        <Bell className='w-4 h-4' />
        {/* 배지 */}
        {totalCount > 0 && (
          <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center'>
            {totalCount > 9 ? '9+' : totalCount}
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
            className='absolute right-0 top-full mt-2 w-96 bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))] shadow-xl overflow-hidden z-50'
          >
            {/* 헤더 */}
            <div className='px-4 py-3 border-b border-[rgb(var(--border))] flex items-center justify-between'>
              <h3 className='font-semibold text-[rgb(var(--foreground))]'>알림</h3>
              <div className='flex items-center gap-2'>
                {unreadNotifCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className='flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline'
                  >
                    <CheckCheck className='w-3.5 h-3.5' />
                    모두 읽음
                  </button>
                )}
                <span className='text-xs text-[rgb(var(--muted-foreground))]'>
                  {totalCount}개
                </span>
              </div>
            </div>

            {/* 알림 목록 */}
            <div className='max-h-96 overflow-y-auto'>
              {isLoading ? (
                <div className='py-8 text-center text-[rgb(var(--muted-foreground))]'>
                  불러오는 중...
                </div>
              ) : invitations.length === 0 && notifications.length === 0 ? (
                <div className='py-8 text-center'>
                  <Inbox className='w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted-foreground))] opacity-50' />
                  <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                    새로운 알림이 없습니다
                  </p>
                </div>
              ) : (
                <div className='p-2 space-y-2'>
                  {/* 초대 목록 (우선 표시) */}
                  {invitations.map((invitation) => (
                    <motion.div
                      key={`inv-${invitation.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className='p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20'
                    >
                      <div className='flex items-start gap-3'>
                        {/* 초대자 아바타 */}
                        <div className='flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center overflow-hidden'>
                          {invitation.inviter?.avatar_url ? (
                            <img
                              src={invitation.inviter.avatar_url}
                              alt=''
                              referrerPolicy='no-referrer'
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span className='text-sm font-bold text-white'>
                              {(invitation.inviter?.username || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-1.5 mb-1'>
                            <UserPlus className='w-3.5 h-3.5 text-indigo-500' />
                            <span className='text-xs font-medium text-indigo-600 dark:text-indigo-400'>
                              보드 초대
                            </span>
                          </div>
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
                          <div className='flex gap-2 mt-3'>
                            <button
                              onClick={() => handleAcceptInvitation(invitation)}
                              disabled={processingId === invitation.id}
                              className='flex-1 py-2 px-3 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors'
                            >
                              <Check className='w-4 h-4' />
                              수락
                            </button>
                            <button
                              onClick={() => handleRejectInvitation(invitation.id)}
                              disabled={processingId === invitation.id}
                              className='flex-1 py-2 px-3 bg-[rgb(var(--card))] hover:bg-red-50 dark:hover:bg-red-500/10 text-[rgb(var(--foreground))] hover:text-red-500 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 border border-[rgb(var(--border))] transition-colors'
                            >
                              <X className='w-4 h-4' />
                              거절
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* 일반 알림 목록 */}
                  {notifications.map((notification) => (
                    <motion.div
                      key={`notif-${notification.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors ${
                        notification.is_read
                          ? 'bg-[rgb(var(--secondary))]/50 hover:bg-[rgb(var(--secondary))]'
                          : 'bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary))]/80'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        {/* 발신자 아바타 */}
                        <div className='flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center overflow-hidden'>
                          {notification.sender?.avatar_url ? (
                            <img
                              src={notification.sender.avatar_url}
                              alt=''
                              referrerPolicy='no-referrer'
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <span className='text-sm font-bold text-white'>
                              {(notification.sender?.username || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-1.5 mb-1'>
                            {getNotificationIcon(notification.type)}
                            <span className='text-xs font-medium text-[rgb(var(--muted-foreground))]'>
                              {notification.type === 'comment' ? '댓글' : '알림'}
                            </span>
                            {!notification.is_read && (
                              <span className='w-2 h-2 bg-indigo-500 rounded-full' />
                            )}
                          </div>
                          <p className='text-sm font-medium text-[rgb(var(--foreground))]'>
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className='text-xs text-[rgb(var(--muted-foreground))] mt-0.5 line-clamp-2'>
                              {notification.message}
                            </p>
                          )}
                          <p className='text-xs text-[rgb(var(--muted-foreground))] mt-1'>
                            {formatTimeAgo(notification.created_at)}
                          </p>
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

// 시간 포맷 (몇 분 전, 몇 시간 전 등)
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
  
  return date.toLocaleDateString('ko-KR')
}
