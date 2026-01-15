'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import { useHomeStore } from '@/store/useHomeStore'
import { useDraftStore } from '@/store/useDraftStore'
import { getAllBoards, createBoard, deleteBoard, updateBoard } from './actions/board'
import { ConfirmModal } from './components/ConfirmModal'
import { BoardCard } from './components/home/BoardCard'
import { CreateBoardForm } from './components/home/CreateBoardForm'
import { EmptyState } from './components/home/EmptyState'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { Header } from './components/layout/Header'
import { staggerContainer, staggerItem, easeTransition } from '@/lib/animations'

interface HomeClientProps {
  user: User | null
}

export default function HomeClient({ user }: HomeClientProps) {
  const router = useRouter()
  const {
    boards,
    isLoading,
    isCreating,
    editingBoardId,
    editingTitle,
    deleteTarget,
    setBoards,
    setLoading,
    removeBoard,
    updateBoard: updateBoardInStore,
    startCreating,
    cancelCreating,
    startEditing,
    cancelEditing,
    setEditingTitle,
    setDeleteTarget,
  } = useHomeStore()

  // 드래프트 스토어 (persist)
  const { newBoardTitle, setNewBoardTitle, clearNewBoardTitle } = useDraftStore()

  // 보드 목록 로드
  useEffect(() => {
    const loadBoards = async () => {
      setLoading(true)
      const result = await getAllBoards()
      if (result.success && result.data) {
        setBoards(result.data)
      } else {
        toast.error(result.error || '보드 목록을 불러오는데 실패했습니다.')
      }
    }
    loadBoards()
  }, [setBoards, setLoading])

  // 보드 생성
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardTitle.trim()) {
      toast.error('보드 제목을 입력해주세요.')
      return
    }

    const result = await createBoard(newBoardTitle.trim())
    if (result.success && result.data) {
      toast.success('보드가 생성되었습니다!')
      clearNewBoardTitle() // 성공 시에만 드래프트 삭제
      cancelCreating()
      router.push(`/board/${result.data.id}`)
    } else {
      toast.error(result.error || '보드 생성에 실패했습니다.')
    }
  }

  // 보드 수정
  const handleUpdateBoard = async (e: React.FormEvent, boardId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!editingTitle.trim()) {
      toast.error('보드 제목을 입력해주세요.')
      return
    }

    const result = await updateBoard(boardId, { title: editingTitle.trim() })
    if (result.success && result.data) {
      toast.success('보드가 수정되었습니다.')
      updateBoardInStore(boardId, result.data)
      cancelEditing()
    } else {
      toast.error(result.error || '보드 수정에 실패했습니다.')
    }
  }

  // 보드 삭제
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    const boardId = deleteTarget.id
    setDeleteTarget(null)

    const result = await deleteBoard(boardId)
    if (result.success) {
      toast.success('보드가 삭제되었습니다.')
      removeBoard(boardId)
    } else {
      toast.error(result.error || '보드 삭제에 실패했습니다.')
    }
  }

  return (
    <main className='min-h-screen'>
      <Header user={user} />

      {/* 메인 컨텐츠 */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-8'>
        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={easeTransition}
        >
          <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>내 보드</h2>
          <p className='text-gray-500 dark:text-gray-400'>보드를 선택하거나 새로 만들어보세요</p>
        </motion.div>

        {isLoading ? (
          <LoadingSpinner message='보드를 불러오는 중...' />
        ) : (
          <motion.div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            variants={staggerContainer}
            initial='initial'
            animate='animate'
          >
            <AnimatePresence>
              {boards.map((board) => (
                <motion.div key={board.id} variants={staggerItem} transition={easeTransition} layout>
                  <BoardCard
                    board={board}
                    isEditing={editingBoardId === board.id}
                    editingTitle={editingTitle}
                    onNavigate={() => router.push(`/board/${board.id}`)}
                    onStartEdit={startEditing}
                    onCancelEdit={cancelEditing}
                    onEditingTitleChange={setEditingTitle}
                    onUpdate={handleUpdateBoard}
                    onDelete={setDeleteTarget}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div variants={staggerItem} transition={easeTransition}>
              <AnimatePresence mode='wait'>
                {isCreating ? (
                  <motion.div
                    key='create-form'
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={easeTransition}
                  >
                    <CreateBoardForm
                      title={newBoardTitle}
                      onTitleChange={setNewBoardTitle}
                      onSubmit={handleCreateBoard}
                      onCancel={cancelCreating}
                    />
                  </motion.div>
                ) : (
                  <motion.button
                    key='create-button'
                    onClick={startCreating}
                    className='flex flex-col items-center justify-center gap-3 rounded-xl h-36 w-full
                             bg-white/[0.02] border border-dashed border-white/10 
                             hover:border-violet-500/30 hover:bg-violet-500/5 transition-colors'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center'>
                      <svg className='w-6 h-6 text-text-muted' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                      </svg>
                    </div>
                    <span className='text-text-muted font-medium text-sm'>새 보드 만들기</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {!isLoading && boards.length === 0 && !isCreating && <EmptyState onCreateClick={startCreating} />}
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title='보드 삭제'
        message={`'${deleteTarget?.title}' 보드를 삭제하시겠습니까? 보드에 포함된 모든 리스트와 카드도 함께 삭제됩니다.`}
        confirmText='삭제'
        cancelText='취소'
        variant='danger'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  )
}
