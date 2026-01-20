'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { ListWithCards } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { Card } from './Card'
import { AddCardForm } from './AddCardForm'

interface ColumnProps {
  list: ListWithCards
  canEdit?: boolean
}

// 컬럼 상태 아이콘 (인덱스 기반, 사무적 느낌)
const columnIcons = [
  { emoji: '📋', color: 'bg-slate-100 dark:bg-slate-800' }, // 할 일
  { emoji: '🔄', color: 'bg-blue-100 dark:bg-blue-900/50' }, // 진행 중
  { emoji: '👀', color: 'bg-amber-100 dark:bg-amber-900/50' }, // 검토 요청
  { emoji: '✓', color: 'bg-emerald-100 dark:bg-emerald-900/50' }, // 완료
  { emoji: '📌', color: 'bg-purple-100 dark:bg-purple-900/50' }, // 추가
  { emoji: '🎯', color: 'bg-rose-100 dark:bg-rose-900/50' }, // 추가
]

// React Compiler가 자동으로 memoization 처리 (reactCompiler: true)
export function Column({ list, canEdit = false }: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)

  const { lists } = useBoardStore()
  const listIndex = lists.findIndex((l) => l.id === list.id)
  // 완료 리스트면 체크 아이콘, 아니면 기본 아이콘
  const icon = list.is_done_list 
    ? { emoji: '✅', color: 'bg-emerald-100 dark:bg-emerald-900/50' }
    : columnIcons[listIndex % columnIcons.length]

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', list },
  })

  const cardIds = list.cards.map((card) => card.id)

  return (
    <div
      className={`
        relative flex flex-col
        w-full sm:w-[360px] sm:min-w-[360px] sm:flex-shrink-0
        max-h-[calc(100vh-160px)]
        bg-[rgb(var(--card))] rounded-2xl
        border border-[rgb(var(--border))]
        transition-shadow duration-200
        ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[rgb(var(--background))]' : ''}
      `}
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {/* 헤더 */}
      <div className='flex items-center px-4 py-3.5'>
        <div className='flex items-center gap-2.5 flex-1 min-w-0'>
          <div
            className={`w-7 h-7 rounded-lg ${icon.color} flex items-center justify-center text-sm`}
          >
            {icon.emoji}
          </div>

          <h2 className='text-[15px] font-bold text-[rgb(var(--foreground))] truncate'>
            {list.title}
          </h2>

          <span className='flex-shrink-0 text-xs font-semibold text-[rgb(var(--muted-foreground))] bg-[rgb(var(--secondary))] px-2 py-0.5 rounded-full'>
            {list.cards.length}
          </span>
        </div>
      </div>

      {/* 카드 목록 */}
      <div ref={setNodeRef} className='flex-1 overflow-y-auto px-3 pb-3 space-y-3 min-h-[120px]'>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <Card key={card.id} card={card} isDoneList={list.is_done_list} />
          ))}
        </SortableContext>

        {list.cards.length === 0 && !isAddingCard && (
          <div className='py-6 flex flex-col items-center justify-center'>
            {/* 빈 상태 일러스트 */}
            <div className='w-16 h-16 mb-3 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center'>
              <svg 
                className='w-8 h-8 text-slate-300 dark:text-slate-500' 
                fill='none' 
                viewBox='0 0 24 24' 
                stroke='currentColor'
              >
                <path 
                  strokeLinecap='round' 
                  strokeLinejoin='round' 
                  strokeWidth={1.5} 
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' 
                />
              </svg>
            </div>
            <p className='text-sm text-[rgb(var(--muted-foreground))]'>카드가 없습니다</p>
          </div>
        )}
      </div>

      {/* 카드 추가 (편집 권한 있는 멤버) */}
      {canEdit && (
        <div className='px-3 pb-3'>
          {isAddingCard ? (
            <AddCardForm listId={list.id} onClose={() => setIsAddingCard(false)} />
          ) : (
            <button
              onClick={() => setIsAddingCard(true)}
              className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[rgb(var(--border))] hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 text-[rgb(var(--muted-foreground))] hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200'
            >
              <Plus className='w-4 h-4' />
              <span className='text-sm font-medium'>카드 추가</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
