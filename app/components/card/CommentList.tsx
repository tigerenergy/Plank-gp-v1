'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Pencil, Trash2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import type { Comment } from '@/types'
import { createComment, updateComment, deleteComment } from '@/app/actions/comment'
import { useDraftStore } from '@/store/useDraftStore'

interface CommentListProps {
  cardId: string
  comments: Comment[]
  currentUserId: string | null
  onCommentsChange: (comments: Comment[]) => void
}

export function CommentList({
  cardId,
  comments,
  currentUserId,
  onCommentsChange,
}: CommentListProps) {
  // 드래프트 스토어
  const { getCommentDraft, setCommentDraft, clearCommentDraft } = useDraftStore()
  const savedDraft = getCommentDraft(cardId)

  const [newComment, setNewComment] = useState(savedDraft)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 댓글 입력 내용 자동 저장
  useEffect(() => {
    setCommentDraft(cardId, newComment)
  }, [newComment, cardId, setCommentDraft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    const commentContent = newComment.trim()
    setIsSubmitting(true)

    // 낙관적 업데이트 - 임시 댓글 추가
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      card_id: cardId,
      user_id: currentUserId,
      content: commentContent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: null,
    }

    const updatedComments = [...comments, tempComment]
    onCommentsChange(updatedComments)
    setNewComment('')

    const result = await createComment({ cardId, content: commentContent })
    setIsSubmitting(false)

    if (result.success && result.data) {
      // 임시 댓글을 실제 데이터로 교체
      onCommentsChange(updatedComments.map((c) => (c.id === tempComment.id ? result.data! : c)))
      clearCommentDraft(cardId) // 성공 시에만 드래프트 삭제
      toast.success('댓글이 작성되었습니다.')
    } else {
      // 실패 시 롤백
      onCommentsChange(comments)
      toast.error(result.error || '댓글 작성에 실패했습니다.')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editContent.trim() || isUpdating === id) return

    setIsUpdating(id)
    const trimmedContent = editContent.trim()
    const originalComments = [...comments]

    try {
      // 낙관적 업데이트
      onCommentsChange(
        comments.map((c) =>
          c.id === id ? { ...c, content: trimmedContent, updated_at: new Date().toISOString() } : c
        )
      )
      setEditingId(null)

      const result = await updateComment({ id, content: trimmedContent })
      if (result.success && result.data) {
        // 서버 데이터로 교체
        onCommentsChange(comments.map((c) => (c.id === id ? result.data! : c)))
        toast.success('댓글이 수정되었습니다.')
      } else {
        // 실패 시 롤백
        onCommentsChange(originalComments)
        toast.error(result.error || '댓글 수정에 실패했습니다.')
      }
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (isDeleting === id) return
    
    setIsDeleting(id)
    try {
      const result = await deleteComment(id)
      if (result.success) {
        onCommentsChange(comments.filter((c) => c.id !== id))
        toast.success('댓글이 삭제되었습니다.')
      } else {
        toast.error(result.error || '댓글 삭제에 실패했습니다.')
      }
    } finally {
      setIsDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className='space-y-4'>
      {/* 댓글 입력 */}
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          ref={inputRef}
          type='text'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder='댓글을 입력하세요...'
          className='flex-1 px-3 py-2 bg-gray-100 dark:bg-[#252542] border border-gray-300 dark:border-white/10 rounded-lg
                   text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50'
        />
        <button
          type='submit'
          disabled={!newComment.trim() || isSubmitting}
          className='px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center'
        >
          {isSubmitting ? (
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
          ) : (
            <Send className='w-4 h-4' />
          )}
        </button>
      </form>

      {/* 댓글 목록 */}
      <div className='space-y-3 max-h-60 overflow-y-auto'>
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='flex gap-3 group'
            >
              {/* 아바타 */}
              {comment.user?.avatar_url ? (
                <img
                  src={comment.user.avatar_url}
                  alt=''
                  referrerPolicy='no-referrer'
                  className='w-8 h-8 rounded-full flex-shrink-0'
                />
              ) : (
                <div className='w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0'>
                  <span className='text-xs font-medium text-violet-600 dark:text-violet-400'>
                    {(comment.user?.username || comment.user?.email || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}

              {/* 내용 */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {comment.user?.username || '익명'}
                  </span>
                  <span className='text-xs text-gray-500 dark:text-gray-500'>
                    {formatDate(comment.created_at)}
                  </span>
                </div>

                {editingId === comment.id ? (
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(comment.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className='flex-1 px-2 py-1 bg-white dark:bg-[#252542] border border-gray-300 dark:border-white/10 rounded
                               text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50'
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(comment.id)}
                      disabled={isUpdating === comment.id}
                      className='text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 disabled:opacity-50 flex items-center gap-1'
                    >
                      {isUpdating === comment.id && (
                        <div className='w-3 h-3 border-2 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin' />
                      )}
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className='text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <p className='text-sm text-gray-700 dark:text-gray-300 break-words'>
                    {comment.content}
                  </p>
                )}
              </div>

              {/* 액션 버튼 (본인 댓글만) - 더 나은 UX */}
              {currentUserId === comment.user_id && editingId !== comment.id && (
                <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  {/* 수정 버튼 */}
                  <button
                    onClick={() => {
                      setEditingId(comment.id)
                      setEditContent(comment.content)
                    }}
                    className='p-2 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all'
                    title='댓글 수정'
                  >
                    <Pencil className='w-4 h-4' />
                  </button>
                  {/* 삭제 버튼 - 더 잘 보이고 클릭하기 쉽게 */}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isDeleting === comment.id}
                    className='p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50'
                    title='댓글 삭제'
                  >
                    {isDeleting === comment.id ? (
                      <div className='w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin' />
                    ) : (
                      <Trash2 className='w-4 h-4' />
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3'>
              <MessageSquare className='w-6 h-6 text-gray-400 dark:text-gray-500' />
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400'>아직 댓글이 없습니다</p>
            <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
              첫 번째 댓글을 남겨보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
