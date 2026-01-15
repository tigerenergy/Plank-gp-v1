'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users } from 'lucide-react'
import type { Profile } from '@/types'
import { getTeamMembers } from '@/app/actions/member'
import { MemberList } from './MemberList'

interface BoardSettingsModalProps {
  isOpen: boolean
  currentUserId: string | null
  onClose: () => void
}

export function BoardSettingsModal({ isOpen, currentUserId, onClose }: BoardSettingsModalProps) {
  const [members, setMembers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 팀원 목록 로드
  const loadMembers = async () => {
    setIsLoading(true)
    const result = await getTeamMembers()
    if (result.success && result.data) {
      setMembers(result.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      loadMembers()
    }
  }, [isOpen])

  if (!isOpen) return null

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
          className='w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden'
        >
          {/* 헤더 */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <Users className='w-5 h-5' />
              팀원
            </h2>
            <button
              onClick={onClose}
              className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors'
            >
              <X className='w-5 h-5 text-gray-500 dark:text-gray-400' />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className='p-4 max-h-[60vh] overflow-y-auto'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
              </div>
            ) : (
              <MemberList members={members} currentUserId={currentUserId} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
