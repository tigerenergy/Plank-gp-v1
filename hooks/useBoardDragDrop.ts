import { useState } from 'react'
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import { useBoardStore } from '@/store/useBoardStore'
import { moveCard } from '@/app/actions/card'
import { calculateNewPosition } from '@/lib/utils'
import type { Card as CardType, ListWithCards } from '@/types'

export function useBoardDragDrop() {
  const { lists, saveState, rollback, moveCard: moveCardInStore } = useBoardStore()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  // 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  )

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current
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

    // 리스트로 이동
    if (overData?.type === 'list') {
      const targetListId = overId
      if (activeCardData.list_id !== targetListId) {
        const targetList = lists.find((l) => l.id === targetListId)
        if (targetList) {
          const newPosition = getLastPosition(targetList)
          moveCardInStore(activeId, activeCardData.list_id, targetListId, newPosition)
        }
      }
    }

    // 카드 위로 이동
    if (overData?.type === 'card') {
      const overCard = overData.card as CardType
      if (activeCardData.list_id !== overCard.list_id) {
        moveCardInStore(activeId, activeCardData.list_id, overCard.list_id, overCard.position)
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

    saveState()

    // 현재 카드 위치 찾기
    const { card: currentCard, listId: sourceListId } = findCardInLists(lists, activeId)
    if (!currentCard || !sourceListId) return

    let targetListId = sourceListId
    let newPosition = currentCard.position

    // 리스트 위에 드롭
    if (overData?.type === 'list') {
      targetListId = overId
      const targetList = lists.find((l) => l.id === targetListId)
      if (targetList) {
        newPosition = getLastPosition(targetList)
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
        newPosition = calculateNewPosition(beforePosition, overCard.position)
      }
    }

    // 서버 동기화
    const result = await moveCard({ cardId: activeId, targetListId, newPosition })
    if (!result.success) {
      rollback()
      toast.error(result.error || '카드 이동에 실패했습니다.')
    }
  }

  return {
    sensors,
    activeCard,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}

// 헬퍼 함수들
function getLastPosition(list: ListWithCards): number {
  return list.cards.length > 0 ? list.cards[list.cards.length - 1].position + 1 : 1
}

function findCardInLists(
  lists: ListWithCards[],
  cardId: string
): { card: CardType | undefined; listId: string | undefined } {
  for (const list of lists) {
    const card = list.cards.find((c) => c.id === cardId)
    if (card) {
      return { card, listId: list.id }
    }
  }
  return { card: undefined, listId: undefined }
}
