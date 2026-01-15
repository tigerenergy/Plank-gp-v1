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
}

export function ChecklistSection({
  cardId,
  checklists,
  onChecklistsChange,
}: ChecklistSectionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({})
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // 체크리스트 생성
  const handleCreateChecklist = async () => {
    if (!newTitle.trim()) {
      setNewTitle('')
      setIsCreating(false)
      return
    }

    const result = await createChecklist({ cardId, title: newTitle.trim() })
    if (result.success && result.data) {
      onChecklistsChange([...checklists, result.data])
      setNewTitle('')
      setIsCreating(false)
      toast.success('체크리스트가 추가되었습니다.')
    } else {
      toast.error(result.error || '체크리스트 추가에 실패했습니다.')
    }
  }

  // 체크리스트 삭제
  const handleDeleteChecklist = async (id: string) => {
    const result = await deleteChecklist(id)
    if (result.success) {
      onChecklistsChange(checklists.filter((c) => c.id !== id))
      toast.success('체크리스트가 삭제되었습니다.')
    } else {
      toast.error(result.error || '삭제에 실패했습니다.')
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
    if (!content) return

    // 입력창 즉시 초기화
    setNewItemInputs((prev) => ({ ...prev, [checklistId]: '' }))

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
  }

  // 항목 체크/해제
  const handleToggleItem = async (checklistId: string, item: ChecklistItem) => {
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
  }

  // 항목 삭제
  const handleDeleteItem = async (checklistId: string, itemId: string) => {
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
              className='bg-gray-100 dark:bg-[#252542]/50 rounded-lg p-3 space-y-3'
            >
              {/* 헤더 */}
              <div className='flex items-center justify-between'>
                {editingTitleId === checklist.id ? (
                  <input
                    type='text'
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => handleUpdateTitle(checklist.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateTitle(checklist.id)
                      if (e.key === 'Escape') setEditingTitleId(null)
                    }}
                    className='flex-1 px-2 py-1 bg-white dark:bg-[#252542] border border-gray-300 dark:border-white/10 rounded
                             text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50'
                    autoFocus
                  />
                ) : (
                  <h4
                    onClick={() => {
                      setEditingTitleId(checklist.id)
                      setEditTitle(checklist.title)
                    }}
                    className='text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-violet-600 dark:hover:text-violet-400'
                  >
                    {checklist.title}
                  </h4>
                )}

                <button
                  onClick={() => handleDeleteChecklist(checklist.id)}
                  className='p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>

              {/* 진행률 바 */}
              <div className='flex items-center gap-2'>
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
                    <button
                      onClick={() => handleToggleItem(checklist.id, item)}
                      className='flex-shrink-0'
                    >
                      {item.is_checked ? (
                        <CheckSquare className='w-4 h-4 text-violet-500 dark:text-violet-400' />
                      ) : (
                        <Square className='w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300' />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        item.is_checked
                          ? 'text-gray-400 dark:text-gray-500 line-through'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.content}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(checklist.id, item.id)}
                      className='p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all'
                    >
                      <Trash2 className='w-3 h-3' />
                    </button>
                  </div>
                ))}
              </div>

              {/* 항목 추가 입력 */}
              <div className='flex gap-2'>
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
                  className='flex-1 px-2 py-1.5 bg-transparent border border-gray-300 dark:border-white/10 rounded
                           text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50'
                />
                <button
                  onClick={() => handleAddItem(checklist.id)}
                  disabled={!newItemInputs[checklist.id]?.trim()}
                  className='px-2 py-1.5 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 
                           disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  추가
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* 체크리스트 추가 */}
      {isCreating ? (
        <div className='flex gap-2'>
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
            className='flex-1 px-3 py-2 bg-white dark:bg-[#252542] border border-gray-300 dark:border-white/10 rounded-lg
                     text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                     focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50'
            autoFocus
          />
          <button
            onClick={handleCreateChecklist}
            className='px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg'
          >
            추가
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
      )}
    </div>
  )
}
