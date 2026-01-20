'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, PartyPopper, CheckCircle2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Card as CardType } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { getDueDateStatus } from '@/lib/utils'
import { completeCard, uncompleteCard } from '@/app/actions/card'

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
  const { openCardModal, updateCard } = useBoardStore()

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
    setIsCompleting(true)

    const result = await completeCard(card.id)
    if (result.success && result.data) {
      updateCard(card.id, result.data)
      toast.success('🎉 카드가 완료되었습니다!')
    } else {
      toast.error(result.error || '완료 처리에 실패했습니다.')
    }

    setIsCompleting(false)
  }

  // 완료 취소
  const handleUncomplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCompleting(true)

    const result = await uncompleteCard(card.id)
    if (result.success && result.data) {
      updateCard(card.id, result.data)
      toast.success('완료가 취소되었습니다.')
    } else {
      toast.error(result.error || '완료 취소에 실패했습니다.')
    }

    setIsCompleting(false)
  }

  // 완료된 카드인지
  const isCompleted = card.is_completed

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openCardModal(card)}
      className={`
        card p-4 cursor-pointer select-none min-h-[120px] flex flex-col
        ${isDragging ? 'opacity-60 ring-2 ring-indigo-400 scale-[1.02] rotate-1' : ''}
        ${isCompleted ? 'opacity-60 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : ''}
      `}
    >
      {/* 라벨 */}
      {card.labels && card.labels.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mb-3'>
          {card.labels.slice(0, 4).map((label, idx) => {
            const colorInfo = labelColorHex[label.color] || labelColorHex.blue
            return (
              <span
                key={idx}
                style={{ backgroundColor: colorInfo.bg, color: colorInfo.text }}
                className='px-2.5 py-1 rounded-full text-xs font-semibold'
              >
                {label.name}
              </span>
            )
          })}
          {card.labels.length > 4 && (
            <span className='px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'>
              +{card.labels.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 제목 */}
      <h3 className={`text-[15px] font-semibold leading-relaxed mb-2 flex items-center gap-2 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[rgb(var(--foreground))]'}`}>
        {isCompleted && <CheckCircle2 className='w-4 h-4 flex-shrink-0' />}
        <span className={isCompleted ? 'line-through' : ''}>{card.title}</span>
      </h3>

      {/* 설명 */}
      {card.description && (
        <p className='text-sm text-[rgb(var(--muted-foreground))] line-clamp-2 mb-3 leading-relaxed'>
          {card.description}
        </p>
      )}

      {/* 완료된 카드: 완료 시간 표시 */}
      {isCompleted && card.completed_at && (
        <div className='text-xs text-emerald-600 dark:text-emerald-400 mb-3'>
          ✅ 완료: {new Date(card.completed_at).toLocaleDateString('ko-KR', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      )}

      {/* 하단: 마감일 + 아바타 (항상 아래에 고정) */}
      <div className='flex items-center justify-between mt-auto pt-3'>
        <div className='flex items-center gap-2'>
          {/* 마감일 - D-Day 형식 (완료 안 된 경우만) */}
          {!isCompleted && card.due_date && dueDateStatus && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${getDueDateStyle(dueDateStatus)}`}>
              <Calendar className='w-3.5 h-3.5' />
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
                className='w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-sm'
              />
            ) : (
              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 shadow-sm'>
                <span className='text-xs font-bold text-white'>
                  {(displayUser.username || displayUser.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 완료 리스트일 때만 완료 처리 버튼 표시 */}
      {isDoneList && (
        <div className='mt-3 pt-3 border-t border-[rgb(var(--border))]'>
          {!isCompleted ? (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className='w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <PartyPopper className='w-4 h-4' />
              {isCompleting ? '처리 중...' : '🎉 완료 처리'}
            </button>
          ) : (
            <button
              onClick={handleUncomplete}
              disabled={isCompleting}
              className='w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 
                       text-slate-700 dark:text-slate-300 text-sm font-medium
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Undo2 className='w-4 h-4' />
              {isCompleting ? '처리 중...' : '완료 취소'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
