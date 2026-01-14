'use client'

import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import type { ListWithCards } from '@/types'
import { listColorClasses } from '@/lib/utils'
import { useBoardStore } from '@/store/useBoardStore'
import { updateList, deleteList } from '@/app/actions/list'
import { Card } from './Card'
import { AddCardForm } from './AddCardForm'
import { ConfirmModal } from './ConfirmModal'

interface ColumnProps {
  list: ListWithCards
}

export function Column({ list }: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(list.title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const colorClasses = listColorClasses[list.color]

  const updateListInStore = useBoardStore((state) => state.updateList)
  const deleteListInStore = useBoardStore((state) => state.deleteList)

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: 'list',
      list,
    },
  })

  const cardIds = list.cards.map((card) => card.id)

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  // 편집 모드일 때 input에 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // 제목 수정 핸들러
  const handleUpdateTitle = async () => {
    if (!editTitle.trim()) {
      setEditTitle(list.title)
      setIsEditing(false)
      return
    }

    if (editTitle.trim() === list.title) {
      setIsEditing(false)
      return
    }

    // 낙관적 업데이트
    updateListInStore(list.id, { title: editTitle.trim() })
    setIsEditing(false)

    const result = await updateList({ id: list.id, title: editTitle.trim() })
    if (!result.success) {
      // 롤백
      updateListInStore(list.id, { title: list.title })
      toast.error(result.error || '리스트 수정에 실패했습니다.')
    } else {
      toast.success('리스트가 수정되었습니다.')
    }
  }

  // 리스트 삭제 클릭 핸들러
  const handleDeleteClick = () => {
    setIsMenuOpen(false)
    setShowDeleteConfirm(true)
  }

  // 리스트 삭제 확인 핸들러
  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)

    // 낙관적 업데이트
    deleteListInStore(list.id)

    const result = await deleteList(list.id)
    if (!result.success) {
      toast.error(result.error || '리스트 삭제에 실패했습니다.')
      // TODO: 롤백 로직 필요 시 추가
    } else {
      toast.success('리스트가 삭제되었습니다.')
    }
  }

  // Enter/Esc 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateTitle()
    }
    if (e.key === 'Escape') {
      setEditTitle(list.title)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={`
        relative flex flex-col
        w-full sm:w-72 sm:min-w-[288px] sm:flex-shrink-0
        sm:max-h-[calc(100%-1rem)] h-fit
        rounded-xl overflow-hidden
        ${colorClasses.gradient}
        border border-white/10
        ${isOver ? 'ring-2 ring-violet-400/50 scale-[1.01]' : ''}
        transition-all duration-200 ease-out
      `}
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* 컬럼 헤더 */}
      <div
        className={`flex-shrink-0 px-3 sm:px-4 py-3 ${colorClasses.headerBg} border-b border-white/5`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 min-w-0 flex-1'>
            {isEditing ? (
              <input
                ref={inputRef}
                type='text'
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={handleKeyDown}
                className='flex-1 px-2 py-1 text-sm font-semibold bg-[#252542] border border-violet-500/50 
                           rounded-md text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-violet-500/30'
              />
            ) : (
              <>
                <h2 className={`font-semibold text-sm ${colorClasses.text} truncate`}>
                  {list.title}
                </h2>
                <span
                  className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-md font-medium ${colorClasses.badge}`}
                >
                  {list.cards.length}
                </span>
              </>
            )}
          </div>

          {/* 옵션 버튼 & 드롭다운 메뉴 */}
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='flex-shrink-0 p-1.5 text-[#6b7280] hover:text-[#9ca3af] 
                         hover:bg-white/5 rounded-lg transition-all active:scale-95'
              title='더보기'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                />
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {isMenuOpen && (
              <div
                className='absolute right-0 top-full mt-1 w-40 py-1 z-50
                              bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl
                              animate-in fade-in slide-in-from-top-2 duration-150'
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsEditing(true)
                  }}
                  className='w-full px-3 py-2 text-left text-sm text-[#d1d5db] 
                             hover:bg-white/5 flex items-center gap-2 transition-colors'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    />
                  </svg>
                  제목 수정
                </button>
                <button
                  onClick={handleDeleteClick}
                  className='w-full px-3 py-2 text-left text-sm text-red-400 
                             hover:bg-red-500/10 flex items-center gap-2 transition-colors'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 카드 목록 */}
      <div
        ref={setNodeRef}
        className='flex-1 overflow-y-auto px-2 sm:px-2.5 py-2.5 space-y-2 column-scroll min-h-[80px]'
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>

        {isAddingCard && <AddCardForm listId={list.id} onClose={() => setIsAddingCard(false)} />}

        {!isAddingCard && (
          <button onClick={() => setIsAddingCard(true)} className='add-card-btn'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4v16m8-8H4'
              />
            </svg>
            <span className='text-xs font-medium'>카드 추가</span>
          </button>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title='리스트 삭제'
        message={`'${list.title}' 리스트와 ${list.cards.length}개의 카드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText='삭제'
        cancelText='취소'
        variant='danger'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
