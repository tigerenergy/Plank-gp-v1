'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import type { DropAnimation } from '@dnd-kit/core'
import type { User } from '@supabase/supabase-js'
import { useBoardStore } from '@/store/useBoardStore'
import { useBoardDragDrop } from '@/hooks/useBoardDragDrop'
import { Column } from '@/app/components/Column'
import { Card } from '@/app/components/Card'
import { CardModal } from '@/app/components/CardModal'
import { BoardHeader } from '@/app/components/board/BoardHeader'
import { AddListButton } from '@/app/components/board/AddListButton'
import { BoardSettingsModal } from '@/app/components/board/BoardSettingsModal'
import type { Board, ListWithCards, TeamMember } from '@/types'

interface BoardClientProps {
  user: User | null
  initialBoard: Board
  initialLists: ListWithCards[]
  initialMembers: TeamMember[]
}

export default function BoardClient({
  user,
  initialBoard,
  initialLists,
  initialMembers,
}: BoardClientProps) {
  const router = useRouter()

  const {
    board,
    lists,
    members,
    setBoard,
    setLists,
    setMembers,
    setLoading,
    setCurrentUserId,
    isCardModalOpen,
  } = useBoardStore()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 초기 데이터 설정 (서버에서 받은 데이터)
  useEffect(() => {
    setBoard(initialBoard)
    setLists(initialLists)
    setMembers(initialMembers)
    setLoading(false)
  }, [initialBoard, initialLists, initialMembers, setBoard, setLists, setMembers, setLoading])

  // 현재 사용자 ID 설정
  useEffect(() => {
    setCurrentUserId(user?.id || null)
  }, [user?.id, setCurrentUserId])

  // 보드 소유자인지 확인
  const isOwner = (board?.created_by || initialBoard.created_by) === user?.id

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

  // 실제 렌더링할 데이터 (스토어 우선, 없으면 초기값)
  const displayLists = lists.length > 0 ? lists : initialLists
  const displayMembers = members.length > 0 ? members : initialMembers
  const displayBoard = board || initialBoard

  return (
    <div className='h-[100dvh] flex flex-col overflow-hidden'>
      <BoardHeader
        title={displayBoard.title}
        user={user}
        members={displayMembers}
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
            {displayLists.map((list) => (
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

      {/* 팀원 모달 */}
      <BoardSettingsModal
        isOpen={isSettingsOpen}
        currentUserId={user?.id || null}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
