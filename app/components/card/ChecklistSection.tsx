'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react'
import { toast } from 'sonner'
import type { Checklist, ChecklistItem } from '@/types'
import {
  createChecklist,
  deleteChecklist,
  updateChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from '@/app/actions/checklist'

interface ChecklistSectionProps {
  cardId: string
  checklists: Checklist[]
  onChecklistsChange: (checklists: Checklist[]) => void
  canEdit?: boolean
}

export function ChecklistSection({
  cardId,
  checklists,
  onChecklistsChange,
  canEdit = false,
}: ChecklistSectionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({})
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingItemId, setSubmittingItemId] = useState<string | null>(null)
  const [deletingChecklistId, setDeletingChecklistId] = useState<string | null>(null)
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  // 체크리스트 생성
  const handleCreateChecklist = async () => {
    if (!newTitle.trim() || isSubmitting) {
      setNewTitle('')
      setIsCreating(false)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createChecklist({ cardId, title: newTitle.trim() })
      if (result.success && result.data) {
        onChecklistsChange([...checklists, result.data])
        setNewTitle('')
        setIsCreating(false)
        toast.success('체크리스트가 추가되었습니다.')
      } else {
        toast.error(result.error || '체크리스트 추가에 실패했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 체크리스트 삭제
  const handleDeleteChecklist = async (id: string) => {
    if (deletingChecklistId === id) return
    
    setDeletingChecklistId(id)
    try {
      const result = await deleteChecklist(id)
      if (result.success) {
        onChecklistsChange(checklists.filter((c) => c.id !== id))
        toast.success('체크리스트가 삭제되었습니다.')
      } else {
        toast.error(result.error || '삭제에 실패했습니다.')
      }
    } finally {
      setDeletingChecklistId(null)
    }
  }

  // 체크리스트 제목 수정
  const handleUpdateTitle = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingTitleId(null)
      return
    }

    const result = await updateChecklist({ id, title: editTitle.trim() })
    if (result.success) {
      onChecklistsChange(
        checklists.map((c) => (c.id === id ? { ...c, title: editTitle.trim() } : c))
      )
      setEditingTitleId(null)
    } else {
      toast.error(result.error || '수정에 실패했습니다.')
    }
  }

  // 항목 추가
  const handleAddItem = async (checklistId: string) => {
    const content = newItemInputs[checklistId]?.trim()
    if (!content || submittingItemId === checklistId) return

    // 입력창 즉시 초기화
    setNewItemInputs((prev) => ({ ...prev, [checklistId]: '' }))
    setSubmittingItemId(checklistId)

    try {
      // 서버에 저장 먼저 (낙관적 업데이트 대신 확실한 방식)
      const result = await addChecklistItem({ checklistId, content })
      if (result.success && result.data) {
        // 서버 응답으로 UI 업데이트 - 기존 items에 새 항목 추가
        const newChecklists = checklists.map((c) =>
          c.id === checklistId ? { ...c, items: [...(c.items || []), result.data!] } : c
        )
        onChecklistsChange(newChecklists)
        toast.success('항목이 추가되었습니다.')
      } else {
        toast.error(result.error || '항목 추가에 실패했습니다.')
      }
    } finally {
      setSubmittingItemId(null)
    }
  }

  // 항목 체크/해제
  const handleToggleItem = async (checklistId: string, item: ChecklistItem) => {
    if (togglingItemId === item.id) return
    
    setTogglingItemId(item.id)
    try {
      const result = await toggleChecklistItem({
        id: item.id,
        isChecked: !item.is_checked,
      })

      if (result.success) {
        onChecklistsChange(
          checklists.map((c) =>
            c.id === checklistId
              ? {
                  ...c,
                  items: c.items?.map((i) =>
                    i.id === item.id ? { ...i, is_checked: !i.is_checked } : i
                  ),
                }
              : c
          )
        )
      } else {
        toast.error(result.error || '업데이트에 실패했습니다.')
      }
    } finally {
      setTogglingItemId(null)
    }
  }

  // 항목 삭제
  const handleDeleteItem = async (checklistId: string, itemId: string) => {
    if (deletingItemId === itemId) return
    
    setDeletingItemId(itemId)
    try {
      const result = await deleteChecklistItem(itemId)
      if (result.success) {
        onChecklistsChange(
          checklists.map((c) =>
            c.id === checklistId ? { ...c, items: c.items?.filter((i) => i.id !== itemId) } : c
          )
        )
      } else {
        toast.error(result.error || '삭제에 실패했습니다.')
      }
    } finally {
      setDeletingItemId(null)
    }
  }

  // 진행률 계산
  const getProgress = (items: ChecklistItem[] = []) => {
    if (items.length === 0) return 0
    const checked = items.filter((i) => i.is_checked).length
    return Math.round((checked / items.length) * 100)
  }

  return (
    <div className='space-y-4'>
      {/* 체크리스트 목록 */}
      <AnimatePresence>
        {checklists.map((checklist) => {
          const progress = getProgress(checklist.items)

          return (
            <motion.div
              key={checklist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='bg-gray-100 dark:bg-[#252542]/50 rounded-lg p-4 space-y-4'
            >
              {/* 헤더 */}
              <div className='flex items-center justify-between'>
                {editingTitleId === checklist.id && canEdit ? (
                  <input
                    type='text'
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleUpdateTitle(checklist.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateTitle(checklist.id)
                      if (e.key === 'Escape') setEditingTitleId(null)
                    }}
                    className='flex-1 px-3 py-2 bg-white dark:bg-[#252542] border border-gray-300 dark:border-white/10 rounded-lg
                             text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50'
                    autoFocus
                  />
                ) : (
                  <h4
                    onClick={() => {
                      if (canEdit) {
                        setEditingTitleId(checklist.id)
                        setEditTitle(checklist.title)
                      }
                    }}
                    className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${
                      canEdit
                        ? 'cursor-pointer hover:text-violet-600 dark:hover:text-violet-400'
                        : ''
                    }`}
                  >
                    {checklist.title}
                  </h4>
                )}

                {canEdit && (
                  <button
                    onClick={() => handleDeleteChecklist(checklist.id)}
                    disabled={deletingChecklistId === checklist.id}
                    className='p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50'
                  >
                    {deletingChecklistId === checklist.id ? (
                      <div className='w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin' />
                    ) : (
                      <Trash2 className='w-4 h-4' />
                    )}
                  </button>
                )}
              </div>

              {/* 진행률 바 */}
              <div className='flex items-center gap-3'>
                <span className='text-xs text-gray-500 dark:text-gray-400 w-8'>{progress}%</span>
                <div className='flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden'>
                  <motion.div
                    className={`h-full rounded-full ${
                      progress === 100 ? 'bg-green-500' : 'bg-violet-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 항목 목록 */}
              <div className='space-y-1'>
                {checklist.items?.map((item) => (
                  <div key={item.id} className='flex items-center gap-2 group py-1'>
                    {canEdit ? (
                      <button
                        onClick={() => handleToggleItem(checklist.id, item)}
                        disabled={togglingItemId === item.id}
                        className='flex-shrink-0 disabled:opacity-50'
                      >
                        {togglingItemId === item.id ? (
                          <div className='w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
                        ) : item.is_checked ? (
                          <CheckSquare className='w-4 h-4 text-violet-500 dark:text-violet-400' />
                        ) : (
                          <Square className='w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300' />
                        )}
                      </button>
                    ) : (
                      <div className='flex-shrink-0'>
                        {item.is_checked ? (
                          <CheckSquare className='w-4 h-4 text-violet-500 dark:text-violet-400' />
                        ) : (
                          <Square className='w-4 h-4 text-gray-400 dark:text-gray-500' />
                        )}
                      </div>
                    )}
                    <span
                      className={`flex-1 text-sm ${
                        item.is_checked
                          ? 'text-gray-400 dark:text-gray-500 line-through'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.content}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => handleDeleteItem(checklist.id, item.id)}
                        disabled={deletingItemId === item.id}
                        className='p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all disabled:opacity-50'
                      >
                        {deletingItemId === item.id ? (
                          <div className='w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin' />
                        ) : (
                          <Trash2 className='w-3 h-3' />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 항목 추가 입력 (소유자만) */}
              {canEdit && (
                <div className='flex gap-3'>
                  <input
                    type='text'
                    value={newItemInputs[checklist.id] || ''}
                    onChange={(e) =>
                      setNewItemInputs((prev) => ({
                        ...prev,
                        [checklist.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddItem(checklist.id)
                    }}
                    placeholder='항목 추가...'
                    className='flex-1 px-3 py-2 bg-transparent border border-gray-300 dark:border-white/10 rounded-lg
                             text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                             focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50'
                  />
                  <button
                    onClick={() => handleAddItem(checklist.id)}
                    disabled={
                      !newItemInputs[checklist.id]?.trim() || submittingItemId === checklist.id
                    }
                    className='px-3 py-2 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    {submittingItemId === checklist.id && (
                      <div className='w-3 h-3 border-2 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin' />
                    )}
                    {submittingItemId === checklist.id ? '추가 중...' : '추가'}
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* 체크리스트 추가 (소유자만) */}
      {canEdit &&
        (isCreating ? (
          <div className='flex gap-3'>
            <input
              type='text'
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateChecklist()
                if (e.key === 'Escape') {
                  setIsCreating(false)
                  setNewTitle('')
                }
              }}
              placeholder='체크리스트 제목...'
              className='flex-1 px-4 py-3 bg-white dark:bg-[#252542] border border-gray-300 dark:border-white/10 rounded-lg
                       text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50'
              autoFocus
            />
            <button
              onClick={handleCreateChecklist}
              disabled={isSubmitting || !newTitle.trim()}
              className='px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {isSubmitting && (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              )}
              {isSubmitting ? '추가 중...' : '추가'}
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewTitle('')
              }}
              className='px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm'
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className='flex items-center gap-2 w-full px-3 py-2 border border-dashed border-gray-300 dark:border-white/10
                     rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                     hover:border-gray-400 dark:hover:border-white/20 transition-colors'
          >
            <Plus className='w-4 h-4' />
            체크리스트 추가
          </button>
        ))}

      {/* 비소유자용 안내 */}
      {!canEdit && checklists.length === 0 && (
        <p className='text-center text-sm text-gray-400 py-4'>체크리스트가 없습니다.</p>
      )}
    </div>
  )
}
