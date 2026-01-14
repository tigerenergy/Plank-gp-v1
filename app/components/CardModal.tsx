'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useBoardStore } from '@/store/useBoardStore'
import { updateCardSchema, type UpdateCardInput } from '@/schema/validation'
import { updateCard, deleteCard } from '@/app/actions/card'

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

  const handleDelete = async () => {
    if (!confirm('정말 이 카드를 삭제하시겠습니까?')) return
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 헤더 */}
          <div className="sticky top-0 px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
            <div className="flex items-center gap-3 flex-1 mr-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <input
                {...register('title')}
                className="text-lg font-semibold text-gray-800 bg-transparent border-none 
                         focus:outline-none w-full placeholder-gray-400"
                placeholder="카드 제목"
              />
            </div>
            <button
              type="button"
              onClick={closeCardModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 
                       hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* 마감일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">마감일</label>
              <input
                type="datetime-local"
                {...register('due_date')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="카드에 대한 설명을 입력하세요..."
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* 생성일 */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                생성일: {new Date(selectedCard.created_at).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 
                       rounded-xl transition-all disabled:opacity-50 text-sm font-medium"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeCardModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl transition-all text-sm"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl 
                         transition-all disabled:opacity-50 text-sm font-medium"
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
