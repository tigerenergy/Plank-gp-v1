'use client'

import { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, CheckSquare2, FileText } from 'lucide-react'
import { useBoardStore } from '@/store/useBoardStore'
import { updateCardSchema, type UpdateCardInput } from '@/schema/validation'
import { updateCard, deleteCard } from '@/app/actions/card'
import { getComments } from '@/app/actions/comment'
import { getChecklists } from '@/app/actions/checklist'
import { useEscapeClose } from '@/hooks'
import { ConfirmModal } from './ConfirmModal'
import { CommentList } from './card/CommentList'
import { ChecklistSection } from './card/ChecklistSection'
import { LabelEditor } from './card/LabelEditor'
import { DatePicker } from './ui/DatePicker'
import { fadeIn, slideUp, zoomIn, easeTransition } from '@/lib/animations'
import type { Label } from '@/types'

interface CardModalProps {
  canEdit?: boolean
  isOwner?: boolean
}

export function CardModal({ canEdit = false, isOwner = false }: CardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Zustand 스토어에서 상태 가져오기
  const {
    selectedCard,
    closeCardModal,
    updateCard: updateCardInStore,
    deleteCard: deleteCardInStore,
    updateSelectedCard,
    isCardModalOpen,
    // 카드 모달 관련 상태 (Zustand로 이관)
    cardModalTab,
    cardComments,
    cardChecklists,
    cardModalLoading,
    currentUserId,
    setCardModalTab,
    setCardComments,
    setCardChecklists,
    setCardModalLoading,
  } = useBoardStore()

  // 최소한의 로컬 상태 (UI 전용)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEscapeClose(closeCardModal, isCardModalOpen)

  // 🚀 댓글 & 체크리스트 병렬 로드 (async-parallel)
  useEffect(() => {
    if (!selectedCard || !isCardModalOpen) return

    const loadData = async () => {
      setCardModalLoading({ comments: true, checklists: true })
      
      // Promise.all로 병렬 페칭
      const [commentsResult, checklistsResult] = await Promise.all([
        getComments(selectedCard.id),
        getChecklists(selectedCard.id),
      ])

      if (commentsResult.success && commentsResult.data) {
        setCardComments(commentsResult.data)
      }
      if (checklistsResult.success && checklistsResult.data) {
        setCardChecklists(checklistsResult.data)
      }

      setCardModalLoading({ comments: false, checklists: false })
    }

    loadData()
  }, [selectedCard?.id, isCardModalOpen, setCardComments, setCardChecklists, setCardModalLoading])

  // 라벨 변경
  const handleLabelsChange = async (labels: Label[]) => {
    if (!selectedCard) return

    // 낙관적 업데이트
    updateSelectedCard({ labels })
    updateCardInStore(selectedCard.id, { labels })

    // 서버 저장
    const result = await updateCard({ id: selectedCard.id, labels })
    if (!result.success) {
      toast.error('라벨 저장에 실패했습니다.')
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCardInput>({
    resolver: zodResolver(updateCardSchema),
    defaultValues: {
      id: selectedCard?.id,
      title: selectedCard?.title,
      description: selectedCard?.description || '',
      due_date: selectedCard?.due_date || '',
    },
  })

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeCardModal()
  }

  if (!selectedCard) return null

  const onSubmit = async (data: UpdateCardInput) => {
    // 마감일 필수 체크
    if (!data.due_date) {
      toast.error('마감일을 입력해주세요.')
      return
    }

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
    <AnimatePresence>
      {isCardModalOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm'
          onClick={handleBackdropClick}
          variants={fadeIn}
          initial='initial'
          animate='animate'
          exit='exit'
          transition={easeTransition}
        >
          {/* 모바일: 슬라이드 업, 데스크톱: 줌 인 */}
          <motion.div
            ref={modalRef}
            className='w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto 
                       rounded-t-xl sm:rounded-xl bg-white dark:bg-[#1a1a2e] 
                       border border-gray-200 dark:border-white/10 shadow-2xl'
            variants={typeof window !== 'undefined' && window.innerWidth < 640 ? slideUp : zoomIn}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ ...easeTransition, duration: 0.25 }}
          >
            <div>
              {/* 모바일 드래그 핸들 */}
              <div className='sm:hidden flex justify-center pt-2 pb-1'>
                <div className='w-10 h-1 bg-white/20 rounded-full' />
              </div>

              {/* 헤더 */}
              <ModalHeader register={register} onClose={closeCardModal} />

              {/* 탭 네비게이션 */}
              <div className='px-4 sm:px-6 pt-3 border-b border-gray-200 dark:border-white/5'>
                <div className='flex gap-1'>
                  <TabButton
                    active={cardModalTab === 'details'}
                    onClick={() => setCardModalTab('details')}
                    icon={<FileText className='w-4 h-4' />}
                    label='상세'
                  />
                  <TabButton
                    active={cardModalTab === 'comments'}
                    onClick={() => setCardModalTab('comments')}
                    icon={<MessageSquare className='w-4 h-4' />}
                    label='댓글'
                    count={cardComments.length}
                  />
                  <TabButton
                    active={cardModalTab === 'checklist'}
                    onClick={() => setCardModalTab('checklist')}
                    icon={<CheckSquare2 className='w-4 h-4' />}
                    label='체크리스트'
                    count={cardChecklists.length}
                  />
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className='p-4 sm:p-6 space-y-5 min-h-[200px]'>
                {/* 상세 탭 */}
                {cardModalTab === 'details' && (
                  <>
                    {/* 라벨 (편집 권한 있는 멤버) */}
                    <div>
                      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        라벨
                      </label>
                      {canEdit ? (
                        <LabelEditor
                          labels={selectedCard.labels || []}
                          onChange={handleLabelsChange}
                        />
                      ) : (
                        <div className='flex flex-wrap gap-1.5'>
                          {selectedCard.labels?.length ? (
                            selectedCard.labels.map((label, idx) => (
                              <span key={idx} className='px-2.5 py-1 rounded-full text-xs font-semibold label-blue'>
                                {label.name}
                              </span>
                            ))
                          ) : (
                            <span className='text-sm text-gray-400'>라벨 없음</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 담당자 (카드 생성자 = 담당자, 고정) */}
                    <div>
                      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        담당자
                      </label>
                      <div className='flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgb(var(--secondary))]'>
                        {selectedCard.assignee ? (
                          <>
                            {selectedCard.assignee.avatar_url ? (
                              <img
                                src={selectedCard.assignee.avatar_url}
                                alt=''
                                referrerPolicy='no-referrer'
                                className='w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-700'
                              />
                            ) : (
                              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-700'>
                                <span className='text-xs font-bold text-white'>
                                  {(selectedCard.assignee.username || selectedCard.assignee.email || '?')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className='text-sm font-medium text-[rgb(var(--foreground))]'>
                                {selectedCard.assignee.username || selectedCard.assignee.email?.split('@')[0]}
                              </span>
                              {selectedCard.assignee.email && (
                                <p className='text-xs text-[rgb(var(--muted-foreground))]'>
                                  {selectedCard.assignee.email}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className='text-sm text-[rgb(var(--muted-foreground))]'>담당자 없음</span>
                        )}
                      </div>
                    </div>

                    {/* 마감일 (편집 권한 있는 멤버) */}
                    <div>
                      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        마감일
                      </label>
                      {canEdit ? (
                        <DatePicker
                          value={watch('due_date') || null}
                          onChange={(value) => setValue('due_date', value || '')}
                          placeholder='마감일을 선택해주세요'
                        />
                      ) : (
                        <div className='px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#252542] text-sm'>
                          {selectedCard.due_date ? (
                            new Date(selectedCard.due_date).toLocaleString('ko-KR')
                          ) : (
                            <span className='text-gray-400'>마감일 없음</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 설명 (편집 권한 있는 멤버) */}
                    <div>
                      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        설명
                      </label>
                      {canEdit ? (
                        <>
                          <textarea
                            {...register('description')}
                            rows={4}
                            className='w-full px-4 py-3 rounded-lg 
                                     bg-gray-100 dark:bg-[#252542] 
                                     border border-gray-300 dark:border-white/10 
                                     text-gray-900 dark:text-gray-100
                                     text-sm focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50 
                                     resize-none placeholder-gray-400 dark:placeholder-gray-500'
                            placeholder='카드에 대한 설명을 입력하세요...'
                          />
                          {errors.description && (
                            <p className='text-xs text-red-500 mt-1'>{errors.description.message}</p>
                          )}
                        </>
                      ) : (
                        <div className='px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#252542] text-sm text-gray-900 dark:text-gray-100 min-h-[100px] whitespace-pre-wrap'>
                          {selectedCard.description || <span className='text-gray-400'>설명 없음</span>}
                        </div>
                      )}
                    </div>

                    <div className='pt-3 border-t border-gray-200 dark:border-white/5'>
                      <p className='text-xs text-gray-500 dark:text-gray-500'>
                        생성일: {new Date(selectedCard.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </>
                )}

                {/* 댓글 탭 */}
                {cardModalTab === 'comments' &&
                  (cardModalLoading.comments ? (
                    <div className='flex items-center justify-center py-8'>
                      <div className='animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full' />
                    </div>
                  ) : (
                    <CommentList
                      cardId={selectedCard.id}
                      comments={cardComments}
                      currentUserId={currentUserId}
                      onCommentsChange={setCardComments}
                    />
                  ))}

                {/* 체크리스트 탭 */}
                {cardModalTab === 'checklist' &&
                  (cardModalLoading.checklists ? (
                    <div className='flex items-center justify-center py-8'>
                      <div className='animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full' />
                    </div>
                  ) : (
                    <ChecklistSection
                      cardId={selectedCard.id}
                      checklists={cardChecklists}
                      onChecklistsChange={setCardChecklists}
                      canEdit={canEdit}
                    />
                  ))}
              </div>

              {/* 푸터 (편집 권한자: 수정 가능, 소유자만: 삭제 가능) */}
              <ModalFooter
                isDeleting={isDeleting}
                isSubmitting={isSubmitting}
                canEdit={canEdit}
                isOwner={isOwner}
                currentTab={cardModalTab}
                onDeleteClick={() => setShowDeleteConfirm(true)}
                onClose={closeCardModal}
                onSave={handleSubmit(onSubmit)}
              />
            </div>
          </motion.div>

          {/* 삭제 확인 모달 */}
          <ConfirmModal
            isOpen={showDeleteConfirm}
            title='카드 삭제'
            message='정말 이 카드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
            confirmText='카드 삭제하기'
            cancelText='돌아가기'
            variant='danger'
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 서브 컴포넌트들
interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors
                ${
                  active
                    ? 'bg-gray-100 dark:bg-[#252542] text-gray-900 dark:text-gray-100 border-b-2 border-violet-500'
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span className='ml-1 px-1.5 py-0.5 text-xs rounded-full bg-violet-500/20 dark:bg-violet-600/30 text-violet-600 dark:text-violet-300'>
          {count}
        </span>
      )}
    </button>
  )
}

interface ModalHeaderProps {
  register: ReturnType<typeof useForm<UpdateCardInput>>['register']
  onClose: () => void
}

function ModalHeader({ register, onClose }: ModalHeaderProps) {
  return (
    <div className='sticky top-0 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#1a1a2e]'>
      <div className='flex items-center gap-3 flex-1 mr-4'>
        <div className='w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0'>
          <CardIcon />
        </div>
        <input
          {...register('title')}
          className='text-lg font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none 
                   focus:outline-none w-full placeholder-gray-400 dark:placeholder-gray-500'
          placeholder='카드 제목'
        />
      </div>
      <motion.button
        type='button'
        onClick={onClose}
        className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 
                 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex-shrink-0'
        whileTap={{ scale: 0.9 }}
      >
        <CloseIcon />
      </motion.button>
    </div>
  )
}

interface ModalFooterProps {
  isDeleting: boolean
  isSubmitting: boolean
  canEdit: boolean // 편집 권한 여부
  isOwner: boolean // 보드 소유자 여부 (삭제 권한)
  currentTab: 'details' | 'comments' | 'checklist'
  onDeleteClick: () => void
  onClose: () => void
  onSave: () => void
}

function ModalFooter({
  isDeleting,
  isSubmitting,
  canEdit,
  isOwner,
  currentTab,
  onDeleteClick,
  onClose,
  onSave,
}: ModalFooterProps) {
  // 저장 버튼은 "상세" 탭 + 편집 권한이 있을 때만 표시
  // 댓글/체크리스트는 각각 자체 저장 버튼이 있으므로 푸터에 저장 버튼 불필요
  const showSaveButton = currentTab === 'details' && canEdit
  
  return (
    <div className='sticky bottom-0 px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#151525]'>
      {/* 삭제 버튼: 소유자만 */}
      {isOwner ? (
        <motion.button
          type='button'
          onClick={onDeleteClick}
          disabled={isDeleting}
          className='px-4 py-2.5 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 
                   hover:bg-red-50 dark:hover:bg-red-500/10 
                   rounded-lg transition-all disabled:opacity-50 text-sm font-medium'
          whileTap={{ scale: 0.95 }}
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </motion.button>
      ) : (
        <div />
      )}
      <div className='flex items-center gap-2'>
        {/* 닫기 버튼: 항상 보라색으로 */}
        <motion.button
          type='button'
          onClick={onClose}
          className='flex-1 sm:flex-none px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all text-sm font-medium'
          whileTap={{ scale: 0.95 }}
        >
          닫기
        </motion.button>
        {/* 저장 버튼: 상세 탭 + 편집 권한 있을 때만 */}
        {showSaveButton && (
          <motion.button
            type='button'
            onClick={onSave}
            disabled={isSubmitting}
            className='flex-1 sm:flex-none px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all disabled:opacity-50 text-sm font-medium'
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </motion.button>
        )}
      </div>
    </div>
  )
}

// 아이콘 컴포넌트들
function CardIcon() {
  return (
    <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
    </svg>
  )
}
