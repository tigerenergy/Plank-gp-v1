'use client'

import { Pencil, Trash2, Calendar } from 'lucide-react'
import type { Board, Profile } from '@/types'

// D-Day 계산 함수
function formatDDay(dateString: string | null | undefined): { text: string; color: string } | null {
  if (!dateString) return null
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(dateString)
  targetDate.setHours(0, 0, 0, 0)
  
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return { text: `D+${Math.abs(diffDays)}`, color: 'text-red-500' }
  } else if (diffDays === 0) {
    return { text: 'D-Day', color: 'text-amber-500' }
  } else if (diffDays <= 3) {
    return { text: `D-${diffDays}`, color: 'text-amber-500' }
  } else if (diffDays <= 7) {
    return { text: `D-${diffDays}`, color: 'text-blue-500' }
  } else {
    return { text: `D-${diffDays}`, color: 'text-[rgb(var(--muted-foreground))]' }
  }
}

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
  members?: Profile[]
}

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
  members = [],
}: BoardCardProps) {
  // 현재 사용자가 보드 생성자인지 확인
  const isOwner = currentUserId && board.created_by === currentUserId
  const colorIndex = board.id.charCodeAt(0) % boardColors.length
  const gradientColor = boardColors[colorIndex]
  // 저장된 이모지 사용, 없으면 기본값
  const boardEmoji = board.emoji || '📋'

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
          <div className='flex gap-3 mt-auto'>
            <button 
              type='submit' 
              disabled={!editingTitle.trim()}
              className='flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
            >
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
      className='group card board-card-item p-5 h-44 cursor-pointer relative overflow-hidden hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200'
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
        <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
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

      {/* D-Day 또는 작성일 */}
      {board.due_date ? (
        <div className='flex items-center gap-1.5 mb-auto'>
          <Calendar className='w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]' />
          {(() => {
            const dday = formatDDay(board.due_date)
            return dday ? (
              <span className={`text-sm font-semibold ${dday.color}`}>{dday.text}</span>
            ) : null
          })()}
          <span className='text-xs text-[rgb(var(--muted-foreground))]'>
            ({new Date(board.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })})
          </span>
        </div>
      ) : (
        <p className='text-sm text-[rgb(var(--muted-foreground))] mb-auto'>
          {new Date(board.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}

      {/* 하단: 보드 멤버 아바타들 (생성자 + 초대된 멤버) */}
      <div className='absolute bottom-4 left-5 right-5 flex items-center justify-end gap-2'>
        {/* 생성자 아바타 */}
        {creatorAvatar ? (
          <img
            src={creatorAvatar}
            alt=''
            referrerPolicy='no-referrer'
            className='w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-md object-cover'
            title={creatorName || '생성자'}
          />
        ) : creatorName ? (
          <div 
            className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 shadow-md'
            title={creatorName}
          >
            <span className='text-sm font-bold text-white'>{creatorName[0].toUpperCase()}</span>
          </div>
        ) : null}
        
        {/* 초대된 멤버 아바타들 (최대 2명까지 표시, 생성자 포함 최대 3명) */}
        {members.slice(0, creatorName ? 2 : 3).map((member) => (
          member.avatar_url ? (
            <img
              key={member.id}
              src={member.avatar_url}
              alt=''
              referrerPolicy='no-referrer'
              className='w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-md object-cover'
              title={member.username || member.email?.split('@')[0] || '멤버'}
            />
          ) : (
            <div 
              key={member.id}
              className='w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 shadow-md'
              title={member.username || member.email?.split('@')[0] || '멤버'}
            >
              <span className='text-sm font-bold text-white'>
                {(member.username || member.email?.split('@')[0] || 'M')[0].toUpperCase()}
              </span>
            </div>
          )
        ))}
        
        {/* 추가 멤버가 있으면 +N 표시 */}
        {(members.length > (creatorName ? 2 : 3)) && (
          <div className='w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 shadow-md'>
            <span className='text-xs font-bold text-slate-600 dark:text-slate-300'>
              +{members.length - (creatorName ? 2 : 3)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
