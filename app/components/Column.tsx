'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, ClipboardList, Play, Search, CheckCircle2, Flag, Target } from 'lucide-react'
import type { ListWithCards } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { Card } from './Card'

interface ColumnProps {
  list: ListWithCards
  canEdit?: boolean
}

// 컬럼 상태 아이콘 (인덱스 기반, 비즈니스 스타일)
const columnIcons = [
  { icon: ClipboardList, color: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-600 dark:text-slate-300' }, // 할 일
  { icon: Play, color: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-600 dark:text-blue-300' }, // 진행 중
  { icon: Search, color: 'bg-amber-100 dark:bg-amber-900/50', iconColor: 'text-amber-600 dark:text-amber-300' }, // 검토 요청
  { icon: CheckCircle2, color: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-300' }, // 완료
  { icon: Flag, color: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-300' }, // 추가
  { icon: Target, color: 'bg-rose-100 dark:bg-rose-900/50', iconColor: 'text-rose-600 dark:text-rose-300' }, // 추가
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
  const iconConfig = list.is_done_list 
    ? { icon: CheckCircle2, color: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-300' }
    : columnIcons[listIndex % columnIcons.length]
  const IconComponent = iconConfig.icon

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', list },
  })

  const cardIds = list.cards.map((card) => card.id)

  return (
    <div
      className={`
        relative flex flex-col
        w-full flex-1 min-w-[280px]
        min-h-[280px]
        bg-[rgb(var(--card))] rounded-2xl
        border border-[rgb(var(--border))]
        transition-all duration-200
        ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[rgb(var(--background))]' : ''}
      `}
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {/* 헤더 */}
      <div className='flex items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          <div
            className={`w-8 h-8 rounded-lg ${iconConfig.color} flex items-center justify-center`}
          >
            <IconComponent className={`w-4 h-4 ${iconConfig.iconColor}`} />
          </div>

          <h2 className='text-base font-bold text-[rgb(var(--foreground))] truncate'>
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
      <div ref={setNodeRef} className='flex-1 overflow-y-auto px-3 pb-3 space-y-3 min-h-[100px]'>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <Card key={card.id} card={card} isDoneList={list.is_done_list} />
          ))}
        </SortableContext>

        {list.cards.length === 0 && canEdit && (
          <button 
            onClick={handleAddCard}
            className='flex flex-col items-center justify-center py-4 w-full rounded-xl cursor-pointer group'
          >
            {/* 심플한 카드 아이콘 */}
            <div className='relative mb-2 group-hover:scale-110 transition-transform duration-200'>
              <div className='w-12 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-500 flex flex-col items-center justify-center gap-1.5 shadow-sm'>
                <div className='w-8 h-0.5 rounded-full bg-slate-300 dark:bg-slate-500' />
                <div className='w-7 h-0.5 rounded-full bg-slate-300 dark:bg-slate-500' />
                <div className='w-6 h-0.5 rounded-full bg-slate-300 dark:bg-slate-500' />
              </div>
              {/* + 버튼 */}
              <div className='absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md'>
                <Plus className='w-3.5 h-3.5 text-white' />
              </div>
            </div>
            <p className='text-xs font-medium text-[rgb(var(--muted-foreground))]'>카드가 없습니다</p>
            <p className='text-xs text-[rgb(var(--muted-foreground))] mt-0.5 group-hover:text-violet-500 transition-colors'>클릭하여 추가</p>
          </button>
        )}

        {list.cards.length === 0 && !canEdit && (
          <div className='flex flex-col items-center justify-center py-4'>
            {/* 심플한 카드 아이콘 (편집 불가) */}
            <div className='relative mb-2'>
              <div className='w-12 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-500 flex flex-col items-center justify-center gap-1.5 shadow-sm'>
                <div className='w-8 h-0.5 rounded-full bg-slate-300 dark:bg-slate-500' />
                <div className='w-7 h-0.5 rounded-full bg-slate-300 dark:bg-slate-500' />
                <div className='w-6 h-0.5 rounded-full bg-slate-300 dark:bg-slate-500' />
              </div>
            </div>
            <p className='text-xs text-[rgb(var(--muted-foreground))]'>카드가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
