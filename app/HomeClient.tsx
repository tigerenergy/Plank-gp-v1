'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, LayoutGrid, Crown, Users } from 'lucide-react'
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

type FilterType = 'all' | 'owned' | 'joined'

const FILTERS: { key: FilterType; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '전체', icon: <LayoutGrid className='w-4 h-4' /> },
  { key: 'owned', label: '내가 만든', icon: <Crown className='w-4 h-4' /> },
  { key: 'joined', label: '참여 중', icon: <Users className='w-4 h-4' /> },
]

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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedEmoji, setSelectedEmoji] = useState('📋')
  const [newBoardDueDate, setNewBoardDueDate] = useState('')
  const isSubmittingRef = useRef(false)

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

  // 필터링된 보드 목록
  const filteredBoards = useMemo(() => {
    if (!user) return boards

    switch (filter) {
      case 'owned':
        // 내가 만든 보드
        return boards.filter((board) => board.created_by === user.id)
      case 'joined':
        // 내가 멤버로 참여 중인 보드 (내가 만든 보드 제외)
        return boards.filter(
          (board) =>
            board.created_by !== user.id && (board as { isMember?: boolean }).isMember === true
        )
      default:
        return boards
    }
  }, [boards, filter, user])

  // 필터별 개수
  const filterCounts = useMemo(() => {
    if (!user) return { all: boards.length, owned: 0, joined: 0 }

    const owned = boards.filter((board) => board.created_by === user.id).length
    // 참여 중: 내가 만든 게 아니면서, isMember가 true인 보드
    const joined = boards.filter(
      (board) => board.created_by !== user.id && (board as { isMember?: boolean }).isMember === true
    ).length

    return { all: boards.length, owned, joined }
  }, [boards, user])

  const handleCreateBoard = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // 중복 제출 방지
      if (isSubmittingRef.current) return

      const title = newBoardTitle.trim()
      if (!title) {
        toast.error('보드 제목을 입력해주세요.')
        return
      }

      isSubmittingRef.current = true
      setIsSubmitting(true)

      // 입력값 즉시 초기화 (중복 제출 방지)
      clearNewBoardTitle()
      const emojiToSave = selectedEmoji
      const dueDateToSave = newBoardDueDate

      try {
        const result = await createBoard(title, emojiToSave, dueDateToSave || undefined)
        if (result.success && result.data) {
          toast.success('보드가 생성되었습니다!')
          cancelCreating()
          setSelectedEmoji('📋') // 이모지 초기화
          setNewBoardDueDate('') // 마감일 초기화
          setNavigating(true)
          router.push(`/board/${result.data.id}`)
        } else {
          // 실패 시 입력값 복원
          setNewBoardTitle(title)
          setSelectedEmoji(emojiToSave)
          setNewBoardDueDate(dueDateToSave)
          toast.error(result.error || '보드 생성에 실패했습니다.')
        }
      } finally {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [newBoardTitle, clearNewBoardTitle, setNewBoardTitle, cancelCreating, setNavigating, router, selectedEmoji, newBoardDueDate]
  )

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
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]'>
              워크스페이스
            </h2>
            <p className='text-sm text-[rgb(var(--muted-foreground))] mt-1'>
              총 {boards.length}개의 보드
            </p>
          </div>

          {!isCreating && boards.length > 0 && (
            <button onClick={startCreating} className='btn-primary inline-flex items-center gap-2'>
              <Plus className='w-4 h-4' />새 보드
            </button>
          )}
        </div>

        {/* 필터 탭 */}
        {boards.length > 0 && (
          <div className='flex items-center gap-2 mb-6 p-1 bg-[rgb(var(--secondary))] rounded-xl w-fit'>
            {FILTERS.map(({ key, label, icon }) => {
              const count = filterCounts[key]
              const isActive = filter === key

              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm'
                        : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                    }
                  `}
                >
                  {icon}
                  <span>{label}</span>
                  <span
                    className={`
                    px-1.5 py-0.5 text-xs rounded-md
                    ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        : 'bg-[rgb(var(--muted))]/50 text-[rgb(var(--muted-foreground))]'
                    }
                  `}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* 로딩 */}
        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {[...Array(6)].map((_, i) => (
              <BoardCardSkeleton key={i} />
            ))}
          </div>
        ) : boards.length === 0 && !isCreating ? (
          <EmptyState onCreateClick={startCreating} />
        ) : filteredBoards.length === 0 && !isCreating ? (
          // 필터 결과가 없을 때
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='w-16 h-16 rounded-2xl bg-[rgb(var(--secondary))] flex items-center justify-center mb-4'>
              {filter === 'owned' ? (
                <Crown className='w-8 h-8 text-[rgb(var(--muted-foreground))]' />
              ) : (
                <Users className='w-8 h-8 text-[rgb(var(--muted-foreground))]' />
              )}
            </div>
            <h3 className='text-lg font-semibold text-[rgb(var(--foreground))] mb-2'>
              {filter === 'owned' ? '직접 만든 보드가 없습니다' : '참여 중인 보드가 없습니다'}
            </h3>
            <p className='text-sm text-[rgb(var(--muted-foreground))] mb-6'>
              {filter === 'owned'
                ? '새 보드를 만들어 프로젝트를 시작해보세요'
                : '다른 팀원의 보드에 초대를 받으면 여기에 표시됩니다'}
            </p>
            {filter === 'owned' && (
              <button
                onClick={startCreating}
                className='btn-primary inline-flex items-center gap-2'
              >
                <Plus className='w-4 h-4' />새 보드 만들기
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {filteredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                isEditing={editingBoardId === board.id}
                editingTitle={editingTitle}
                onNavigate={() => {
                  setNavigating(true)
                  router.push(`/board/${board.id}`)
                }}
                onStartEdit={startEditing}
                onCancelEdit={cancelEditing}
                onEditingTitleChange={setEditingTitle}
                onUpdate={handleUpdateBoard}
                onDelete={setDeleteTarget}
                creatorAvatar={board.creator?.avatar_url}
                creatorName={board.creator?.username || board.creator?.email?.split('@')[0]}
                currentUserId={user?.id}
                members={board.members}
              />
            ))}

            {isCreating && (
              <CreateBoardForm
                title={newBoardTitle}
                emoji={selectedEmoji}
                dueDate={newBoardDueDate}
                isSubmitting={isSubmitting}
                onTitleChange={setNewBoardTitle}
                onEmojiChange={setSelectedEmoji}
                onDueDateChange={setNewBoardDueDate}
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
