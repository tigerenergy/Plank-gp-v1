'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card as CardType } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { formatShortDate, getDueDateColorClass } from '@/lib/utils'

interface CardProps {
  card: CardType
}

export function Card({ card }: CardProps) {
  const openCardModal = useBoardStore((state) => state.openCardModal)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openCardModal(card)}
      className={`
        rounded-xl cursor-pointer card-hover
        bg-white/90 backdrop-blur-sm border border-white/50
        ${isDragging ? 'opacity-60 scale-105' : ''}
      `}
    >
      <div className="p-3">
        {/* 제목 */}
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 leading-relaxed">
          {card.title}
        </h3>

        {/* 메타 정보 */}
        <div className="flex items-center gap-2 text-xs">
          {card.due_date && (
            <div className={`date-badge ${getDueDateColorClass(card.due_date)}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatShortDate(card.due_date)}</span>
            </div>
          )}

          {card.description && (
            <div className="flex items-center text-gray-400" title="설명 있음">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
