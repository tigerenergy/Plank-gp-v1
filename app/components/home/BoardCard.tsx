'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Board } from '@/types'

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
  creatorAvatar?: string | null
  creatorName?: string | null
  currentUserId?: string | null
}

// 보드 이모지 (제목 첫 글자 기반 또는 기본값)
const BOARD_EMOJIS = ['📋', '📝', '🎯', '🚀', '💼', '📊', '🔧', '💡', '🎨', '📁']

// 보드 색상 그라데이션 (세련된 파스텔)
const boardColors = [
  'from-indigo-400 to-indigo-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-violet-400 to-violet-600',
  'from-cyan-400 to-cyan-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-teal-400 to-teal-600',
]

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
  creatorAvatar,
  creatorName,
  currentUserId,
}: BoardCardProps) {
  // 현재 사용자가 보드 생성자인지 확인
  const isOwner = currentUserId && board.created_by === currentUserId
  const colorIndex = board.id.charCodeAt(0) % boardColors.length
  const gradientColor = boardColors[colorIndex]
  const emojiIndex = board.id.charCodeAt(1) % BOARD_EMOJIS.length
  const boardEmoji = BOARD_EMOJIS[emojiIndex]

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStartEdit(board)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(board)
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCancelEdit()
  }

  if (isEditing) {
    return (
      <div className='card p-5 h-44' style={{ boxShadow: 'var(--shadow)' }}>
        <form
          onSubmit={(e) => onUpdate(e, board.id)}
          onClick={(e) => e.stopPropagation()}
          className='h-full flex flex-col'
        >
          <input
            type='text'
            value={editingTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            className='w-full px-4 py-3 rounded-xl input text-sm font-semibold'
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') onCancelEdit()
            }}
          />
          <div className='flex gap-2 mt-auto'>
            <button type='submit' className='flex-1 btn-primary py-2.5 text-sm'>
              저장
            </button>
            <button
              type='button'
              onClick={handleCancelEdit}
              className='btn-secondary py-2.5 px-4 text-sm'
            >
              취소
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div
      onClick={onNavigate}
      className='group card p-5 h-44 cursor-pointer relative overflow-hidden hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200'
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {/* 상단: 아이콘 + 액션 버튼 */}
      <div className='flex items-start justify-between mb-4'>
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-md`}
        >
          <span className='text-xl'>{boardEmoji}</span>
        </div>

        {/* 호버 시 액션 (생성자만 삭제 가능) */}
        <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          {isOwner && (
            <>
              <button
                onClick={handleStartEdit}
                className='w-8 h-8 rounded-lg flex items-center justify-center bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-indigo-600 shadow-sm transition-colors'
                title='이름 변경'
              >
                <Pencil className='w-3.5 h-3.5' />
              </button>
              <button
                onClick={handleDelete}
                className='w-8 h-8 rounded-lg flex items-center justify-center bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-red-600 shadow-sm transition-colors'
                title='삭제'
              >
                <Trash2 className='w-3.5 h-3.5' />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 제목 */}
      <h3 className='text-base font-bold text-[rgb(var(--foreground))] truncate mb-1'>
        {board.title}
      </h3>

      {/* 날짜 */}
      <p className='text-sm text-[rgb(var(--muted-foreground))] mb-4'>
        {new Date(board.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>

      {/* 하단: 보드 생성자 아바타 */}
      <div className='absolute bottom-4 right-4'>
        {creatorAvatar ? (
          <img
            src={creatorAvatar}
            alt=''
            referrerPolicy='no-referrer'
            className='w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-sm'
          />
        ) : creatorName ? (
          <div className='w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 shadow-sm'>
            <span className='text-xs font-bold text-white'>{creatorName[0].toUpperCase()}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
