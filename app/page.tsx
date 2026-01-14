'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getAllBoards, createBoard, deleteBoard, updateBoard } from './actions/board'
import type { Board } from '@/types'

export default function Home() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const loadBoards = async () => {
    setIsLoading(true)
    const result = await getAllBoards()
    if (result.success && result.data) {
      setBoards(result.data)
    } else {
      toast.error(result.error || '보드 목록을 불러오는데 실패했습니다.')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadBoards()
  }, [])

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardTitle.trim()) {
      toast.error('보드 제목을 입력해주세요.')
      return
    }

    const result = await createBoard(newBoardTitle.trim())
    if (result.success && result.data) {
      toast.success('보드가 생성되었습니다!')
      setNewBoardTitle('')
      setIsCreating(false)
      router.push(`/board/${result.data.id}`)
    } else {
      toast.error(result.error || '보드 생성에 실패했습니다.')
    }
  }

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation()
    if (!confirm('정말로 이 보드를 삭제하시겠습니까?')) return

    const result = await deleteBoard(boardId)
    if (result.success) {
      toast.success('보드가 삭제되었습니다.')
      setBoards(boards.filter(b => b.id !== boardId))
    } else {
      toast.error(result.error || '보드 삭제에 실패했습니다.')
    }
  }

  const handleStartEdit = (e: React.MouseEvent, board: Board) => {
    e.stopPropagation()
    setEditingBoardId(board.id)
    setEditingTitle(board.title)
  }

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
      setBoards(boards.map(b => b.id === boardId ? result.data! : b))
      setEditingBoardId(null)
      setEditingTitle('')
    } else {
      toast.error(result.error || '보드 수정에 실패했습니다.')
    }
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingBoardId(null)
    setEditingTitle('')
  }

  return (
    <main className="min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-[#f3f4f6]">
            짭렐로 <span className="text-[#c4b5fd]">✦</span>
          </h1>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#f3f4f6] mb-2">내 보드</h2>
          <p className="text-[#6b7280]">보드를 선택하거나 새로 만들어보세요</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-3 border-[#252542] border-t-[#c4b5fd] rounded-full animate-spin" />
              <p className="text-[#6b7280] font-medium">보드를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => editingBoardId !== board.id && router.push(`/board/${board.id}`)}
                className="relative group cursor-pointer rounded-xl p-5 h-36 
                           bg-[#1a1a2e] border border-white/5
                           hover:border-violet-500/30 hover:bg-[#1e1e38] 
                           transition-all duration-200 shadow-lg"
              >
                {editingBoardId === board.id ? (
                  <form 
                    onSubmit={(e) => handleUpdateBoard(e, board.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-full flex flex-col"
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#252542] border border-white/10
                                 text-[#f3f4f6] text-sm focus:outline-none focus:border-violet-500/50"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2 mt-auto">
                      <button type="submit" 
                              className="flex-1 py-2 rounded-lg text-sm font-medium
                                         bg-violet-600 hover:bg-violet-500 text-white transition-all">
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 rounded-lg text-sm
                                   bg-white/5 text-[#9ca3af] hover:bg-white/10 transition-all"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-[#f3f4f6] truncate group-hover:text-white transition-colors">
                      {board.title}
                    </h3>
                    <p className="text-[#6b7280] text-sm mt-1">
                      {new Date(board.created_at).toLocaleDateString('ko-KR')}
                    </p>

                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => handleStartEdit(e, board)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                                 bg-white/10 hover:bg-violet-500 text-[#9ca3af] hover:text-white transition-all"
                        title="보드 수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteBoard(e, board.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                                 bg-white/10 hover:bg-red-500 text-[#9ca3af] hover:text-white transition-all"
                        title="보드 삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {isCreating ? (
              <form
                onSubmit={handleCreateBoard}
                className="rounded-xl p-5 h-36 bg-[#1a1a2e] border border-violet-500/30
                           shadow-[0_0_20px_rgba(139,92,246,0.1)]"
              >
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="보드 제목 입력..."
                  className="w-full px-3 py-2 rounded-lg bg-[#252542] border border-white/10
                             text-[#f3f4f6] text-sm placeholder-[#6b7280]
                             focus:outline-none focus:border-violet-500/50 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="submit" 
                          className="flex-1 py-2 rounded-lg text-sm font-medium
                                     bg-violet-600 hover:bg-violet-500 text-white transition-all">
                    생성
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setNewBoardTitle('')
                    }}
                    className="px-4 py-2 rounded-lg text-sm
                               bg-white/5 text-[#9ca3af] hover:bg-white/10 transition-all"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="flex flex-col items-center justify-center gap-3 rounded-xl h-36
                         bg-white/[0.02] border border-dashed border-white/10 
                         hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-[#6b7280] font-medium text-sm">새 보드 만들기</span>
              </button>
            )}
          </div>
        )}

        {!isLoading && boards.length === 0 && !isCreating && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#1a1a2e] border border-white/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#f3f4f6] mb-2">아직 보드가 없어요</h3>
            <p className="text-[#6b7280] mb-6">첫 번째 보드를 만들어서 작업을 시작해보세요!</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2.5 rounded-lg font-medium
                         bg-violet-600 hover:bg-violet-500 text-white transition-all"
            >
              + 새 보드 만들기
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
