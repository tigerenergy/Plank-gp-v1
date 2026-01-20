'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { ListWithCards } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { Card } from './Card'

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
  const { lists, openNewCardModal } = useBoardStore()

  // 새 카드 생성 모달 열기 (DB에 저장하지 않고 모달만 열기)
  const handleAddCard = () => {
    openNewCardModal(list.id)
  }
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
        w-full flex-1 min-w-[320px]
        min-h-[320px]
        bg-[rgb(var(--card))] rounded-2xl
        border border-[rgb(var(--border))]
        transition-all duration-200
        ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[rgb(var(--background))]' : ''}
      `}
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {/* 헤더 */}
      <div className='flex items-center justify-between px-5 py-4'>
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          <div
            className={`w-9 h-9 rounded-xl ${icon.color} flex items-center justify-center text-lg`}
          >
            {icon.emoji}
          </div>

          <h2 className='text-lg font-bold text-[rgb(var(--foreground))] truncate'>
            {list.title}
          </h2>

          <span className='flex-shrink-0 text-sm font-semibold text-[rgb(var(--muted-foreground))] bg-[rgb(var(--secondary))] px-2.5 py-1 rounded-full'>
            {list.cards.length}
          </span>
        </div>

        {/* 3D 스타일 + 버튼 (카드가 있고 편집 권한 있을 때) */}
        {canEdit && list.cards.length > 0 && (
          <button
            onClick={handleAddCard}
            className='relative group'
            title='카드 추가'
            style={{ perspective: '300px' }}
          >
            {/* 3D 버튼 */}
            <div 
              className='relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 
                         flex items-center justify-center shadow-lg
                         group-hover:shadow-xl transition-all duration-300
                         group-hover:scale-110 group-active:scale-95'
              style={{ 
                transform: 'rotateX(10deg) rotateY(-10deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* 하이라이트 */}
              <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent' />
              <Plus className='w-6 h-6 text-white relative z-10 drop-shadow-sm' />
            </div>
            {/* 3D 그림자 */}
            <div className='absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-2 bg-purple-900/40 rounded-full blur-sm group-hover:blur-md transition-all' />
          </button>
        )}
      </div>

      {/* 카드 목록 */}
      <div ref={setNodeRef} className='flex-1 overflow-y-auto px-3 pb-3 space-y-3 min-h-[120px]'>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <Card key={card.id} card={card} isDoneList={list.is_done_list} />
          ))}
        </SortableContext>

        {list.cards.length === 0 && canEdit && (
          <button 
            onClick={handleAddCard}
            className='h-full flex flex-col items-center justify-center py-10 w-full hover:bg-[rgb(var(--secondary))]/30 rounded-xl transition-colors cursor-pointer group'
          >
            {/* 3D 스타일 빈 상태 일러스트 */}
            <div className='relative mb-5' style={{ perspective: '500px' }}>
              {/* 그림자 */}
              <div className='absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-300 dark:bg-slate-600 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-opacity' />
              
              {/* 3D 카드 스택 */}
              <div 
                className='relative transition-transform duration-300 group-hover:scale-105'
                style={{ transform: 'rotateX(12deg) rotateY(-8deg)', transformStyle: 'preserve-3d' }}
              >
                {/* 뒤쪽 카드 */}
                <div className='absolute -top-1.5 -left-1.5 w-20 h-24 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 border border-slate-300/50 dark:border-slate-500/50 shadow-sm' />
                
                {/* 앞쪽 카드 */}
                <div className='relative w-20 h-24 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-600 dark:to-slate-500 border border-slate-200 dark:border-slate-400 shadow-xl flex flex-col items-center justify-center gap-2'>
                  {/* 하이라이트 */}
                  <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent dark:from-white/10' />
                  {/* 점선들 */}
                  <div className='w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-400' />
                  <div className='w-10 h-1.5 rounded-full bg-slate-200 dark:bg-slate-400' />
                  <div className='w-8 h-1.5 rounded-full bg-slate-200 dark:bg-slate-400' />
                  
                  {/* + 아이콘 (3D) */}
                  <div 
                    className='absolute -bottom-3 -right-3 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all'
                    style={{ transform: 'translateZ(10px)' }}
                  >
                    <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent' />
                    <Plus className='w-5 h-5 text-white relative z-10' />
                  </div>
                </div>
              </div>
            </div>
            <p className='text-base font-medium text-[rgb(var(--muted-foreground))]'>카드가 없습니다</p>
            <p className='text-sm text-[rgb(var(--muted-foreground))] mt-1 group-hover:text-indigo-500 transition-colors'>클릭하여 추가</p>
          </button>
        )}

        {list.cards.length === 0 && !canEdit && (
          <div className='h-full flex flex-col items-center justify-center py-10'>
            {/* 3D 스타일 빈 상태 일러스트 (편집 불가) */}
            <div className='relative mb-5' style={{ perspective: '500px' }}>
              <div className='absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-300 dark:bg-slate-600 rounded-full blur-lg opacity-40' />
              <div className='relative' style={{ transform: 'rotateX(12deg) rotateY(-8deg)' }}>
                <div className='absolute -top-1.5 -left-1.5 w-20 h-24 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 border border-slate-300/50 dark:border-slate-500/50' />
                <div className='relative w-20 h-24 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-600 dark:to-slate-500 border border-slate-200 dark:border-slate-400 shadow-lg flex flex-col items-center justify-center gap-2'>
                  <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent dark:from-white/10' />
                  <div className='w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-400' />
                  <div className='w-10 h-1.5 rounded-full bg-slate-200 dark:bg-slate-400' />
                  <div className='w-8 h-1.5 rounded-full bg-slate-200 dark:bg-slate-400' />
                </div>
              </div>
            </div>
            <p className='text-base text-[rgb(var(--muted-foreground))]'>카드가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
