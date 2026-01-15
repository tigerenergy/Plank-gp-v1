'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronDown, X, Check } from 'lucide-react'
import type { Profile } from '@/types'

interface AssigneeSelectProps {
  members: Profile[]
  currentAssignee: Profile | null
  onAssign: (userId: string | null) => void
  disabled?: boolean
}

export function AssigneeSelect({
  members,
  currentAssignee,
  onAssign,
  disabled = false,
}: AssigneeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (userId: string | null) => {
    onAssign(userId)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className='relative'>
      {/* 선택 버튼 */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center gap-3 p-3 rounded-lg border transition-colors
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-secondary dark:hover:bg-white/5 cursor-pointer'
          }
          ${isOpen ? 'border-primary bg-primary/5' : 'border-border dark:border-white/10'}
        `}
      >
        {currentAssignee ? (
          <>
            {currentAssignee.avatar_url ? (
              <img
                src={currentAssignee.avatar_url}
                alt={currentAssignee.username || ''}
                referrerPolicy='no-referrer'
                className='w-8 h-8 rounded-full'
              />
            ) : (
              <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center'>
                <span className='text-sm font-medium text-primary'>
                  {(currentAssignee.username || currentAssignee.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className='flex-1 text-left'>
              <p className='text-sm font-medium text-foreground dark:text-white'>
                {currentAssignee.username || '이름 없음'}
              </p>
              <p className='text-xs text-muted-foreground truncate'>{currentAssignee.email}</p>
            </div>
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelect(null)
                }}
                className='p-1 rounded hover:bg-secondary dark:hover:bg-white/10'
              >
                <X className='w-4 h-4 text-muted-foreground' />
              </button>
            )}
          </>
        ) : (
          <>
            <div className='w-8 h-8 rounded-full bg-secondary dark:bg-white/10 flex items-center justify-center'>
              <User className='w-4 h-4 text-muted-foreground' />
            </div>
            <span className='flex-1 text-left text-sm text-muted-foreground'>담당자 선택...</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {/* 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='absolute top-full left-0 right-0 mt-1 py-1 bg-card dark:bg-slate-800 
                     border border-border dark:border-white/10 rounded-lg shadow-lg z-20
                     max-h-60 overflow-y-auto'
          >
            {/* 담당자 없음 옵션 */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary dark:hover:bg-white/5
                       ${!currentAssignee ? 'bg-primary/5' : ''}`}
            >
              <div className='w-8 h-8 rounded-full bg-secondary dark:bg-white/10 flex items-center justify-center'>
                <User className='w-4 h-4 text-muted-foreground' />
              </div>
              <span className='text-sm text-muted-foreground'>담당자 없음</span>
              {!currentAssignee && <Check className='w-4 h-4 text-primary ml-auto' />}
            </button>

            <hr className='my-1 border-border dark:border-white/10' />

            {/* 팀원 목록 */}
            {members.map((member) => {
              const isSelected = currentAssignee?.id === member.id

              return (
                <button
                  key={member.id}
                  onClick={() => handleSelect(member.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary dark:hover:bg-white/5
                           ${isSelected ? 'bg-primary/5' : ''}`}
                >
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.username || ''}
                      referrerPolicy='no-referrer'
                      className='w-8 h-8 rounded-full'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center'>
                      <span className='text-sm font-medium text-primary'>
                        {(member.username || member.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className='flex-1 text-left min-w-0'>
                    <p className='text-sm font-medium text-foreground dark:text-white truncate'>
                      {member.username || '이름 없음'}
                    </p>
                    <p className='text-xs text-muted-foreground truncate'>{member.email}</p>
                  </div>
                  {isSelected && <Check className='w-4 h-4 text-primary flex-shrink-0' />}
                </button>
              )
            })}

            {members.length === 0 && (
              <p className='px-3 py-4 text-sm text-center text-muted-foreground'>
                팀원이 없습니다.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
