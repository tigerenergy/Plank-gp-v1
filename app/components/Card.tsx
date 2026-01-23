'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, PartyPopper, CheckCircle2, Undo2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Card as CardType } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { getDueDateStatus } from '@/lib/utils'
import { completeCard, uncompleteCard, deleteCard } from '@/app/actions/card'
import { ConfirmModal } from './ConfirmModal'

interface CardProps {
  card: CardType
  isDoneList?: boolean // 완료 리스트인지 여부
}

// 라벨 색상 매핑 (hex 값으로 직접 지정)
const labelColorHex: Record<string, { bg: string; text: string }> = {
  red: { bg: '#ef4444', text: 'white' },
  orange: { bg: '#f97316', text: 'white' },
  yellow: { bg: '#facc15', text: '#713f12' },
  amber: { bg: '#f59e0b', text: 'white' },
  green: { bg: '#22c55e', text: 'white' },
  teal: { bg: '#14b8a6', text: 'white' },
  blue: { bg: '#3b82f6', text: 'white' },
  indigo: { bg: '#6366f1', text: 'white' },
  purple: { bg: '#a855f7', text: 'white' },
  pink: { bg: '#ec4899', text: 'white' },
}

// D-Day 형식으로 변환 (D-7, D-3, D-Day, D+2 등)
function formatDDay(dateString: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueDate = new Date(dateString)
  dueDate.setHours(0, 0, 0, 0)
  
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'D-Day'
  if (diffDays > 0) return `D-${diffDays}`
  return `D+${Math.abs(diffDays)}`
}

// 마감일 스타일
function getDueDateStyle(status: string) {
  switch (status) {
    case 'overdue':
      return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
    case 'today':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
    case 'soon':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
  }
}

// React Compiler가 자동으로 memoization 처리 (reactCompiler: true)
export function Card({ card, isDoneList = false }: CardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { openCardModal, updateCard, deleteCard: removeCardFromStore } = useBoardStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dueDateStatus = card.due_date ? getDueDateStatus(card.due_date) : null

  // 담당자 또는 생성자
  const displayUser = card.assignee || card.creator

  // 완료 처리
  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation() // 카드 클릭 이벤트 방지
    if (isCompleting) return
    
    setIsCompleting(true)
    try {
      const result = await completeCard(card.id)
      if (result.success && result.data) {
        updateCard(card.id, result.data)
        toast.success('🎉 카드가 완료되었습니다!')
      } else {
        toast.error(result.error || '완료 처리에 실패했습니다.')
      }
    } finally {
      setIsCompleting(false)
    }
  }

  // 완료 취소
  const handleUncomplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCompleting) return
    
    setIsCompleting(true)
    try {
      const result = await uncompleteCard(card.id)
      if (result.success && result.data) {
        updateCard(card.id, result.data)
        toast.success('완료가 취소되었습니다.')
      } else {
        toast.error(result.error || '완료 취소에 실패했습니다.')
      }
    } finally {
      setIsCompleting(false)
    }
  }

  // 완료된 카드 삭제 모달 열기
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  // 삭제 확인 (완료 페이지에 기록 남아있으니 보드에서 삭제)
  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
    setIsDeleting(true)

    const result = await deleteCard(card.id)
    if (result.success) {
      removeCardFromStore(card.id)
      toast.success('카드가 삭제되었습니다.')
    } else {
      toast.error(result.error || '카드 삭제에 실패했습니다.')
    }

    setIsDeleting(false)
  }

  // 완료된 카드인지
  const isCompleted = card.is_completed

  return (
    <div
      ref={setNodeRef}
      style={{ ...(isCompleted ? { boxShadow: 'var(--shadow)' } : {}), ...style }}
      {...attributes}
      {...listeners}
      onClick={() => openCardModal(card)}
      className={`
        card card-item cursor-pointer select-none flex flex-col relative
        ${isDragging ? 'opacity-60 ring-2 ring-indigo-400 scale-[1.02] rotate-1' : ''}
        ${isCompleted 
          ? 'p-5 h-44 opacity-60 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' 
          : 'p-5'}
      `}
    >
      {/* 완료된 카드: 상단 아이콘 */}
      {isCompleted && (
        <div className='flex items-start justify-between mb-4'>
          <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md'>
            <CheckCircle2 className='w-6 h-6 text-white' />
          </div>
        </div>
      )}

      {/* 라벨 */}
      {card.labels && card.labels.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 ${isCompleted ? 'mb-3' : 'mb-3'}`}>
          {card.labels.slice(0, 4).map((label, idx) => {
            const colorInfo = labelColorHex[label.color] || labelColorHex.blue
            return (
              <span
                key={idx}
                style={{ backgroundColor: colorInfo.bg, color: colorInfo.text }}
                className='px-2 py-1 rounded-md text-xs font-semibold'
              >
                {label.name}
              </span>
            )
          })}
          {card.labels.length > 4 && (
            <span className='px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'>
              +{card.labels.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 제목 */}
      <h3 className={`text-base font-bold leading-snug mb-1 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400 line-through' : 'text-[rgb(var(--foreground))]'}`}>
        {card.title}
      </h3>

      {/* 설명 */}
      {card.description && !isCompleted && (
        <p className='text-sm text-[rgb(var(--muted-foreground))] line-clamp-2 mb-auto leading-relaxed'>
          {card.description}
        </p>
      )}

      {/* 완료된 카드: 완료 시간 표시 */}
      {isCompleted && card.completed_at && (
        <div className='flex items-center gap-1.5 mb-auto'>
          <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full' />
          <span className='text-sm text-[rgb(var(--muted-foreground))]'>
            {new Date(card.completed_at).toLocaleDateString('ko-KR', { 
              month: 'short', 
              day: 'numeric'
            })}
          </span>
        </div>
      )}

      {/* 하단: 마감일 + 아바타 (완료된 카드는 하단 고정, 완료 리스트가 아닐 때만) */}
      {!isDoneList && (
        <div className={`${isCompleted ? 'absolute bottom-4 left-5 right-5' : 'mt-auto pt-4'} flex items-center justify-between`}>
          <div className='flex items-center gap-2'>
            {/* 마감일 - D-Day 형식 (완료 안 된 경우만) */}
            {!isCompleted && card.due_date && dueDateStatus && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${getDueDateStyle(dueDateStatus)}`}>
                <Calendar className='w-4 h-4' />
                <span>{formatDDay(card.due_date)}</span>
              </div>
            )}
          </div>

          {/* 담당자 아바타 */}
          {displayUser && (
            <div 
              className='flex-shrink-0'
              title={displayUser.username || displayUser.email || ''}
            >
              {displayUser.avatar_url ? (
                <img
                  src={displayUser.avatar_url}
                  alt=''
                  referrerPolicy='no-referrer'
                  className='w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-md'
                />
              ) : (
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 shadow-md'>
                  <span className='text-sm font-bold text-white'>
                    {(displayUser.username || displayUser.email || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 완료 리스트일 때만 완료 처리 버튼 표시 */}
      {isDoneList && (
        <div className={`${isCompleted ? 'absolute bottom-4 left-5 right-5' : 'mt-4 pt-4'} ${isCompleted ? '' : 'border-t border-[rgb(var(--border))]'}`}>
          {!isCompleted ? (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className='w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl
                       bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isCompleting ? (
                <>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  처리 중...
                </>
              ) : (
                <>
                  <PartyPopper className='w-5 h-5' />
                  🎉 완료 처리
                </>
              )}
            </button>
          ) : (
            <div className='flex gap-2'>
              <button
                onClick={handleUncomplete}
                disabled={isCompleting || isDeleting}
                className='flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 
                         text-slate-700 dark:text-slate-300 text-sm font-medium
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                title='완료 상태를 되돌립니다'
              >
                {isCompleting ? (
                  <div className='w-4 h-4 border-2 border-slate-700 dark:border-slate-300 border-t-transparent rounded-full animate-spin' />
                ) : (
                  <>
                    <Undo2 className='w-4 h-4' />
                    되돌리기
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isCompleting || isDeleting}
                className='flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 
                         text-red-600 dark:text-red-400 text-sm font-medium
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                title='카드를 삭제합니다'
              >
                {isDeleting ? (
                  <div className='w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin' />
                ) : (
                  <>
                    <Trash2 className='w-4 h-4' />
                    삭제
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title='카드 삭제'
        message='이 카드를 삭제하시겠습니까? 완료된 작업 페이지에는 기록이 남아있습니다.'
        confirmText='삭제'
        cancelText='취소'
        variant='danger'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
