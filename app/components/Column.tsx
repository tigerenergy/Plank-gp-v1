'use client'

import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { ListWithCards } from '@/types'
import { listColorClasses } from '@/lib/utils'
import { useBoardStore } from '@/store/useBoardStore'
import { updateList, deleteList } from '@/app/actions/list'
import { useOutsideClick, useAutoFocus } from '@/hooks'
import { easeTransition } from '@/lib/animations'
import { Card } from './Card'
import { AddCardForm } from './AddCardForm'
import { ConfirmModal } from './ConfirmModal'
import { ColumnHeader } from './column/ColumnHeader'

interface ColumnProps {
  list: ListWithCards
}

export function Column({ list }: ColumnProps) {
  // UI 상태
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(list.title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Refs
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Store 액션
  const updateListInStore = useBoardStore((state) => state.updateList)
  const deleteListInStore = useBoardStore((state) => state.deleteList)

  // 훅
  useOutsideClick(menuRef, () => setIsMenuOpen(false), isMenuOpen)
  useAutoFocus(inputRef, isEditing, true)

  // Droppable 설정
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', list },
  })

  const colorClasses = listColorClasses[list.color]
  const cardIds = list.cards.map((card) => card.id)

  // 제목 수정
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
    } else {
      toast.success('리스트가 수정되었습니다.')
    }
  }

  // 리스트 삭제
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

  // 키보드 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUpdateTitle()
    if (e.key === 'Escape') {
      setEditTitle(list.title)
      setIsEditing(false)
    }
  }

  return (
    <motion.div
      className={`
        relative flex flex-col
        w-full sm:w-72 sm:min-w-[288px] sm:flex-shrink-0
        sm:max-h-[calc(100%-1rem)] h-fit
        rounded-xl overflow-hidden
        bg-white dark:bg-[#1a1a2e]/95
        border border-gray-200 dark:border-white/10
        shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]
        transition-shadow duration-200
      `}
      style={{
        borderTop: `3px solid ${colorClasses.accent}`,
        boxShadow: isOver ? '0 0 0 2px rgba(139, 92, 246, 0.5)' : undefined,
      }}
      animate={{ scale: isOver ? 1.01 : 1 }}
      transition={easeTransition}
    >
      {/* 헤더 */}
      <ColumnHeader
        list={list}
        colorClasses={colorClasses}
        isEditing={isEditing}
        editTitle={editTitle}
        isMenuOpen={isMenuOpen}
        menuRef={menuRef}
        inputRef={inputRef}
        onEditTitleChange={setEditTitle}
        onUpdateTitle={handleUpdateTitle}
        onKeyDown={handleKeyDown}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onStartEdit={() => {
          setIsMenuOpen(false)
          setIsEditing(true)
        }}
        onDeleteClick={() => {
          setIsMenuOpen(false)
          setShowDeleteConfirm(true)
        }}
      />

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

        <AnimatePresence mode='wait'>
          {isAddingCard ? (
            <motion.div
              key='add-form'
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={easeTransition}
            >
              <AddCardForm listId={list.id} onClose={() => setIsAddingCard(false)} />
            </motion.div>
          ) : (
            <motion.button
              key='add-button'
              onClick={() => setIsAddingCard(true)}
              className='w-full flex items-center justify-center gap-2 px-3 py-2.5
                         bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 
                         border border-gray-200 dark:border-white/10 
                         hover:border-gray-300 dark:hover:border-white/20 rounded-lg transition-colors
                         text-gray-600 dark:text-white/70 hover:text-gray-800 dark:hover:text-white/90'
              whileTap={{ scale: 0.95 }}
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              <span className='text-xs font-medium'>카드 추가</span>
            </motion.button>
          )}
        </AnimatePresence>
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
    </motion.div>
  )
}
