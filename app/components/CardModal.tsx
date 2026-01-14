'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useBoardStore } from '@/store/useBoardStore'
import { updateCardSchema, type UpdateCardInput } from '@/schema/validation'
import { updateCard, deleteCard } from '@/app/actions/card'
import { ConfirmModal } from './ConfirmModal'

export function CardModal() {
  const modalRef = useRef<HTMLDivElement>(null)
  const {
    selectedCard,
    closeCardModal,
    updateCard: updateCardInStore,
    deleteCard: deleteCardInStore,
    updateSelectedCard,
  } = useBoardStore()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCardInput>({
    resolver: zodResolver(updateCardSchema),
    defaultValues: {
      id: selectedCard?.id,
      title: selectedCard?.title,
      description: selectedCard?.description || '',
      due_date: selectedCard?.due_date ? selectedCard.due_date.slice(0, 16) : '',
    },
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCardModal()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeCardModal])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeCardModal()
  }

  if (!selectedCard) return null

  const onSubmit = async (data: UpdateCardInput) => {
    const result = await updateCard(data)
    if (result.success && result.data) {
      updateCardInStore(selectedCard.id, result.data)
      updateSelectedCard(result.data)
      closeCardModal()
      toast.success('카드가 수정되었습니다.')
    } else {
      toast.error(result.error || '수정에 실패했습니다.')
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
    setIsDeleting(true)
    const result = await deleteCard(selectedCard.id)
    if (result.success) {
      deleteCardInStore(selectedCard.id)
      closeCardModal()
      toast.success('카드가 삭제되었습니다.')
    } else {
      toast.error(result.error || '삭제에 실패했습니다.')
    }
    setIsDeleting(false)
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm'
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className='w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto 
                   rounded-t-xl sm:rounded-xl bg-[#1a1a2e] border border-white/10
                   shadow-[0_25px_60px_rgba(0,0,0,0.5)]'
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 모바일 드래그 핸들 */}
          <div className='sm:hidden flex justify-center pt-2 pb-1'>
            <div className='w-10 h-1 bg-white/20 rounded-full' />
          </div>

          {/* 헤더 */}
          <div className='sticky top-0 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-white/5 bg-[#1a1a2e]'>
            <div className='flex items-center gap-3 flex-1 mr-4'>
              <div className='w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0'>
                <svg
                  className='w-4 h-4 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
              </div>
              <input
                {...register('title')}
                className='text-lg font-semibold text-[#f3f4f6] bg-transparent border-none 
                         focus:outline-none w-full placeholder-[#6b7280]'
                placeholder='카드 제목'
              />
            </div>
            <button
              type='button'
              onClick={closeCardModal}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7280] 
                       hover:text-[#9ca3af] hover:bg-white/5 transition-all active:scale-95 flex-shrink-0'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <div className='p-4 sm:p-6 space-y-5'>
            {/* 마감일 */}
            <div>
              <label className='block text-sm font-medium text-[#9ca3af] mb-2'>마감일</label>
              <input
                type='datetime-local'
                {...register('due_date')}
                className='w-full px-4 py-2.5 rounded-lg bg-[#252542] border border-white/10 text-[#f3f4f6]
                         text-sm focus:outline-none focus:border-violet-500/50 
                         [color-scheme:dark]'
              />
            </div>

            {/* 설명 */}
            <div>
              <label className='block text-sm font-medium text-[#9ca3af] mb-2'>설명</label>
              <textarea
                {...register('description')}
                rows={4}
                className='w-full px-4 py-3 rounded-lg bg-[#252542] border border-white/10 text-[#f3f4f6]
                         text-sm focus:outline-none focus:border-violet-500/50 resize-none
                         placeholder-[#6b7280]'
                placeholder='카드에 대한 설명을 입력하세요...'
              />
              {errors.description && (
                <p className='text-xs text-red-400 mt-1'>{errors.description.message}</p>
              )}
            </div>

            {/* 생성일 */}
            <div className='pt-3 border-t border-white/5'>
              <p className='text-xs text-[#6b7280]'>
                생성일: {new Date(selectedCard.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>

          {/* 푸터 */}
          <div className='sticky bottom-0 px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 border-t border-white/5 bg-[#151525]'>
            <button
              type='button'
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className='px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                       rounded-lg transition-all disabled:opacity-50 text-sm font-medium active:scale-95'
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={closeCardModal}
                className='flex-1 sm:flex-none px-4 py-2.5 text-[#9ca3af] hover:text-[#f3f4f6] 
                          hover:bg-white/5 rounded-lg transition-all text-sm active:scale-95'
              >
                취소
              </button>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 sm:flex-none px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg 
                         transition-all disabled:opacity-50 text-sm font-medium active:scale-95'
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title='카드 삭제'
        message='정말 이 카드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
        confirmText='삭제'
        cancelText='취소'
        variant='danger'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
