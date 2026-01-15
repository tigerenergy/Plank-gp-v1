'use client'

import { RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ListWithCards } from '@/types'
import { slideDown, easeTransition } from '@/lib/animations'

interface ColorClasses {
  gradient: string
  headerBg: string
  text: string
  badge: string
  dotPrimary: string
  dotSecondary: string
}

interface ColumnHeaderProps {
  list: ListWithCards
  colorClasses: ColorClasses
  isEditing: boolean
  editTitle: string
  isMenuOpen: boolean
  menuRef: RefObject<HTMLDivElement | null>
  inputRef: RefObject<HTMLInputElement | null>
  onEditTitleChange: (title: string) => void
  onUpdateTitle: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onMenuToggle: () => void
  onStartEdit: () => void
  onDeleteClick: () => void
}

export function ColumnHeader({
  list,
  colorClasses,
  isEditing,
  editTitle,
  isMenuOpen,
  menuRef,
  inputRef,
  onEditTitleChange,
  onUpdateTitle,
  onKeyDown,
  onMenuToggle,
  onStartEdit,
  onDeleteClick,
}: ColumnHeaderProps) {
  return (
    <div className='flex-shrink-0 px-3 sm:px-4 py-3 bg-gray-50/50 dark:bg-transparent border-b border-gray-100 dark:border-white/5'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 min-w-0 flex-1'>
          {/* Status indicator dots */}
          <div className='flex gap-1'>
            <div className={`w-2 h-2 rounded-full ${colorClasses.dotPrimary}`} />
            <div className={`w-2 h-2 rounded-full ${colorClasses.dotSecondary}`} />
          </div>

          {isEditing ? (
            <input
              ref={inputRef}
              type='text'
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              onBlur={onUpdateTitle}
              onKeyDown={onKeyDown}
              className='flex-1 px-2 py-1 text-sm font-semibold 
                         bg-white dark:bg-[#252542] border border-violet-400 dark:border-violet-500/50 
                         rounded-md text-gray-900 dark:text-gray-100 
                         focus:outline-none focus:ring-2 focus:ring-violet-500/30'
            />
          ) : (
            <>
              <h2 className={`font-semibold text-sm ${colorClasses.text} truncate`}>
                {list.title}
              </h2>
              <span
                className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-md font-medium ${colorClasses.badge}`}
              >
                {list.cards.length}
              </span>
            </>
          )}
        </div>

        {/* 옵션 버튼 & 드롭다운 메뉴 */}
        <div className='relative' ref={menuRef}>
          <motion.button
            onClick={onMenuToggle}
            className='flex-shrink-0 p-1.5 text-gray-400 dark:text-gray-500 
                       hover:text-gray-600 dark:hover:text-gray-300 
                       hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors'
            title='더보기'
            whileTap={{ scale: 0.9 }}
          >
            <MoreIcon />
          </motion.button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className='absolute right-0 top-full mt-1 w-40 py-1 z-50
                           bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 
                           rounded-lg shadow-xl'
                variants={slideDown}
                initial='initial'
                animate='animate'
                exit='exit'
                transition={easeTransition}
              >
                <motion.button
                  onClick={onStartEdit}
                  className='w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 transition-colors'
                  whileTap={{ scale: 0.98 }}
                >
                  <EditIcon />
                  제목 수정
                </motion.button>
                <motion.button
                  onClick={onDeleteClick}
                  className='w-full px-3 py-2 text-left text-sm text-red-500 dark:text-red-400 
                             hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors'
                  whileTap={{ scale: 0.98 }}
                >
                  <DeleteIcon />
                  삭제
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// 아이콘 컴포넌트들
function MoreIcon() {
  return (
    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
      />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
      />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
      />
    </svg>
  )
}
