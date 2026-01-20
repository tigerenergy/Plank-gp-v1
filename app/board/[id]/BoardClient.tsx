'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import type { DropAnimation } from '@dnd-kit/core'
import type { User } from '@supabase/supabase-js'
import { useBoardStore } from '@/store/useBoardStore'
import { getBoardData, getBoard } from '@/app/actions/board'
import { getTeamMembers, checkBoardMembership, getBoardMembers } from '@/app/actions/member'
import { useBoardDragDrop } from '@/hooks/useBoardDragDrop'
import { Column } from '@/app/components/Column'
import { Card } from '@/app/components/Card'
import { BoardHeader } from '@/app/components/board/BoardHeader'
import { BoardLoading } from '@/app/components/board/BoardLoading'
import { BoardError } from '@/app/components/board/BoardError'
import { AddListButton } from '@/app/components/board/AddListButton'

// 🚀 Dynamic imports - 모달은 필요할 때만 로드 (코드 스플리팅)
const CardModal = dynamic(() => import('@/app/components/CardModal').then(mod => ({ default: mod.CardModal })), {
  ssr: false,
})
const BoardSettingsModal = dynamic(() => import('@/app/components/board/BoardSettingsModal').then(mod => ({ default: mod.BoardSettingsModal })), {
  ssr: false,
})

interface BoardClientProps {
  user: User | null
}

export default function BoardClient({ user }: BoardClientProps) {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string

  const {
    board,
    lists,
    members,
    isLoading,
    error,
    setBoard,
    setLists,
    setMembers,
    setLoading,
    setError,
    setCurrentUserId,
    isCardModalOpen,
    resetBoard,
  } = useBoardStore()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [boardMembers, setBoardMembers] = useState<typeof members>([])

  // 보드 소유자인지 확인 (삭제 권한)
  const isOwner = board?.created_by === user?.id

  const { sensors, activeCard, handleDragStart, handleDragOver, handleDragEnd } = useBoardDragDrop()

  // 드롭 애니메이션 설정
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
    duration: 200,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  }

  // 🚀 데이터 로드 (Parallel Data Fetching으로 최적화)
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Step 1: 보드 정보 먼저 로드 (필수)
    const boardResult = await getBoard(boardId)
    if (!boardResult.success || !boardResult.data) {
      setError(boardResult.error || '보드를 불러올 수 없습니다.')
      setLoading(false)
      return
    }

    setBoard(boardResult.data)

    // 소유자인 경우 즉시 편집 권한 부여
    const boardOwnerId = boardResult.data.created_by
    const isCurrentUserOwner = boardOwnerId === user?.id

    // Step 2: 나머지 데이터는 병렬로 로드 (성능 최적화)
    const [listsResult, boardMembersResult, allMembersResult, membershipResult] = await Promise.all([
      getBoardData(boardResult.data.id),
      getBoardMembers(boardId),
      getTeamMembers(),
      isCurrentUserOwner ? Promise.resolve(null) : checkBoardMembership(boardId),
    ])

    // 권한 설정
    if (isCurrentUserOwner) {
      setCanEdit(true)
    } else if (membershipResult?.success && membershipResult.data) {
      setCanEdit(membershipResult.data.isMember)
    }

    // 리스트 & 카드 설정
    if (listsResult.success && listsResult.data) {
      setLists(listsResult.data)
    } else {
      setError(listsResult.error || '데이터를 불러올 수 없습니다.')
    }

    // 보드 멤버 설정
    if (boardMembersResult.success && boardMembersResult.data) {
      setBoardMembers(boardMembersResult.data)
    }

    // 전체 팀원 설정
    if (allMembersResult.success && allMembersResult.data) {
      setMembers(allMembersResult.data)
    }

    setLoading(false)
  }, [boardId, user?.id, setBoard, setLists, setMembers, setLoading, setError])

  // 현재 사용자 ID 설정
  useEffect(() => {
    setCurrentUserId(user?.id || null)
  }, [user?.id, setCurrentUserId])

  // 보드 전환 시 초기화 후 데이터 로드
  useEffect(() => {
    // 이전 보드 데이터 초기화 (스켈레톤 표시)
    resetBoard()
    loadData()
  }, [boardId, resetBoard, loadData])

  if (isLoading) {
    return <BoardLoading />
  }

  if (error) {
    return <BoardError error={error} onRetry={loadData} onBack={() => router.push('/')} />
  }

  return (
    <div className='h-[100dvh] flex flex-col overflow-hidden'>
      <BoardHeader
        boardId={boardId}
        title={board?.title || '보드'}
        user={user}
        members={boardMembers}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <div className='flex-1 min-h-0 overflow-auto'>
        {/* 드래그앤드롭 컨텍스트 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={canEdit ? handleDragStart : undefined}
          onDragOver={canEdit ? handleDragOver : undefined}
          onDragEnd={canEdit ? handleDragEnd : undefined}
        >
          <div className='flex flex-col sm:flex-row gap-4 p-4 sm:p-6 sm:h-full sm:overflow-x-auto sm:items-start board-scroll'>
            {lists.map((list) => (
              <Column key={list.id} list={list} canEdit={canEdit} isOwner={isOwner} />
            ))}
            {/* 멤버도 리스트 추가 가능 */}
            {canEdit && <AddListButton />}
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeCard && (
              <div className='rotate-2 scale-105 opacity-95 shadow-2xl'>
                <Card card={activeCard} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {isCardModalOpen && <CardModal canEdit={canEdit} isOwner={isOwner} />}

      {/* 팀원 모달 (초대 기능 포함) */}
      <BoardSettingsModal
        isOpen={isSettingsOpen}
        currentUserId={user?.id || null}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
