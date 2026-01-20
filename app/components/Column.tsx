'use client'

import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { MoreHorizontal, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import type { ListWithCards } from '@/types'
import { useBoardStore } from '@/store/useBoardStore'
import { updateList, deleteList, toggleDoneList } from '@/app/actions/list'
import { useOutsideClick, useAutoFocus } from '@/hooks'
import { Card } from './Card'
import { AddCardForm } from './AddCardForm'
import { ConfirmModal } from './ConfirmModal'

interface ColumnProps {
  list: ListWithCards
  canEdit?: boolean
  isOwner?: boolean
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
export function Column({ list, canEdit = false, isOwner = false }: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(list.title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { lists, updateList: updateListInStore, deleteList: deleteListInStore } = useBoardStore()
  const listIndex = lists.findIndex((l) => l.id === list.id)
  // 완료 리스트면 체크 아이콘, 아니면 기본 아이콘
  const icon = list.is_done_list 
    ? { emoji: '✅', color: 'bg-emerald-100 dark:bg-emerald-900/50' }
    : columnIcons[listIndex % columnIcons.length]

  useOutsideClick(menuRef, () => setIsMenuOpen(false), isMenuOpen)
  useAutoFocus(inputRef, isEditing, true)

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', list },
  })

  const cardIds = list.cards.map((card) => card.id)

  const handleUpdateTitle = async () => {
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle || trimmedTitle === list.title) {
      setEditTitle(list.title)
      setIsEditing(false)
      return
    }

    updateListInStore(list.id, { title: trimmedTitle })
    setIsEditing(false)

    const result = await updateList({ id: list.id, title: trimmedTitle })
    if (!result.success) {
      updateListInStore(list.id, { title: list.title })
      toast.error(result.error || '리스트 수정에 실패했습니다.')
    }
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
    deleteListInStore(list.id)

    const result = await deleteList(list.id)
    if (!result.success) {
      toast.error(result.error || '리스트 삭제에 실패했습니다.')
    } else {
      toast.success('리스트가 삭제되었습니다.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUpdateTitle()
    if (e.key === 'Escape') {
      setEditTitle(list.title)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={`
        relative flex flex-col
        w-full sm:w-[340px] sm:min-w-[340px] sm:flex-shrink-0
        max-h-[calc(100vh-160px)]
        bg-[rgb(var(--card))] rounded-2xl
        border border-[rgb(var(--border))]
        transition-shadow duration-200
        ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[rgb(var(--background))]' : ''}
      `}
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {/* 헤더 */}
      <div className='flex items-center justify-between px-4 py-3.5'>
        <div className='flex items-center gap-2.5 flex-1 min-w-0'>
          <div
            className={`w-7 h-7 rounded-lg ${icon.color} flex items-center justify-center text-sm`}
          >
            {icon.emoji}
          </div>

          {isEditing ? (
            <input
              ref={inputRef}
              type='text'
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={handleKeyDown}
              className='flex-1 px-2 py-1 rounded-lg input text-sm font-semibold'
            />
          ) : (
            <h2 className='text-[15px] font-bold text-[rgb(var(--foreground))] truncate'>
              {list.title}
            </h2>
          )}

          <span className='flex-shrink-0 text-xs font-semibold text-[rgb(var(--muted-foreground))] bg-[rgb(var(--secondary))] px-2 py-0.5 rounded-full'>
            {list.cards.length}
          </span>
        </div>

        {/* 메뉴 (편집 권한 있는 멤버) */}
        {canEdit && (
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='p-1.5 rounded-lg btn-ghost'
            >
              <MoreHorizontal className='w-4 h-4' />
            </button>

            {isMenuOpen && (
              <div className='absolute right-0 top-full mt-1 w-52 py-1.5 z-50 rounded-xl border bg-[rgb(var(--card))] border-[rgb(var(--border))] shadow-lg animate-in fade-in slide-in-from-top-1 duration-150'>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsEditing(true)
                  }}
                  className='w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors'
                >
                  <Pencil className='w-4 h-4 text-[rgb(var(--muted-foreground))]' />
                  이름 변경
                </button>
                {/* 완료 리스트 지정 토글 */}
                <button
                  onClick={async () => {
                    setIsMenuOpen(false)
                    const result = await toggleDoneList(list.id)
                    if (result.success && result.data) {
                      updateListInStore(list.id, { is_done_list: result.data.is_done_list })
                      toast.success(
                        result.data.is_done_list 
                          ? '완료 리스트로 지정되었습니다' 
                          : '완료 리스트 지정이 해제되었습니다'
                      )
                    } else {
                      toast.error(result.error || '설정 변경에 실패했습니다.')
                    }
                  }}
                  className='w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors'
                >
                  <CheckCircle2 className={`w-4 h-4 ${list.is_done_list ? 'text-emerald-500' : 'text-[rgb(var(--muted-foreground))]'}`} />
                  {list.is_done_list ? '완료 리스트 해제' : '완료 리스트로 지정'}
                </button>
                {/* 리스트 삭제는 소유자만 가능 */}
                {isOwner && (
                  <>
                    <div className='my-1 border-t border-[rgb(var(--border))]' />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        setShowDeleteConfirm(true)
                      }}
                      className='w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                      삭제
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title='리스트 삭제'
        message={`'${list.title}' 리스트와 ${list.cards.length}개의 카드를 삭제하시겠습니다?`}
        confirmText='삭제하기'
        cancelText='돌아가기'
        variant='danger'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
