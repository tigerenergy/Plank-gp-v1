'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { useBoardStore } from '@/store/useBoardStore'
import { getBoardData, getBoard } from '@/app/actions/board'
import { useBoardDragDrop } from '@/hooks/useBoardDragDrop'
import { Column } from '@/app/components/Column'
import { Card } from '@/app/components/Card'
import { CardModal } from '@/app/components/CardModal'
import { BoardHeader } from '@/app/components/board/BoardHeader'
import { BoardLoading } from '@/app/components/board/BoardLoading'
import { BoardError } from '@/app/components/board/BoardError'
import { AddListButton } from '@/app/components/board/AddListButton'
import { enrichCardsWithMockData } from '@/lib/mockData'

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
    isCardModalOpen,
  } = useBoardStore()

  const { sensors, activeCard, handleDragStart, handleDragOver, handleDragEnd } = useBoardDragDrop()

  // 데이터 로드
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
      const enrichedLists = enrichCardsWithMockData(listsResult.data)
      setLists(enrichedLists)
    } else {
      setError(listsResult.error || '데이터를 불러올 수 없습니다.')
    }
  }

  useEffect(() => {
    loadData()
  }, [boardId])

  if (isLoading) {
    return <BoardLoading />
  }

  if (error) {
    return <BoardError error={error} onRetry={loadData} onBack={() => router.push('/')} />
  }

  return (
    <div className='h-[100dvh] flex flex-col overflow-hidden'>
      <BoardHeader title={board?.title || '보드'} />

      <div className='flex-1 min-h-0 overflow-auto'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className='flex flex-col sm:flex-row gap-4 p-4 sm:p-6 sm:h-full sm:overflow-x-auto sm:items-start board-scroll'>
            {lists.map((list) => (
              <Column key={list.id} list={list} />
            ))}
            <AddListButton />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeCard && (
              <div className='drag-overlay'>
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
