'use client'

import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createCardSchema, type CreateCardInput } from '@/schema/validation'
import { createCard } from '@/app/actions/card'
import { useBoardStore } from '@/store/useBoardStore'
import { useDraftStore } from '@/store/useDraftStore'

interface AddCardFormProps {
  listId: string
  onClose: () => void
}

export function AddCardForm({ listId, onClose }: AddCardFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const addCard = useBoardStore((state) => state.addCard)
  
  // 드래프트 스토어
  const { getCardDraft, setCardDraft, clearCardDraft } = useDraftStore()
  const savedDraft = getCardDraft(listId)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      list_id: listId,
      title: savedDraft, // 저장된 드래프트 복원
    },
  })

  // 입력 내용 자동 저장
  const titleValue = watch('title')
  useEffect(() => {
    setCardDraft(listId, titleValue || '')
  }, [titleValue, listId, setCardDraft])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const onSubmit = async (data: CreateCardInput) => {
    const result = await createCard(data)

    if (result.success && result.data) {
      addCard(listId, result.data)
      clearCardDraft(listId) // 성공 시에만 드래프트 삭제
      toast.success('카드가 추가되었습니다.')
      reset()
      onClose()
    } else {
      toast.error(result.error || '카드 추가에 실패했습니다.')
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='rounded-lg p-3 bg-white dark:bg-[#252542] backdrop-blur-sm 
                      border border-gray-200 dark:border-violet-500/30 
                      shadow-sm hover:shadow-md transition-shadow'>
        <textarea
          {...register('title')}
          ref={(e) => {
            register('title').ref(e)
            if (e) textareaRef.current = e
          }}
          placeholder='할 일을 입력하세요...'
          className='w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none
                     text-sm text-gray-800 dark:text-gray-100 
                     placeholder-gray-400 dark:placeholder-gray-500 min-h-[50px]'
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className='text-xs text-red-500 mt-1'>{errors.title.message}</p>
        )}

        <div className='flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-white/10'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium
                       rounded-md transition-all disabled:opacity-50 active:scale-95'
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </button>
          <button
            type='button'
            onClick={onClose}
            className='px-3 py-1.5 rounded-md text-xs font-medium
                       text-gray-600 dark:text-gray-400 
                       hover:text-gray-800 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-white/5 transition-all'
            aria-label='취소'
          >
            취소
          </button>
          <span className='ml-auto text-[10px] text-gray-500 dark:text-gray-500'>
            Enter 저장 · Esc 취소
          </span>
        </div>
      </div>
    </form>
  )
}
