'use client'

// 🚀 React Compiler 활성화: useMemo, useCallback 불필요 (자동 메모이제이션)
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, LayoutGrid, Crown, Users } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useHomeStore } from '@/store/useHomeStore'
import { useNavigationStore } from '@/store/useNavigationStore'
import { getAllBoards, createBoard, deleteBoard, updateBoard } from './actions/board'
import { createBoardSchema } from '@/schema/validation'
import { ConfirmModal } from './components/ConfirmModal'
import { BoardCard } from './components/home/BoardCard'
import { CreateBoardModal } from './components/home/CreateBoardModal'
import { EmptyState } from './components/home/EmptyState'
import { Header } from './components/layout/Header'
import { BoardCardSkeleton } from './components/ui/Skeleton'
import type { WeeklyReport } from './actions/weekly-report'
import type { Profile } from '@/types'
import { FileText, Clock, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type FilterType = 'all' | 'owned' | 'joined'

const FILTERS: { key: FilterType; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '전체', icon: <LayoutGrid className='w-4 h-4' /> },
  { key: 'owned', label: '내가 만든', icon: <Crown className='w-4 h-4' /> },
  { key: 'joined', label: '참여 중', icon: <Users className='w-4 h-4' /> },
]

interface HomeClientProps {
  user: User | null
  weeklyReports?: WeeklyReport[]
  teamMembers?: Profile[]
  currentWeek?: string
}

export default function HomeClient({ user, weeklyReports = [], teamMembers = [], currentWeek }: HomeClientProps) {
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

  const setNavigating = useNavigationStore((s) => s.setNavigating)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingBoard, setIsDeletingBoard] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
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

  // 🚀 React Compiler가 자동으로 메모이제이션 (useMemo 불필요)
  // 필터링된 보드 목록
  const filteredBoards = (() => {
    if (!user) return boards

    switch (filter) {
      case 'owned':
        return boards.filter((board) => board.created_by === user.id)
      case 'joined':
        return boards.filter(
          (board) =>
            board.created_by !== user.id && (board as { isMember?: boolean }).isMember === true
        )
      default:
        return boards
    }
  })()

  // 필터별 개수
  const filterCounts = (() => {
    if (!user) return { all: boards.length, owned: 0, joined: 0 }

    const owned = boards.filter((board) => board.created_by === user.id).length
    const joined = boards.filter(
      (board) => board.created_by !== user.id && (board as { isMember?: boolean }).isMember === true
    ).length

    return { all: boards.length, owned, joined }
  })()

  // 🚀 React Compiler가 자동으로 메모이제이션 (useCallback 불필요)
  const handleCreateBoard = async (data: { title: string; emoji: string; startDate: string; dueDate: string }) => {
    // 중복 제출 방지
    if (isSubmittingRef.current) return

    // zod 스키마로 검증
    const validation = createBoardSchema.safeParse({
      title: data.title,
      emoji: data.emoji,
      start_date: data.startDate,
      due_date: data.dueDate,
    })

    if (!validation.success) {
      const firstError = validation.error.errors[0]
      toast.error(firstError.message)
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      const result = await createBoard(data.title, data.emoji, data.startDate, data.dueDate)
      if (result.success && result.data) {
        toast.success('보드가 생성되었습니다!')
        cancelCreating()
        setNavigating(true)
        router.push(`/board/${result.data.id}`)
      } else {
        toast.error(result.error || '보드 생성에 실패했습니다.')
      }
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const [isUpdatingBoard, setIsUpdatingBoard] = useState(false)
  
  const handleUpdateBoard = async (e: React.FormEvent, boardId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (isUpdatingBoard) return

    if (!editingTitle.trim()) {
      toast.error('보드 제목을 입력해주세요.')
      return
    }

    setIsUpdatingBoard(true)
    try {
      const result = await updateBoard(boardId, { title: editingTitle.trim() })
      if (result.success && result.data) {
        toast.success('보드가 수정되었습니다.')
        updateBoardInStore(boardId, result.data)
        cancelEditing()
      } else {
        toast.error(result.error || '보드 수정에 실패했습니다.')
      }
    } finally {
      setIsUpdatingBoard(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeletingBoard) return

    const boardId = deleteTarget.id
    setDeleteTarget(null)
    setIsDeletingBoard(true)

    try {
      const result = await deleteBoard(boardId)
      if (result.success) {
        toast.success('보드가 삭제되었습니다.')
        removeBoard(boardId)
      } else {
        toast.error(result.error || '보드 삭제에 실패했습니다.')
      }
    } finally {
      setIsDeletingBoard(false)
    }
  }

  // 주간보고 데이터 처리 (모든 팀원 표시, 작성하지 않은 사람도 포함)
  const reportsByUser = new Map<string, WeeklyReport>()
  weeklyReports.forEach((report) => {
    reportsByUser.set(report.user_id, report)
  })

  // 모든 팀원에 대해 보고서가 있는지 확인
  const weeklyReportCards = teamMembers.map((member) => {
    const report = reportsByUser.get(member.id)
    return {
      member,
      report: report || null,
    }
  })

  return (
    <main className='min-h-screen'>
      <Header user={user} />

      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-10'>
        {/* 주간보고 공유 섹션 */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]'>
                주간보고 공유
              </h2>
              <p className='text-sm text-[rgb(var(--muted-foreground))] mt-1'>
                팀원들의 주간보고를 한눈에 확인하세요
                {currentWeek && (
                  <span className='ml-2'>
                    ({new Date(currentWeek).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~{' '}
                    {new Date(new Date(currentWeek).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })})
                  </span>
                )}
              </p>
            </div>
            <Link
              href='/weekly-report/share'
              className='text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium flex items-center gap-1'
            >
              전체 보기
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>

          {weeklyReportCards.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {weeklyReportCards.map(({ member, report }) => {
                if (report) {
                  // 보고서가 있는 경우
                  const completedCount = report.completed_cards?.length || 0
                  const inProgressCount = report.in_progress_cards?.length || 0
                  return (
                    <Link
                      key={member.id}
                      href='/weekly-report/share'
                      className='card p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-violet-500/30 hover:scale-[1.02]'
                    >
                      <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-2.5'>
                          <div className='w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm'>
                            {member.username?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || '익'}
                          </div>
                          <div>
                            <div className='text-sm font-semibold text-[rgb(var(--foreground))]'>
                              {member.username || member.email?.split('@')[0] || '익명'}
                            </div>
                            <div className='text-xs text-[rgb(var(--muted-foreground))] flex items-center gap-1 mt-0.5'>
                              {report.status === 'submitted' ? (
                                <>
                                  <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full' />
                                  <span>제출 완료</span>
                                </>
                              ) : (
                                <>
                                  <span className='w-1.5 h-1.5 bg-yellow-500 rounded-full' />
                                  <span>작성 중</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 mb-3'>
                        <div className='flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 rounded-lg'>
                          <Clock className='w-3.5 h-3.5 text-violet-600 dark:text-violet-400' />
                          <span className='text-xs font-semibold text-violet-600 dark:text-violet-400'>{report.total_hours || 0}시간</span>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]'>
                          <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500' />
                          <span>{completedCount}</span>
                          <TrendingUp className='w-3.5 h-3.5 text-blue-500 ml-1' />
                          <span>{inProgressCount}</span>
                        </div>
                      </div>
                    </Link>
                  )
                } else {
                  // 보고서가 없는 경우
                  return (
                    <div
                      key={member.id}
                      className='card p-4 border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30'
                    >
                      <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-2.5'>
                          <div className='w-9 h-9 rounded-full bg-[rgb(var(--muted))] flex items-center justify-center text-[rgb(var(--muted-foreground))] font-bold text-sm'>
                            {member.username?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || '익'}
                          </div>
                          <div>
                            <div className='text-sm font-semibold text-[rgb(var(--foreground))]'>
                              {member.username || member.email?.split('@')[0] || '익명'}
                            </div>
                            <div className='text-xs text-[rgb(var(--muted-foreground))] flex items-center gap-1 mt-0.5'>
                              <span className='w-1.5 h-1.5 bg-gray-400 rounded-full' />
                              <span>아직 작성하지 않음</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='text-xs text-[rgb(var(--muted-foreground))] text-center py-2'>
                        주간보고를 작성하지 않았습니다
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          ) : (
            <div className='card p-12 text-center'>
              <FileText className='w-16 h-16 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
              <h3 className='text-lg font-medium text-[rgb(var(--foreground))] mb-2'>
                아직 제출된 주간보고가 없습니다
              </h3>
              <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                해당 주간에 제출된 주간보고가 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* 프로젝트 섹션 */}
        <div>
          {/* 헤더 */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight text-[rgb(var(--foreground))]'>
                프로젝트
              </h2>
              <p className='text-sm text-[rgb(var(--muted-foreground))] mt-1'>
                총 {boards.length}개의 프로젝트
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

      <CreateBoardModal
        isOpen={isCreating}
        onClose={cancelCreating}
        onSubmit={handleCreateBoard}
        isSubmitting={isSubmitting}
      />
    </main>
  )
}
