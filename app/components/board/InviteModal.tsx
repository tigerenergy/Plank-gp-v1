'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Send, UserPlus, Check, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { sendInvitation, getBoardInvitations, cancelInvitation } from '@/app/actions/invitation'
import type { BoardInvitation } from '@/types'
import { overlayVariants, modalVariants } from '@/lib/animations'

interface InviteModalProps {
  isOpen: boolean
  boardId: string
  onClose: () => void
}

export function InviteModal({ isOpen, boardId, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitations, setInvitations] = useState<BoardInvitation[]>([])
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false)

  // 초대 목록 로드
  const loadInvitations = async () => {
    setIsLoadingInvitations(true)
    const result = await getBoardInvitations(boardId)
    if (result.success && result.data) {
      setInvitations(result.data)
    }
    setIsLoadingInvitations(false)
  }

  // 모달 열릴 때 초대 목록 로드
  const handleOpen = () => {
    loadInvitations()
  }

  // 초대 발송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || isSubmitting) return

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('올바른 이메일 주소를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    const result = await sendInvitation({ boardId, email: email.trim() })

    if (result.success) {
      toast.success(`${email}님에게 초대를 보냈습니다.`)
      setEmail('')
      loadInvitations()
    } else {
      toast.error(result.error || '초대 발송에 실패했습니다.')
    }
    setIsSubmitting(false)
  }

  // 초대 취소
  const handleCancel = async (invitationId: string) => {
    const result = await cancelInvitation(invitationId)
    if (result.success) {
      toast.success('초대가 취소되었습니다.')
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
    } else {
      toast.error(result.error || '초대 취소에 실패했습니다.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className='w-4 h-4 text-amber-500' />
      case 'accepted':
        return <Check className='w-4 h-4 text-green-500' />
      case 'rejected':
        return <AlertCircle className='w-4 h-4 text-red-500' />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중'
      case 'accepted':
        return '수락됨'
      case 'rejected':
        return '거절됨'
      default:
        return status
    }
  }

  return (
    <AnimatePresence onExitComplete={() => setEmail('')}>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          initial='hidden'
          animate='visible'
          exit='hidden'
          onAnimationStart={handleOpen}
        >
          {/* 오버레이 */}
          <motion.div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            variants={overlayVariants}
            onClick={onClose}
          />

          {/* 모달 */}
          <motion.div
            className='relative w-full max-w-md bg-[rgb(var(--card))] rounded-2xl shadow-2xl overflow-hidden'
            variants={modalVariants}
          >
            {/* 헤더 */}
            <div className='flex items-center justify-between p-6 border-b border-[rgb(var(--border))]'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center'>
                  <UserPlus className='w-5 h-5 text-indigo-500' />
                </div>
                <div>
                  <h2 className='text-lg font-bold text-[rgb(var(--foreground))]'>팀원 초대</h2>
                  <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                    이메일로 팀원을 초대하세요
                  </p>
                </div>
              </div>
              <button onClick={onClose} className='p-2 btn-ghost rounded-xl'>
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* 초대 폼 */}
            <form onSubmit={handleSubmit} className='p-6'>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]' />
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='이메일 주소 입력...'
                    className='w-full pl-12 pr-4 py-3 input rounded-xl'
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type='submit'
                  disabled={!email.trim() || isSubmitting}
                  className='px-6 btn-primary rounded-xl flex items-center gap-2'
                >
                  <Send className='w-4 h-4' />
                  <span className='hidden sm:inline'>초대 보내기</span>
                </button>
              </div>
            </form>

            {/* 초대 목록 */}
            <div className='px-6 pb-6'>
              <h3 className='text-sm font-semibold text-[rgb(var(--muted-foreground))] mb-3'>
                보낸 초대 ({invitations.length})
              </h3>

              {isLoadingInvitations ? (
                <div className='py-8 text-center text-[rgb(var(--muted-foreground))]'>
                  불러오는 중...
                </div>
              ) : invitations.length === 0 ? (
                <div className='py-8 text-center'>
                  <Mail className='w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted-foreground))] opacity-50' />
                  <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                    아직 보낸 초대가 없습니다
                  </p>
                </div>
              ) : (
                <div className='space-y-2 max-h-60 overflow-y-auto'>
                  {invitations.map((invitation) => (
                    <motion.div
                      key={invitation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--secondary))]'
                    >
                      <div className='flex items-center gap-3 min-w-0'>
                        <div className='w-8 h-8 rounded-full bg-[rgb(var(--card))] flex items-center justify-center flex-shrink-0'>
                          <span className='text-xs font-medium'>
                            {invitation.invitee_email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className='min-w-0'>
                          <p className='text-sm font-medium text-[rgb(var(--foreground))] truncate'>
                            {invitation.invitee_email}
                          </p>
                          <div className='flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))]'>
                            {getStatusIcon(invitation.status)}
                            <span>{getStatusText(invitation.status)}</span>
                          </div>
                        </div>
                      </div>

                      {invitation.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(invitation.id)}
                          className='px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors'
                        >
                          취소
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
