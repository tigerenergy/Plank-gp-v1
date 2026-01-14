'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { ListWithCards } from '@/types'
import { listColorClasses } from '@/lib/utils'
import { Card } from './Card'
import { AddCardForm } from './AddCardForm'

interface ColumnProps {
  list: ListWithCards
}

export function Column({ list }: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const colorClasses = listColorClasses[list.color]

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  })

  const cardIds = list.cards.map((card) => card.id)

  return (
    <div
      className={`
        relative flex flex-col w-64 sm:w-72 min-w-[256px] sm:min-w-[288px] max-h-full 
        rounded-3xl overflow-hidden backdrop-blur-xl
        ${colorClasses.gradient}
        border border-white/30
        ${isOver ? 'ring-2 ring-white/60 scale-[1.02]' : ''}
        transition-all duration-300 ease-out
      `}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      }}
    >
      {/* 컬럼 헤더 */}
      <div className={`px-4 py-3 ${colorClasses.headerBg} border-b border-white/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className={`font-semibold text-sm ${colorClasses.text}`}>
              {list.title}
            </h2>
            <span className="text-xs text-white bg-white/20 px-2 py-0.5 rounded-full font-medium">
              {list.cards.length}
            </span>
          </div>
          <button
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="더보기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 카드 목록 */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 column-scroll min-h-[100px]"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>

        {isAddingCard && (
          <AddCardForm
            listId={list.id}
            onClose={() => setIsAddingCard(false)}
          />
        )}

        {!isAddingCard && (
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={() => setIsAddingCard(true)}
              className="add-card-btn"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
