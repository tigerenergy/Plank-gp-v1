'use client'

import { motion } from 'framer-motion'
import type { Board } from '@/types'
import { cardHover, easeTransition } from '@/lib/animations'

interface BoardCardProps {
  board: Board
  isEditing: boolean
  editingTitle: string
  onNavigate: () => void
  onStartEdit: (board: Board) => void
  onCancelEdit: () => void
  onEditingTitleChange: (title: string) => void
  onUpdate: (e: React.FormEvent, boardId: string) => void
  onDelete: (board: Board) => void
}

export function BoardCard({
  board,
  isEditing,
  editingTitle,
  onNavigate,
  onStartEdit,
  onCancelEdit,
  onEditingTitleChange,
  onUpdate,
  onDelete,
}: BoardCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(board)
  }

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStartEdit(board)
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCancelEdit()
  }

  if (isEditing) {
    return (
      <div className='rounded-xl p-5 h-36 bg-bg-secondary border border-white/5 shadow-lg'>
        <form
          onSubmit={(e) => onUpdate(e, board.id)}
          onClick={(e) => e.stopPropagation()}
          className='h-full flex flex-col'
        >
          <input
            type='text'
            value={editingTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-white/10
                       text-text-primary text-sm focus:outline-none focus:border-violet-500/50'
            autoFocus
          />
          <div className='flex gap-2 mt-auto'>
            <motion.button
              type='submit'
              className='flex-1 py-2 rounded-lg text-sm font-medium
                       bg-violet-600 hover:bg-violet-500 text-white transition-colors'
              whileTap={{ scale: 0.95 }}
            >
              저장
            </motion.button>
            <motion.button
              type='button'
              onClick={handleCancelEdit}
              className='px-4 py-2 rounded-lg text-sm
                         bg-white/5 text-text-tertiary hover:bg-white/10 transition-colors'
              whileTap={{ scale: 0.95 }}
            >
              취소
            </motion.button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <motion.div
      onClick={onNavigate}
      className='relative group cursor-pointer rounded-xl p-5 h-36 
                 bg-bg-secondary border border-white/5 shadow-lg'
      variants={cardHover}
      initial='initial'
      whileHover='hover'
      whileTap='tap'
      transition={easeTransition}
    >
      <h3 className='text-lg font-bold text-text-primary truncate group-hover:text-white transition-colors'>
        {board.title}
      </h3>
      <p className='text-text-muted text-sm mt-1'>
        {new Date(board.created_at).toLocaleDateString('ko-KR')}
      </p>

      {/* 액션 버튼 */}
      <div className='absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
        <motion.button
          onClick={handleStartEdit}
          className='w-8 h-8 rounded-lg flex items-center justify-center
                   bg-white/10 hover:bg-violet-500 text-text-tertiary hover:text-white transition-colors'
          title='보드 수정'
          whileTap={{ scale: 0.9 }}
        >
          <EditIcon />
        </motion.button>
        <motion.button
          onClick={handleDelete}
          className='w-8 h-8 rounded-lg flex items-center justify-center
                   bg-white/10 hover:bg-red-500 text-text-tertiary hover:text-white transition-colors'
          title='보드 삭제'
          whileTap={{ scale: 0.9 }}
        >
          <DeleteIcon />
        </motion.button>
      </div>
    </motion.div>
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
