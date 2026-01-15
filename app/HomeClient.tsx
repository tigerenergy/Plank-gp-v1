'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useHomeStore } from '@/store/useHomeStore'
import { useDraftStore } from '@/store/useDraftStore'
import { useNavigationStore } from '@/store/useNavigationStore'
import { getAllBoards, createBoard, deleteBoard, updateBoard } from './actions/board'
import { ConfirmModal } from './components/ConfirmModal'
import { BoardCard } from './components/home/BoardCard'
import { CreateBoardForm } from './components/home/CreateBoardForm'
import { EmptyState } from './components/home/EmptyState'
import { Header } from './components/layout/Header'
import { BoardCardSkeleton } from './components/ui/Skeleton'

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

  const { newBoardTitle, setNewBoardTitle, clearNewBoardTitle } = useDraftStore()
  const setNavigating = useNavigationStore((s) => s.setNavigating)

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

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardTitle.trim()) {
      toast.error('보드 제목을 입력해주세요.')
      return
    }

    const result = await createBoard(newBoardTitle.trim())
    if (result.success && result.data) {
      toast.success('보드가 생성되었습니다!')
      clearNewBoardTitle()
      cancelCreating()
      router.push(`/board/${result.data.id}`)
    } else {
      toast.error(result.error || '보드 생성에 실패했습니다.')
    }
  }

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

      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-10'>
        {/* 헤더 */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h2 className='text-2xl font-bold text-[rgb(var(--foreground))]'>내 보드</h2>
            <p className='text-sm text-[rgb(var(--muted-foreground))] mt-1'>
              {boards.length}개의 보드
            </p>
          </div>

          {!isCreating && boards.length > 0 && (
            <button onClick={startCreating} className='btn-primary inline-flex items-center gap-2'>
              <Plus className='w-4 h-4' />새 보드
            </button>
          )}
        </div>

        {/* 로딩 */}
        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {[...Array(6)].map((_, i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : boards.length === 0 && !isCreating ? (
          <EmptyState onCreateClick={startCreating} />
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                isEditing={editingBoardId === board.id}
                editingTitle={editingTitle}
                onNavigate={() => router.push(`/board/${board.id}`)}
                onStartEdit={startEditing}
                onCancelEdit={cancelEditing}
                onEditingTitleChange={setEditingTitle}
                onUpdate={handleUpdateBoard}
                onDelete={setDeleteTarget}
                creatorAvatar={board.creator?.avatar_url}
                creatorName={board.creator?.username || board.creator?.email?.split('@')[0]}
                currentUserId={user?.id}
              />
            ))}

            {isCreating && (
              <CreateBoardForm
                title={newBoardTitle}
                onTitleChange={setNewBoardTitle}
                onSubmit={handleCreateBoard}
                onCancel={cancelCreating}
              />
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title='보드 삭제'
        message={`'${deleteTarget?.title}' 보드를 삭제하시겠습니까? 모든 리스트와 카드도 함께 삭제됩니다.`}
        confirmText='삭제'
        cancelText='취소'
        variant='danger'
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  )
}
