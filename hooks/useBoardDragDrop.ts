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
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { useBoardStore } from '@/store/useBoardStore'
import { moveCard } from '@/app/actions/card'
import type { Card as CardType, ListWithCards } from '@/types'

export function useBoardDragDrop() {
  const { lists, setLists, saveState, rollback, moveCard: moveCardInStore } = useBoardStore()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  // 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  )

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current
    if (activeData?.type === 'card') {
      setActiveCard(activeData.card as CardType)
      saveState() // 드래그 시작 시 상태 저장
    }
  }

  // 드래그 중 (실시간 순서 변경)
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
    const sourceListId = activeCardData.list_id

    // 리스트 위로 이동 (빈 리스트 또는 리스트 하단)
    if (overData?.type === 'list') {
      const targetListId = overId
      if (sourceListId !== targetListId) {
        const targetList = lists.find((l) => l.id === targetListId)
        if (targetList) {
          const newPosition = getMaxPosition(targetList) + 1
          moveCardInStore(activeId, sourceListId, targetListId, newPosition)
        }
      }
      return
    }

    // 카드 위로 이동
    if (overData?.type === 'card') {
      const overCard = overData.card as CardType
      const targetListId = overCard.list_id

      // 같은 리스트 내에서 순서 변경
      if (sourceListId === targetListId) {
        setLists(
          lists.map((list) => {
            if (list.id !== sourceListId) return list

            const oldIndex = list.cards.findIndex((c) => c.id === activeId)
            const newIndex = list.cards.findIndex((c) => c.id === overId)

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return list

            const newCards = arrayMove(list.cards, oldIndex, newIndex)
            // 포지션 재계산
            const updatedCards = newCards.map((card, idx) => ({
              ...card,
              position: idx + 1,
            }))

            return { ...list, cards: updatedCards }
          })
        )
      } else {
        // 다른 리스트로 이동
        moveCardInStore(activeId, sourceListId, targetListId, overCard.position)
      }
    }
  }

  // 드래그 종료 (서버 동기화)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) {
      rollback()
      return
    }

    const activeId = active.id as string
    const activeData = active.data.current
    if (!activeData || activeData.type !== 'card') return

    // 현재 카드 위치 찾기
    const { card: currentCard, listId: currentListId } = findCardInLists(lists, activeId)
    if (!currentCard || !currentListId) {
      rollback()
      return
    }

    // 서버에 새 위치 저장
    const result = await moveCard({
      cardId: activeId,
      targetListId: currentListId,
      newPosition: currentCard.position,
    })

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
function getMaxPosition(list: ListWithCards): number {
  if (list.cards.length === 0) return 0
  return Math.max(...list.cards.map((c) => c.position))
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
