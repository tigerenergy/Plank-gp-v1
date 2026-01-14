'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createCardSchema, type CreateCardInput } from '@/schema/validation'
import { createCard } from '@/app/actions/card'
import { useBoardStore } from '@/store/useBoardStore'

interface AddCardFormProps {
  listId: string
  onClose: () => void
}

export function AddCardForm({ listId, onClose }: AddCardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const addCard = useBoardStore((state) => state.addCard)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      list_id: listId,
      title: '',
    },
  })

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const onSubmit = async (data: CreateCardInput) => {
    setIsSubmitting(true)
    const result = await createCard(data)

    if (result.success && result.data) {
      addCard(listId, result.data)
      toast.success('카드가 추가되었습니다.')
      reset()
      onClose()
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-xl p-3 bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg">
        <textarea
          {...register('title')}
          ref={(e) => {
            register('title').ref(e)
            if (e) textareaRef.current = e
          }}
          placeholder="할 일을 입력하세요..."
          className="w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none
                   text-sm text-gray-800 placeholder-gray-400 min-h-[50px]"
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
        )}

        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium
                     rounded-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center
                     text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            aria-label="취소"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  )
}
