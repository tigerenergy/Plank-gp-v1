'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useBoardStore } from '@/store/useBoardStore'
import { useDraftStore } from '@/store/useDraftStore'
import { createCardSchema, type CreateCardInput } from '@/schema/validation'
import { createCard } from '@/app/actions/card'

interface AddCardFormProps {
  listId: string
  onClose: () => void
}

export function AddCardForm({ listId, onClose }: AddCardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addCard, openCardModal } = useBoardStore()
  const { cardDrafts, setCardDraft, clearCardDraft } = useDraftStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      list_id: listId,
      title: cardDrafts[listId]?.title || '',
    },
  })

  const cardTitle = watch('title')

  useEffect(() => {
    if (cardTitle) {
      setCardDraft(listId, cardTitle)
    }
  }, [listId, cardTitle, setCardDraft])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const onSubmit = async (data: CreateCardInput) => {
    // 중복 제출 방지
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const result = await createCard(data)

    if (result.success && result.data) {
      addCard(listId, result.data)
      toast.success('카드가 추가되었습니다. 상세 정보를 입력하세요.')
      reset()
      clearCardDraft(listId)
      onClose()
      // 카드 생성 직후 모달 열기 (상세 편집)
      openCardModal(result.data)
    } else {
      toast.error(result.error || '카드 추가에 실패했습니다.')
    }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(onSubmit)()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div>
      <textarea
        {...register('title')}
        ref={(e) => {
          register('title').ref(e)
          if (e) textareaRef.current = e
        }}
        placeholder='카드 제목을 입력하세요...'
        className='w-full resize-none bg-[rgb(var(--secondary))]/50 rounded-xl px-4 py-3 border border-[rgb(var(--border))] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none
                   text-base text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))]
                   min-h-[100px] leading-relaxed transition-all'
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
      />
      
      {errors.title && (
        <p className='text-sm text-red-500 mt-2'>{errors.title.message}</p>
      )}
      
      <div className='flex items-center justify-between mt-4'>
        <button
          type='button'
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className='btn-primary px-6 py-2.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
        >
          {isSubmitting && (
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
          )}
          {isSubmitting ? '추가 중...' : '카드 추가'}
        </button>
        <span className='text-sm text-[rgb(var(--muted-foreground))]'>
          Enter 저장 · Esc 취소
        </span>
      </div>
    </div>
  )
}
