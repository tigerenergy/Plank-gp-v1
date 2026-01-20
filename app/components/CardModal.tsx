'use client'

import { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, CheckSquare2, FileText } from 'lucide-react'
import { useBoardStore } from '@/store/useBoardStore'
import { updateCard, deleteCard, createCard } from '@/app/actions/card'
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
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  // Zustand 스토어에서 상태 가져오기
  const {
    selectedCard,
    closeCardModal,
    updateCard: updateCardInStore,
    deleteCard: deleteCardInStore,
    updateSelectedCard,
    addCard,
    isCardModalOpen,
    isNewCardMode,
    newCardListId,
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
  const [newCardLabels, setNewCardLabels] = useState<Label[]>([]) // 새 카드용 라벨 상태

  useEscapeClose(closeCardModal, isCardModalOpen)

  // 모달 열릴 때 새 카드 라벨 초기화
  useEffect(() => {
    if (isNewCardMode) {
      setNewCardLabels([])
    }
  }, [isNewCardMode])

  // 🚀 댓글 & 체크리스트 병렬 로드 (async-parallel) - 새 카드 모드에서는 스킵
  useEffect(() => {
    if (!selectedCard || !isCardModalOpen || isNewCardMode) return

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
  }, [selectedCard?.id, isCardModalOpen, isNewCardMode, setCardComments, setCardChecklists, setCardModalLoading])

  // 라벨 변경
  const handleLabelsChange = async (labels: Label[]) => {
    // 새 카드 모드: 로컬 상태만 업데이트
    if (isNewCardMode) {
      setNewCardLabels(labels)
      return
    }

    // 기존 카드 모드: 서버에 저장
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
    watch,
    setValue,
    reset,
    getValues,
    formState: { isSubmitting },
  } = useForm<{
    id?: string
    list_id?: string
    title?: string
    description?: string
    start_date?: string
    due_date?: string
  }>({
    defaultValues: {
      list_id: '',
      title: '',
      description: '',
      start_date: '',
      due_date: '',
    },
  })

  // 폼 리셋: 모달 열릴 때 + 모드/카드 변경 시
  useEffect(() => {
    if (isNewCardMode) {
      reset({
        list_id: newCardListId || '',
        title: '',
        description: '',
        start_date: '',
        due_date: '',
      })
    } else if (selectedCard) {
      reset({
        id: selectedCard.id,
        title: selectedCard.title || '',
        description: selectedCard.description || '',
        start_date: selectedCard.start_date || '',
        due_date: selectedCard.due_date || '',
      })
    }
  }, [isNewCardMode, selectedCard?.id, newCardListId, reset])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeCardModal()
  }

  // 새 카드 모드가 아닌데 selectedCard가 없으면 렌더링 안 함
  if (!isNewCardMode && !selectedCard) return null

  const onSubmit = async () => {
    // getValues로 현재 폼 값 가져오기
    const { title, description, start_date, due_date } = getValues()

    // 제목 필수 체크
    if (!title?.trim()) {
      toast.error('제목을 입력해주세요.')
      titleRef.current?.focus()
      return
    }
    // 시작일 필수 체크
    if (!start_date) {
      toast.error('시작일을 입력해주세요.')
      // DatePicker는 클릭으로 열어야 하므로 스크롤만
      document.getElementById('start-date-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // 마감일 필수 체크
    if (!due_date) {
      toast.error('마감일을 입력해주세요.')
      document.getElementById('due-date-picker')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // 설명 필수 체크
    if (!description?.trim()) {
      toast.error('설명을 입력해주세요.')
      descriptionRef.current?.focus()
      return
    }

    // 새 카드 생성 모드
    if (isNewCardMode && newCardListId) {
      const result = await createCard({
        list_id: newCardListId,
        title: title.trim(),
        description: description.trim(),
        start_date,
        due_date,
        labels: newCardLabels, // 라벨도 함께 전송
      })
      if (result.success && result.data) {
        addCard(newCardListId, result.data)
        closeCardModal()
        toast.success('카드가 생성되었습니다.')
      } else {
        toast.error(result.error || '카드 생성에 실패했습니다.')
      }
      return
    }

    // 기존 카드 수정 모드
    if (!selectedCard) return
    const result = await updateCard({
      id: selectedCard.id,
      title: title.trim(),
      description: description.trim(),
      start_date,
      due_date,
    })
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
    if (!selectedCard) return
    
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
              {/* 헤더 - 인라인으로 렌더링 */}
              <div className='sticky top-0 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#1a1a2e]'>
                <div className='flex items-center gap-3 flex-1 mr-4'>
                  <div className='w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0'>
                    <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                    </svg>
                  </div>
                  <input
                    {...register('title')}
                    className='text-lg font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:outline-none w-full placeholder-gray-400 dark:placeholder-gray-500'
                    placeholder='카드 제목'
                  />
                </div>
                <motion.button
                  type='button'
                  onClick={closeCardModal}
                  className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex-shrink-0'
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </motion.button>
              </div>

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
                    {/* 라벨 */}
                    <div>
                      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        라벨
                      </label>
                      {canEdit || isNewCardMode ? (
                        <LabelEditor
                          labels={isNewCardMode ? newCardLabels : (selectedCard?.labels || [])}
                          onChange={handleLabelsChange}
                        />
                      ) : (
                        <div className='flex flex-wrap gap-1.5'>
                          {selectedCard?.labels?.length ? (
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

                    {/* 담당자 */}
                    <div>
                      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        담당자
                      </label>
                      <div className='flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgb(var(--secondary))]'>
                        {isNewCardMode ? (
                          <span className='text-sm text-[rgb(var(--muted-foreground))]'>저장 시 본인으로 자동 지정됩니다</span>
                        ) : selectedCard?.assignee ? (
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

                    {/* 시작일 */}
                    <div>
                      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        시작일
                      </label>
                      {canEdit || isNewCardMode ? (
                        <DatePicker
                          value={watch('start_date') || null}
                          onChange={(value) => setValue('start_date', value || '')}
                          placeholder='시작일 선택'
                          hasSuccess={!!watch('start_date')}
                        />
                      ) : (
                        <div className='px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#252542] text-sm'>
                          {selectedCard?.start_date ? (
                            new Date(selectedCard.start_date).toLocaleDateString('ko-KR')
                          ) : (
                            <span className='text-gray-400'>시작일 없음</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 마감일 */}
                    <div>
                      <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        마감일
                      </label>
                      {canEdit || isNewCardMode ? (
                        <DatePicker
                          value={watch('due_date') || null}
                          onChange={(value) => setValue('due_date', value || '')}
                          placeholder='마감일 선택'
                          hasSuccess={!!watch('due_date')}
                        />
                      ) : (
                        <div className='px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#252542] text-sm'>
                          {selectedCard?.due_date ? (
                            new Date(selectedCard.due_date).toLocaleDateString('ko-KR')
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
                      {canEdit || isNewCardMode ? (
                        <>
                          <textarea
                            {...register('description')}
                            className={`w-full px-4 py-3 rounded-lg 
                                     bg-gray-100 dark:bg-[#252542] 
                                     border text-gray-900 dark:text-gray-100
                                     text-sm focus:outline-none 
                                     resize-y min-h-[120px] max-h-[300px] placeholder-gray-400 dark:placeholder-gray-500
                                     transition-all
                                     ${watch('description')?.trim() 
                                       ? 'border-emerald-500 ring-2 ring-emerald-500' 
                                       : 'border-gray-300 dark:border-white/10 focus:border-violet-500 dark:focus:border-violet-500/50'
                                     }`}
                            placeholder='카드에 대한 설명을 입력하세요...'
                          />
                        </>
                      ) : (
                        <div className='px-4 py-3 rounded-lg bg-gray-100 dark:bg-[#252542] text-sm text-gray-900 dark:text-gray-100 min-h-[120px] whitespace-pre-wrap'>
                          {selectedCard?.description || <span className='text-gray-400'>설명 없음</span>}
                        </div>
                      )}
                    </div>

                    {/* 생성일 - 기존 카드만 표시 */}
                    {!isNewCardMode && selectedCard && (
                      <div className='pt-3 border-t border-gray-200 dark:border-white/5'>
                        <p className='text-xs text-gray-500 dark:text-gray-500'>
                          생성일: {new Date(selectedCard.created_at).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* 댓글 탭 - 새 카드 모드에서는 비활성화 */}
                {cardModalTab === 'comments' &&
                  (isNewCardMode ? (
                    <div className='flex flex-col items-center justify-center py-8 text-gray-400'>
                      <MessageSquare className='w-8 h-8 mb-2' />
                      <p className='text-sm'>카드를 먼저 저장해주세요</p>
                    </div>
                  ) : cardModalLoading.comments ? (
                    <div className='flex items-center justify-center py-8'>
                      <div className='animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full' />
                    </div>
                  ) : selectedCard ? (
                    <CommentList
                      cardId={selectedCard.id}
                      comments={cardComments}
                      currentUserId={currentUserId}
                      onCommentsChange={setCardComments}
                    />
                  ) : null)}

                {/* 체크리스트 탭 - 새 카드 모드에서는 비활성화 */}
                {cardModalTab === 'checklist' &&
                  (isNewCardMode ? (
                    <div className='flex flex-col items-center justify-center py-8 text-gray-400'>
                      <CheckSquare2 className='w-8 h-8 mb-2' />
                      <p className='text-sm'>카드를 먼저 저장해주세요</p>
                    </div>
                  ) : cardModalLoading.checklists ? (
                    <div className='flex items-center justify-center py-8'>
                      <div className='animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full' />
                    </div>
                  ) : selectedCard ? (
                    <ChecklistSection
                      cardId={selectedCard.id}
                      checklists={cardChecklists}
                      onChecklistsChange={setCardChecklists}
                      canEdit={canEdit}
                    />
                  ) : null)}
              </div>

              {/* 푸터 (편집 권한자: 수정 가능, 본인 카드만: 삭제 가능) */}
              <ModalFooter
                isDeleting={isDeleting}
                isSubmitting={isSubmitting}
                canEdit={canEdit || isNewCardMode}
                canDelete={!isNewCardMode && selectedCard?.created_by === currentUserId}
                currentTab={cardModalTab}
                isNewCard={isNewCardMode}
                onDeleteClick={() => setShowDeleteConfirm(true)}
                onClose={closeCardModal}
                onSave={onSubmit}
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


interface ModalFooterProps {
  isDeleting: boolean
  isSubmitting: boolean
  canEdit: boolean // 편집 권한 여부
  canDelete: boolean // 삭제 권한 여부 (보드 소유자 OR 카드 생성자)
  currentTab: 'details' | 'comments' | 'checklist'
  isNewCard?: boolean // 새 카드 생성 모드 여부
  onDeleteClick: () => void
  onClose: () => void
  onSave: () => void
}

function ModalFooter({
  isDeleting,
  isSubmitting,
  canEdit,
  canDelete,
  currentTab,
  isNewCard = false,
  onDeleteClick,
  onClose,
  onSave,
}: ModalFooterProps) {
  // 저장 버튼은 "상세" 탭 + 편집 권한이 있을 때만 표시
  // 댓글/체크리스트는 각각 자체 저장 버튼이 있으므로 푸터에 저장 버튼 불필요
  const showSaveButton = currentTab === 'details' && canEdit
  
  return (
    <div className='sticky bottom-0 px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#151525]'>
      {/* 삭제 버튼: 기존 카드 + 카드 생성자만 */}
      {canDelete ? (
        <motion.button
          type='button'
          onClick={onDeleteClick}
          disabled={isDeleting}
          className='px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white
                   rounded-lg transition-all disabled:opacity-50 text-sm font-medium'
          whileTap={{ scale: 0.95 }}
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </motion.button>
      ) : (
        <div />
      )}
      <div className='flex items-center gap-2'>
        {/* 닫기/취소 버튼 */}
        <motion.button
          type='button'
          onClick={onClose}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg transition-all text-sm font-medium ${
            isNewCard 
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {isNewCard ? '취소' : '닫기'}
        </motion.button>
        {/* 저장/생성 버튼: 상세 탭 + 편집 권한 있을 때만 */}
        {showSaveButton && (
          <motion.button
            type='button'
            onClick={onSave}
            disabled={isSubmitting}
            className='flex-1 sm:flex-none px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all disabled:opacity-50 text-sm font-medium'
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? (isNewCard ? '생성 중...' : '저장 중...') : (isNewCard ? '생성' : '저장')}
          </motion.button>
        )}
      </div>
    </div>
  )
}

