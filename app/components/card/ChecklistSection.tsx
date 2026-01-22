'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckSquare, Square, Clock, X } from 'lucide-react'
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
import { createTimeLog } from '@/app/actions/time-log'

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
  
  // 시간 입력 모달 상태
  const [showTimeInputModal, setShowTimeInputModal] = useState(false)
  const [pendingToggleItem, setPendingToggleItem] = useState<{ checklistId: string; item: ChecklistItem } | null>(null)
  const [timeInputHours, setTimeInputHours] = useState('')
  const [isSavingTime, setIsSavingTime] = useState(false)

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
    
    // 체크하는 경우 (현재 체크되지 않은 상태에서 체크로 변경)
    if (!item.is_checked) {
      // 시간 입력 모달 표시
      setPendingToggleItem({ checklistId, item })
      setShowTimeInputModal(true)
      setTimeInputHours('')
      return
    }
    
    // 해제하는 경우는 바로 처리
    setTogglingItemId(item.id)
    try {
      const result = await toggleChecklistItem({
        id: item.id,
        isChecked: false,
      })

      if (result.success) {
        onChecklistsChange(
          checklists.map((c) =>
            c.id === checklistId
              ? {
                  ...c,
                  items: c.items?.map((i) =>
                    i.id === item.id ? { ...i, is_checked: false } : i
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

  // 시간 입력 후 체크 처리
  const handleConfirmTimeAndToggle = async () => {
    if (!pendingToggleItem || !timeInputHours || isSavingTime) return

    const hours = parseFloat(timeInputHours)
    if (isNaN(hours) || hours <= 0) {
      toast.error('올바른 시간을 입력해주세요.')
      return
    }

    if (hours > 24) {
      toast.error('하루 최대 24시간까지 입력 가능합니다.')
      return
    }

    setIsSavingTime(true)
    try {
      // 1. 시간 로그 생성 (체크리스트 항목 내용을 설명으로 사용)
      const timeLogResult = await createTimeLog({
        cardId,
        hours,
        description: `체크리스트: ${pendingToggleItem.item.content}`,
        loggedDate: new Date().toISOString().split('T')[0],
      })

      if (!timeLogResult.success) {
        toast.error(timeLogResult.error || '시간 로그 저장에 실패했습니다.')
        setIsSavingTime(false)
        return
      }

      // 2. 체크리스트 항목 체크
      const toggleResult = await toggleChecklistItem({
        id: pendingToggleItem.item.id,
        isChecked: true,
      })

      if (toggleResult.success) {
        onChecklistsChange(
          checklists.map((c) =>
            c.id === pendingToggleItem.checklistId
              ? {
                  ...c,
                  items: c.items?.map((i) =>
                    i.id === pendingToggleItem.item.id ? { ...i, is_checked: true } : i
                  ),
                }
              : c
          )
        )
        toast.success(`${hours}시간이 기록되었습니다.`)
        setShowTimeInputModal(false)
        setPendingToggleItem(null)
        setTimeInputHours('')
      } else {
        toast.error(toggleResult.error || '체크리스트 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('시간 입력 및 체크 처리 에러:', error)
      toast.error('처리 중 오류가 발생했습니다.')
    } finally {
      setIsSavingTime(false)
    }
  }

  // 시간 입력 취소
  const handleCancelTimeInput = () => {
    setShowTimeInputModal(false)
    setPendingToggleItem(null)
    setTimeInputHours('')
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

      {/* 시간 입력 모달 */}
      {showTimeInputModal && pendingToggleItem && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150'
          onClick={handleCancelTimeInput}
        >
          <div
            className='w-full max-w-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150'
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className='flex items-start gap-4 p-6'>
              <div className='w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400'>
                <Clock className='w-6 h-6' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-base font-bold text-[rgb(var(--foreground))]'>작업 시간 입력</h3>
                <p className='mt-2 text-sm text-[rgb(var(--muted-foreground))] leading-relaxed'>
                  체크리스트 항목을 완료하셨나요? 작업 시간을 입력해주세요.
                </p>
              </div>
              <button onClick={handleCancelTimeInput} className='p-1.5 rounded-lg btn-ghost flex-shrink-0'>
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* 내용 */}
            <div className='px-6 pb-4 space-y-4'>
              {pendingToggleItem && (
                <div className='p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgb(var(--border))]'>
                  <p className='text-xs text-[rgb(var(--muted-foreground))] mb-1'>완료한 항목</p>
                  <p className='text-sm font-medium text-[rgb(var(--foreground))]'>
                    {pendingToggleItem.item.content}
                  </p>
                </div>
              )}
              <div>
                <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-2 block'>
                  작업 시간 (시간)
                </label>
                <div className='relative'>
                  <input
                    type='number'
                    min='0'
                    max='24'
                    step='0.5'
                    value={timeInputHours}
                    onChange={(e) => setTimeInputHours(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isSavingTime && timeInputHours) {
                        handleConfirmTimeAndToggle()
                      }
                    }}
                    className='w-full px-4 py-2.5 rounded-xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all'
                    placeholder='0'
                    autoFocus
                  />
                  <span className='absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[rgb(var(--muted-foreground))]'>
                    시간
                  </span>
                </div>
                <p className='text-xs text-[rgb(var(--muted-foreground))] mt-1'>
                  입력한 시간은 자동으로 주간보고에 반영됩니다.
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <div className='flex justify-end gap-3 px-6 py-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50'>
              <button
                onClick={handleCancelTimeInput}
                disabled={isSavingTime}
                className='btn-secondary px-4 py-2.5 text-sm disabled:opacity-50'
              >
                취소
              </button>
              <button
                onClick={handleConfirmTimeAndToggle}
                disabled={isSavingTime || !timeInputHours || parseFloat(timeInputHours) <= 0}
                className='px-4 py-2.5 text-sm rounded-xl font-medium transition-colors btn-primary disabled:opacity-50'
              >
                {isSavingTime ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2' />
                    저장 중...
                  </>
                ) : (
                  '완료'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
