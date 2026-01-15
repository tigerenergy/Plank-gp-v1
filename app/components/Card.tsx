'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { MessageSquare, Paperclip, ListTodo, Calendar } from 'lucide-react'
import type { Card as CardType } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { formatShortDate } from '@/lib/utils'
import { cardHover, easeTransition } from '@/lib/animations'

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
    data: { type: 'card', card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hasMetrics =
    (card.comments_count && card.comments_count > 0) ||
    (card.attachments_count && card.attachments_count > 0) ||
    (card.checklist_total && card.checklist_total > 0)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openCardModal(card)}
      className={`
        group rounded-lg bg-white shadow-sm
        border border-gray-200/50
        cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-[1.02] shadow-lg' : ''}
      `}
      variants={cardHover}
      initial='initial'
      whileHover='hover'
      whileTap='tap'
      transition={easeTransition}
    >
      {/* Cover Image */}
      {card.cover_image && (
        <div className='w-full h-32 rounded-t-lg overflow-hidden'>
          <img src={card.cover_image} alt='' className='w-full h-full object-cover' />
        </div>
      )}

      <div className='p-3'>
        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mb-2'>
            {card.tags.map((tag) => (
              <span key={tag.id} className={`tag-pill tag-${tag.color}`}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className='text-sm font-medium text-gray-800 mb-2 line-clamp-3 leading-relaxed group-hover:text-gray-900'>
          {card.title}
        </h3>

        {/* Footer */}
        <div className='flex items-center justify-between gap-2 mt-3'>
          {/* Metrics */}
          {hasMetrics && (
            <div className='flex items-center gap-3'>
              {card.due_date && (
                <div className='flex items-center gap-1 text-gray-500 text-xs'>
                  <Calendar className='w-3.5 h-3.5' />
                  <span>{formatShortDate(card.due_date)}</span>
                </div>
              )}
              {card.comments_count && card.comments_count > 0 && (
                <div className='flex items-center gap-1 text-gray-500 text-xs'>
                  <MessageSquare className='w-3.5 h-3.5' />
                  <span>{card.comments_count}</span>
                </div>
              )}
              {card.attachments_count && card.attachments_count > 0 && (
                <div className='flex items-center gap-1 text-gray-500 text-xs'>
                  <Paperclip className='w-3.5 h-3.5' />
                  <span>{card.attachments_count}</span>
                </div>
              )}
              {card.checklist_total && card.checklist_total > 0 && (
                <div className='flex items-center gap-1 text-gray-500 text-xs'>
                  <ListTodo className='w-3.5 h-3.5' />
                  <span>
                    {card.checklist_completed || 0}/{card.checklist_total}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Members */}
          {card.members && card.members.length > 0 && (
            <div className='flex -space-x-1.5 ml-auto'>
              {card.members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className='w-6 h-6 rounded-full border-2 border-white overflow-hidden'
                  title={member.name}
                >
                  <img src={member.avatar} alt={member.name} className='w-full h-full object-cover' />
                </div>
              ))}
              {card.members.length > 3 && (
                <div className='w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center'>
                  <span className='text-[10px] font-medium text-gray-600'>+{card.members.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
