'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import { createList } from '@/app/actions/list'
import { useBoardStore } from '@/store/useBoardStore'
import { getListColor } from '@/lib/utils'
import type { ListWithCards } from '@/types'

export function AddListButton() {
  const params = useParams()
  const boardId = params.id as string
  const { lists, addList } = useBoardStore()

  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isSubmittingRef = useRef(false) // 중복 방지용 ref

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    // 이중 체크로 중복 제출 완전 방지
    if (!title.trim() || isSubmitting || isSubmittingRef.current) return
    
    isSubmittingRef.current = true
    setIsSubmitting(true)
    
    const trimmedTitle = title.trim()
    // 즉시 입력 초기화하여 재제출 방지
    setTitle('')
    
    const result = await createList({ board_id: boardId, title: trimmedTitle })

    if (result.success && result.data) {
      const newList: ListWithCards = {
        ...result.data,
        cards: [],
        color: getListColor(lists.length),
      }
      addList(newList)
      toast.success('리스트가 추가되었습니다.')
      setIsAdding(false)
    } else {
      // 실패 시 제목 복원
      setTitle(trimmedTitle)
      toast.error(result.error || '리스트 추가에 실패했습니다.')
    }
    
    setIsSubmitting(false)
    isSubmittingRef.current = false
  }, [title, isSubmitting, boardId, lists.length, addList])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false)
      setTitle('')
    }
  }

  if (isAdding) {
    return (
      <div className='sm:flex-shrink-0'>
        <form
          onSubmit={handleSubmit}
          className='w-full sm:w-[340px] sm:min-w-[340px] p-4 bg-[rgb(var(--card))] rounded-2xl border border-[rgb(var(--border))]'
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <input
            ref={inputRef}
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='리스트 이름...'
            className='w-full px-4 py-3 mb-3 rounded-xl input'
            disabled={isSubmitting}
          />
          <div className='flex items-center gap-2'>
            <button
              type='submit'
              disabled={!title.trim() || isSubmitting}
              className='flex-1 btn-primary py-2.5 text-sm'
            >
              {isSubmitting ? '추가 중...' : '리스트 추가'}
            </button>
            <button
              type='button'
              onClick={() => {
                setIsAdding(false)
                setTitle('')
              }}
              className='p-2.5 btn-ghost rounded-xl'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className='sm:flex-shrink-0'>
      <button
        onClick={() => setIsAdding(true)}
        className='w-full sm:w-[340px] sm:min-w-[340px] p-4 rounded-2xl border-2 border-dashed border-[rgb(var(--border))] hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 text-[rgb(var(--muted-foreground))] hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-2 transition-all duration-200'
      >
        <Plus className='w-5 h-5' />
        <span className='text-sm font-semibold'>리스트 추가</span>
      </button>
    </div>
  )
}
