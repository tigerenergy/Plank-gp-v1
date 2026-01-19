'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar } from 'lucide-react'
import type { Card as CardType } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { formatShortDate, getDueDateStatus } from '@/lib/utils'

interface CardProps {
  card: CardType
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
export function Card({ card }: CardProps) {
  const openCardModal = useBoardStore((state) => state.openCardModal)

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openCardModal(card)}
      className={`
        card p-4 cursor-pointer select-none
        ${isDragging ? 'opacity-60 ring-2 ring-indigo-400 scale-[1.02] rotate-1' : ''}
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
      <h3 className='text-[15px] font-semibold text-[rgb(var(--foreground))] leading-relaxed mb-2'>
        {card.title}
      </h3>

      {/* 설명 */}
      {card.description && (
        <p className='text-sm text-[rgb(var(--muted-foreground))] line-clamp-2 mb-3 leading-relaxed'>
          {card.description}
        </p>
      )}

      {/* 하단: 마감일 + 아바타 (선 대신 여백으로 구분) */}
      {(card.due_date || displayUser) && (
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center gap-2'>
            {/* 마감일 */}
            {card.due_date && dueDateStatus && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${getDueDateStyle(dueDateStatus)}`}>
                <Calendar className='w-3.5 h-3.5' />
                <span>{formatShortDate(card.due_date)}</span>
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
      )}
    </div>
  )
}
