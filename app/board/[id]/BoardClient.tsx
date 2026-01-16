'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { getTeamMembers } from '@/app/actions/member'
import { useBoardDragDrop } from '@/hooks/useBoardDragDrop'
import { Column } from '@/app/components/Column'
import { Card } from '@/app/components/Card'
import { CardModal } from '@/app/components/CardModal'
import { BoardHeader } from '@/app/components/board/BoardHeader'
import { BoardLoading } from '@/app/components/board/BoardLoading'
import { BoardError } from '@/app/components/board/BoardError'
import { AddListButton } from '@/app/components/board/AddListButton'
import { BoardSettingsModal } from '@/app/components/board/BoardSettingsModal'

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
  } = useBoardStore()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 보드 소유자인지 확인
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

  // 데이터 로드
  const loadData = async () => {
    setLoading(true)
    setError(null)

    const boardResult = await getBoard(boardId)
    if (!boardResult.success || !boardResult.data) {
      setError(boardResult.error || '보드를 불러올 수 없습니다.')
      setLoading(false)
      return
    }

    setBoard(boardResult.data)

    // 리스트 & 카드 로드
    const listsResult = await getBoardData(boardResult.data.id)
    if (listsResult.success && listsResult.data) {
      setLists(listsResult.data)
    } else {
      setError(listsResult.error || '데이터를 불러올 수 없습니다.')
    }

    // 팀원 로드
    const membersResult = await getTeamMembers()
    if (membersResult.success && membersResult.data) {
      setMembers(membersResult.data)
    }

    setLoading(false)
  }

  // 현재 사용자 ID 설정
  useEffect(() => {
    setCurrentUserId(user?.id || null)
  }, [user?.id, setCurrentUserId])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])

  if (isLoading) {
    return <BoardLoading />
  }

  if (error) {
    return <BoardError error={error} onRetry={loadData} onBack={() => router.push('/')} />
  }

  return (
    <div className='h-[100dvh] flex flex-col overflow-hidden'>
      <BoardHeader
        title={board?.title || '보드'}
        user={user}
        members={members}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <div className='flex-1 min-h-0 overflow-auto'>
        {/* 드래그앤드롭 컨텍스트 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={isOwner ? handleDragStart : undefined}
          onDragOver={isOwner ? handleDragOver : undefined}
          onDragEnd={isOwner ? handleDragEnd : undefined}
        >
          <div className='flex flex-col sm:flex-row gap-4 p-4 sm:p-6 sm:h-full sm:overflow-x-auto sm:items-start board-scroll'>
            {lists.map((list) => (
              <Column key={list.id} list={list} isOwner={isOwner} />
            ))}
            {/* 소유자만 리스트 추가 가능 */}
            {isOwner && <AddListButton />}
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

      {isCardModalOpen && <CardModal isOwner={isOwner} />}

      {/* 팀원 모달 (초대 기능 포함) */}
      <BoardSettingsModal
        isOpen={isSettingsOpen}
        currentUserId={user?.id || null}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
