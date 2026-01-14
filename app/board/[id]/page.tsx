'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Column } from '@/app/components/Column'
import { Card } from '@/app/components/Card'
import { CardModal } from '@/app/components/CardModal'
import type { Card as CardType } from '@/types'
import { calculateNewPosition } from '@/lib/utils'

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  )

  const loadData = async () => {
    setLoading(true)
    setError(null)

    const boardResult = await getBoard(boardId)
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
  }

  useEffect(() => {
    loadData()
  }, [boardId])

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current
    if (activeData?.type === 'card') {
      setActiveCard(activeData.card as CardType)
    }
  }

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

    if (overData?.type === 'list') {
      const targetListId = overId
      if (activeCardData.list_id !== targetListId) {
        const targetList = lists.find((l) => l.id === targetListId)
        if (targetList) {
          const newPosition = targetList.cards.length > 0
            ? targetList.cards[targetList.cards.length - 1].position + 1
            : 1
          moveCardInStore(activeId, activeCardData.list_id, targetListId, newPosition)
        }
      }
    }

    if (overData?.type === 'card') {
      const overCard = overData.card as CardType
      if (activeCardData.list_id !== overCard.list_id) {
        moveCardInStore(activeId, activeCardData.list_id, overCard.list_id, overCard.position)
      }
    }
  }

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

    saveState()

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

    if (overData?.type === 'list') {
      targetListId = overId
      const targetList = lists.find((l) => l.id === targetListId)
      if (targetList) {
        newPosition = targetList.cards.length > 0
          ? targetList.cards[targetList.cards.length - 1].position + 1
          : 1
      }
    }

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

    const result = await moveCard({ cardId: activeId, targetListId, newPosition })
    if (!result.success) {
      rollback()
      toast.error(result.error || '카드 이동에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 font-medium">보드를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4 text-center max-w-md glass-light rounded-3xl p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="ios-button text-gray-600"
            >
              보드 목록으로
            </button>
            <button
              onClick={loadData}
              className="ios-button-primary"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 glass-dark border-b border-white/10">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-9 h-9 rounded-full glass flex items-center justify-center
                       hover:bg-white/30 transition-all"
              title="보드 목록으로"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-white truncate">
              {board?.title || '보드'}
            </h1>
          </div>
        </div>
      </header>

      {/* 보드 영역 */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 sm:gap-5 p-4 sm:p-6 h-full overflow-x-auto">
            {lists.map((list) => (
              <Column key={list.id} list={list} />
            ))}

            {/* 리스트 추가 버튼 */}
            <div className="flex-shrink-0">
              <button
                className="w-64 sm:w-72 min-w-[256px] sm:min-w-[288px] p-4 glass
                           border border-dashed border-white/40 hover:border-white/60
                           rounded-3xl text-white/70 hover:text-white hover:bg-white/20
                           flex items-center justify-center gap-2 transition-all duration-300"
                onClick={() => toast.info('리스트 추가 기능은 준비 중입니다.')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                리스트 추가
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="drag-overlay">
                <Card card={activeCard} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {isCardModalOpen && <CardModal />}
    </div>
  )
}
