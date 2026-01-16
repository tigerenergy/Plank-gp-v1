'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import type { Profile, BoardInvitation } from '@/types'
import { getTeamMembers, getBoardMembers } from '@/app/actions/member'
import { getBoardInvitations } from '@/app/actions/invitation'
import { MemberList } from './MemberList'

interface BoardSettingsModalProps {
  isOpen: boolean
  currentUserId: string | null
  onClose: () => void
}

export function BoardSettingsModal({ isOpen, currentUserId, onClose }: BoardSettingsModalProps) {
  const params = useParams()
  const boardId = params.id as string
  
  const [allTeamMembers, setAllTeamMembers] = useState<Profile[]>([])
  const [actualBoardMembers, setActualBoardMembers] = useState<Profile[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<BoardInvitation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 팀원 목록 + 보드 멤버 + 초대 목록 로드
  const loadData = async () => {
    setIsLoading(true)
    
    const [allMembersResult, boardMembersResult, invitationsResult] = await Promise.all([
      getTeamMembers(),
      getBoardMembers(boardId),
      getBoardInvitations(boardId),
    ])
    
    if (allMembersResult.success && allMembersResult.data) {
      setAllTeamMembers(allMembersResult.data)
    }
    
    if (boardMembersResult.success && boardMembersResult.data) {
      setActualBoardMembers(boardMembersResult.data)
    }
    
    if (invitationsResult.success && invitationsResult.data) {
      setPendingInvitations(invitationsResult.data.filter(inv => inv.status === 'pending'))
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, boardId])

  if (!isOpen) return null

  // 실제 보드 멤버 ID 목록
  const boardMemberIds = actualBoardMembers.map(m => m.id)
  // 대기 중인 초대 대상 ID 목록
  const pendingInviteeIds = pendingInvitations.map(inv => inv.invitee_id)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className='w-full max-w-lg bg-[rgb(var(--card))] rounded-2xl shadow-xl overflow-hidden'
        >
          {/* 헤더 */}
          <div className='flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--border))]'>
            <h2 className='text-lg font-bold text-[rgb(var(--foreground))] flex items-center gap-2'>
              <Users className='w-5 h-5' />
              팀원
            </h2>
            <button
              onClick={onClose}
              className='p-2 rounded-xl btn-ghost'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className='p-4 max-h-[60vh] overflow-y-auto'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin' />
              </div>
            ) : (
              <MemberList 
                members={allTeamMembers} 
                boardMemberIds={boardMemberIds}
                pendingInviteeIds={pendingInviteeIds}
                currentUserId={currentUserId}
                boardId={boardId}
                onInviteSent={loadData}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
