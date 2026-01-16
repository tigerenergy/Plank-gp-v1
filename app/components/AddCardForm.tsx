'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X } from 'lucide-react'
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
    setIsSubmitting(true)
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

    setIsSubmitting(false)
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
    <div className='card p-4'>
      <div className='flex items-start gap-2 mb-3'>
        <textarea
          {...register('title')}
          ref={(e) => {
            register('title').ref(e)
            if (e) textareaRef.current = e
          }}
          placeholder='카드 제목을 입력하세요...'
          className='flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none
                     text-[15px] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))]
                     min-h-[80px] leading-relaxed'
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        <button onClick={onClose} className='p-1 btn-ghost rounded-lg'>
          <X className='w-4 h-4' />
        </button>
      </div>
      
      {errors.title && (
        <p className='text-xs text-red-500 mb-3'>{errors.title.message}</p>
      )}
      
      <div className='flex items-center justify-between pt-3 border-t border-[rgb(var(--border))]'>
        <button
          type='button'
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className='btn-primary px-4 py-2 text-sm'
        >
          {isSubmitting ? '추가 중...' : '카드 추가'}
        </button>
        <span className='text-xs text-[rgb(var(--muted-foreground))]'>
          Enter 저장 · Esc 취소
        </span>
      </div>
    </div>
  )
}
