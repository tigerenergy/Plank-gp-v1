'use client'

import { useEffect, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { useState } from 'react'
import { toast } from 'sonner'
import { useBoardStore } from '@/store/useBoardStore'
import { getBoardData, getBoard } from '@/app/actions/board'
import { moveCard } from '@/app/actions/card'
import { Column } from './Column'
import { Card } from './Card'
import { CardModal } from './CardModal'
import type { Card as CardType } from '@/types'
import { calculateNewPosition } from '@/lib/utils'

export function Board() {
  const {
    board,
    lists,
    isLoading,
    error,
    setBoard,
    setLists,
    setLoading,
    setError,
    saveState,
    rollback,
    moveCard: moveCardInStore,
    isCardModalOpen,
  } = useBoardStore()

  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  // 센서 설정 (포인터 + 터치)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  // 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true)

    const boardResult = await getBoard()

    if (!boardResult.success || !boardResult.data) {
      setError(boardResult.error || '보드를 불러올 수 없습니다.')
      return
    }

    setBoard(boardResult.data)

    const listsResult = await getBoardData(boardResult.data.id)

    if (listsResult.success && listsResult.data) {
      setLists(listsResult.data)
    } else {
      setError(listsResult.error || '데이터를 불러올 수 없습니다.')
    }
  }, [setBoard, setLists, setLoading, setError])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current

    if (activeData?.type === 'card') {
      setActiveCard(activeData.card as CardType)
    }
  }

  // 드래그 중 (다른 리스트 위로 이동)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || activeData.type !== 'card') return

    const activeCardData = activeData.card as CardType

    // 다른 리스트로 이동
    if (overData?.type === 'list') {
      const targetListId = overId
      if (activeCardData.list_id !== targetListId) {
        const targetList = lists.find((l) => l.id === targetListId)
        if (targetList) {
          const newPosition =
            targetList.cards.length > 0
              ? targetList.cards[targetList.cards.length - 1].position + 1
              : 1

          moveCardInStore(
            activeId,
            activeCardData.list_id,
            targetListId,
            newPosition
          )
        }
      }
    }

    // 카드 위로 이동
    if (overData?.type === 'card') {
      const overCard = overData.card as CardType
      if (activeCardData.list_id !== overCard.list_id) {
        moveCardInStore(
          activeId,
          activeCardData.list_id,
          overCard.list_id,
          overCard.position
        )
      }
    }
  }

  // 드래그 종료
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || activeData.type !== 'card') return

    // 상태 저장 (롤백용)
    saveState()

    // 현재 카드 찾기
    let currentCard: CardType | undefined
    let sourceListId: string | undefined

    for (const list of lists) {
      const found = list.cards.find((c) => c.id === activeId)
      if (found) {
        currentCard = found
        sourceListId = list.id
        break
      }
    }

    if (!currentCard || !sourceListId) return

    let targetListId = sourceListId
    let newPosition = currentCard.position

    // 리스트 위에 드롭
    if (overData?.type === 'list') {
      targetListId = overId
      const targetList = lists.find((l) => l.id === targetListId)
      if (targetList) {
        newPosition =
          targetList.cards.length > 0
            ? targetList.cards[targetList.cards.length - 1].position + 1
            : 1
      }
    }

    // 카드 위에 드롭
    if (overData?.type === 'card') {
      const overCard = overData.card as CardType
      targetListId = overCard.list_id

      const targetList = lists.find((l) => l.id === targetListId)
      if (targetList) {
        const overIndex = targetList.cards.findIndex((c) => c.id === overId)
        const beforePosition = overIndex > 0 ? targetList.cards[overIndex - 1].position : null
        const afterPosition = overCard.position
        newPosition = calculateNewPosition(beforePosition, afterPosition)
      }
    }

    // 서버에 저장
    const result = await moveCard({
      cardId: activeId,
      targetListId,
      newPosition,
    })

    if (!result.success) {
      rollback()
      toast.error(result.error || '카드 이동에 실패했습니다.')
    } else {
      toast.success('카드가 이동되었습니다.')
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full board-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/70 font-medium">보드를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center h-full board-bg">
        <div className="flex flex-col items-center gap-4 text-center max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">오류가 발생했습니다</h2>
            <p className="text-white/60">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-xl transition-all font-medium shadow-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 sm:gap-5 p-4 sm:p-6 h-full overflow-x-auto board-bg">
          {lists.map((list) => (
            <Column key={list.id} list={list} />
          ))}

          {/* 리스트 추가 버튼 */}
          <div className="flex-shrink-0">
            <button
              className="w-64 sm:w-72 min-w-[256px] sm:min-w-[288px] p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 
                         border-2 border-dashed border-white/30 hover:border-white/50
                         rounded-2xl text-white/70 hover:text-white
                         flex items-center justify-center gap-2 transition-all"
              onClick={() => toast.info('리스트 추가 기능은 준비 중입니다.')}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              리스트 추가
            </button>
          </div>
        </div>

        {/* 드래그 오버레이 */}
        <DragOverlay>
          {activeCard && (
            <div className="drag-overlay">
              <Card card={activeCard} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* 카드 모달 */}
      {isCardModalOpen && <CardModal />}
    </>
  )
}
