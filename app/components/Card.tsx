'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, User } from 'lucide-react'
import type { Card as CardType, Label, LABEL_COLORS } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { formatShortDate, getDueDateStatus } from '@/lib/utils'

interface CardProps {
  card: CardType
}

// 라벨 색상 맵
const labelColorMap: Record<string, { bg: string; text: string }> = {
  red: { bg: 'bg-red-500', text: 'text-white' },
  orange: { bg: 'bg-orange-500', text: 'text-white' },
  amber: { bg: 'bg-amber-400', text: 'text-amber-900' },
  green: { bg: 'bg-green-500', text: 'text-white' },
  teal: { bg: 'bg-teal-500', text: 'text-white' },
  blue: { bg: 'bg-blue-500', text: 'text-white' },
  indigo: { bg: 'bg-indigo-500', text: 'text-white' },
  purple: { bg: 'bg-purple-500', text: 'text-white' },
  pink: { bg: 'bg-pink-500', text: 'text-white' },
}

// 라벨 표시 컴포넌트
function LabelBadge({ label }: { label: Label }) {
  const colors = labelColorMap[label.color] || labelColorMap.blue
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text}`}>
      {label.name}
    </span>
  )
}

// 마감일 배지 컴포넌트
function DueDateBadge({ dueDate }: { dueDate: string }) {
  const status = getDueDateStatus(dueDate)
  const label = formatShortDate(dueDate)

  const statusStyles = {
    overdue:
      'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
    today:
      'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 animate-pulse',
    soon: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    normal:
      'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
  }

  const Icon = status === 'overdue' || status === 'today' ? AlertCircle : Clock

  return (
    <div
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusStyles[status]}`}
    >
      <Icon className='w-3 h-3' />
      <span>{label}</span>
    </div>
  )
}

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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openCardModal(card)}
      className={`
        group rounded-lg 
        bg-gray-50 dark:bg-[#2a2a45] 
        hover:bg-gray-100 dark:hover:bg-[#353555]
        border border-gray-200 dark:border-white/10 
        hover:border-gray-300 dark:hover:border-white/20
        cursor-grab active:cursor-grabbing
        transition-all duration-200 shadow-sm
        ${isDragging ? 'opacity-50 scale-[1.02] shadow-lg ring-2 ring-violet-500/50' : ''}
      `}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className='p-3'>
        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-2'>
            {card.labels.slice(0, 3).map((label, idx) => (
              <LabelBadge key={idx} label={label} />
            ))}
            {card.labels.length > 3 && (
              <span className='text-[10px] text-gray-400 dark:text-gray-500'>
                +{card.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className='text-sm font-medium text-gray-800 dark:text-gray-100 mb-1 line-clamp-3 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white'>
          {card.title}
        </h3>

        {/* Description preview */}
        {card.description && (
          <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2'>
            {card.description}
          </p>
        )}

        {/* Bottom row: Due Date + Assignee */}
        <div className='flex items-center justify-between gap-2'>
          {/* Due Date */}
          {card.due_date && <DueDateBadge dueDate={card.due_date} />}

          {/* Assignee */}
          {card.assignee && (
            <div className='flex items-center gap-1 ml-auto'>
              {card.assignee.avatar_url ? (
                <img
                  src={card.assignee.avatar_url}
                  alt={card.assignee.username || ''}
                  referrerPolicy='no-referrer'
                  className='w-5 h-5 rounded-full'
                />
              ) : (
                <div className='w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center'>
                  <User className='w-3 h-3 text-violet-500' />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
