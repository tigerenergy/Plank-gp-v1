'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Plus, Pencil, Trash2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { createTimeLog, updateTimeLog, deleteTimeLog, getTimeLogs, type TimeLog } from '@/app/actions/time-log'
import { DatePicker } from '../ui/DatePicker'

interface TimeLogSectionProps {
  cardId: string
  currentUserId: string | null
  canEdit?: boolean
}

export function TimeLogSection({ cardId, currentUserId, canEdit = false }: TimeLogSectionProps) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 입력 폼 상태
  const [hours, setHours] = useState('')
  const [description, setDescription] = useState('')
  const [loggedDate, setLoggedDate] = useState<string | null>(new Date().toISOString().split('T')[0])

  // 편집 상태
  const [editHours, setEditHours] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLoggedDate, setEditLoggedDate] = useState<string | null>(null)

  // 시간 로그 로드
  useEffect(() => {
    loadTimeLogs()
  }, [cardId])

  const loadTimeLogs = async () => {
    setIsLoading(true)
    const result = await getTimeLogs(cardId)
    if (result.success && result.data) {
      setTimeLogs(result.data)
    } else {
      toast.error(result.error || '시간 로그를 불러오는데 실패했습니다.')
    }
    setIsLoading(false)
  }

  // 시간 로그 생성
  const handleCreate = async () => {
    if (isSubmitting) return
    if (!hours || parseFloat(hours) <= 0) {
      toast.error('작업 시간을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createTimeLog({
        cardId,
        hours: parseFloat(hours),
        description: description.trim() || undefined,
        loggedDate: loggedDate || undefined,
      })

      if (result.success && result.data) {
        setTimeLogs((prev) => [result.data!, ...prev])
        setHours('')
        setDescription('')
        setLoggedDate(new Date().toISOString().split('T')[0])
        setIsCreating(false)
        toast.success('시간 로그가 추가되었습니다.')
      } else {
        toast.error(result.error || '시간 로그 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('시간 로그 생성 에러:', error)
      toast.error('시간 로그 추가 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 편집 시작
  const handleStartEdit = (log: TimeLog) => {
    setEditingId(log.id)
    setEditHours(log.hours.toString())
    setEditDescription(log.description || '')
    setEditLoggedDate(log.logged_date)
  }

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditHours('')
    setEditDescription('')
    setEditLoggedDate(null)
  }

  // 시간 로그 수정
  const handleUpdate = async (logId: string) => {
    if (isSubmitting || editingId !== logId) return
    if (!editHours || parseFloat(editHours) <= 0) {
      toast.error('작업 시간을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateTimeLog(logId, {
        hours: parseFloat(editHours),
        description: editDescription.trim() || null,
        loggedDate: editLoggedDate || undefined,
      })

      if (result.success && result.data) {
        setTimeLogs((prev) => prev.map((log) => (log.id === logId ? result.data! : log)))
        handleCancelEdit()
        toast.success('시간 로그가 수정되었습니다.')
      } else {
        toast.error(result.error || '시간 로그 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('시간 로그 수정 에러:', error)
      toast.error('시간 로그 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 시간 로그 삭제
  const handleDelete = async (logId: string) => {
    if (deletingId === logId) return
    if (!confirm('이 시간 로그를 삭제하시겠습니까?')) return

    setDeletingId(logId)
    try {
      const result = await deleteTimeLog(logId)

      if (result.success) {
        setTimeLogs((prev) => prev.filter((log) => log.id !== logId))
        toast.success('시간 로그가 삭제되었습니다.')
      } else {
        toast.error(result.error || '시간 로그 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('시간 로그 삭제 에러:', error)
      toast.error('시간 로그 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  // 총 시간 계산
  const totalHours = timeLogs.reduce((sum, log) => sum + Number(log.hours || 0), 0)

  // 주간 시간 계산 (이번 주)
  const getWeekStart = (date: Date = new Date()) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weeklyHours = timeLogs
    .filter((log) => {
      const logDate = new Date(log.logged_date)
      return logDate >= weekStart && logDate <= weekEnd
    })
    .reduce((sum, log) => sum + Number(log.hours || 0), 0)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* 통계 */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='p-4 bg-violet-500/10 rounded-lg border border-violet-500/20'>
          <div className='text-xs text-[rgb(var(--muted-foreground))] mb-1'>총 작업 시간</div>
          <div className='text-lg font-bold text-violet-600 dark:text-violet-400'>{totalHours.toFixed(2)}시간</div>
        </div>
        <div className='p-4 bg-blue-500/10 rounded-lg border border-blue-500/20'>
          <div className='text-xs text-[rgb(var(--muted-foreground))] mb-1'>이번 주 작업 시간</div>
          <div className='text-lg font-bold text-blue-600 dark:text-blue-400'>{weeklyHours.toFixed(2)}시간</div>
        </div>
      </div>

      {/* 시간 로그 목록 */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-medium text-[rgb(var(--foreground))]'>시간 로그</h4>
          {canEdit && (
            <button
              onClick={() => setIsCreating(!isCreating)}
              className='flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-violet-500 hover:bg-violet-600 text-white transition-colors'
            >
              <Plus className='w-3 h-3' />
              추가
            </button>
          )}
        </div>

        {/* 생성 폼 */}
        {isCreating && canEdit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='p-4 bg-violet-500/5 rounded-lg border border-violet-500/20 space-y-3'
          >
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                  작업 시간 (시간)
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.5'
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50'
                  placeholder='0'
                  autoFocus
                />
              </div>
              <div>
                <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                  작업 날짜
                </label>
                <DatePicker
                  value={loggedDate}
                  onChange={setLoggedDate}
                  placeholder='날짜 선택'
                  hasSuccess={!!loggedDate}
                />
              </div>
            </div>
            <div>
              <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                작업 내용 (선택사항)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y min-h-[60px]'
                placeholder='작업 내용을 입력하세요...'
              />
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !hours}
                className='flex-1 px-3 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm transition-colors'
              >
                {isSubmitting ? '추가 중...' : '추가'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setHours('')
                  setDescription('')
                  setLoggedDate(new Date().toISOString().split('T')[0])
                }}
                className='px-3 py-2 rounded-lg bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary))]/80 text-sm transition-colors'
              >
                취소
              </button>
            </div>
          </motion.div>
        )}

        {/* 시간 로그 목록 */}
        {timeLogs.length === 0 ? (
          <div className='text-center py-8 text-[rgb(var(--muted-foreground))]'>
            <Clock className='w-8 h-8 mx-auto mb-2 opacity-30' />
            <p className='text-sm'>등록된 시간 로그가 없습니다.</p>
          </div>
        ) : (
          <div className='space-y-2 max-h-96 overflow-y-auto'>
            <AnimatePresence>
              {timeLogs.map((log) => {
                const isOwn = log.user_id === currentUserId
                const isEditing = editingId === log.id

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className='p-3 bg-[rgb(var(--secondary))] rounded-lg border border-[rgb(var(--border))]'
                  >
                    {isEditing && canEdit && isOwn ? (
                      // 편집 모드
                      <div className='space-y-3'>
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                              작업 시간
                            </label>
                            <input
                              type='number'
                              min='0'
                              step='0.5'
                              value={editHours}
                              onChange={(e) => setEditHours(e.target.value)}
                              className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50'
                            />
                          </div>
                          <div>
                            <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                              작업 날짜
                            </label>
                            <DatePicker
                              value={editLoggedDate}
                              onChange={setEditLoggedDate}
                              placeholder='날짜 선택'
                              hasSuccess={!!editLoggedDate}
                            />
                          </div>
                        </div>
                        <div>
                          <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                            작업 내용
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y min-h-[60px]'
                          />
                        </div>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleUpdate(log.id)}
                            disabled={isSubmitting || !editHours}
                            className='flex-1 px-3 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm transition-colors'
                          >
                            {isSubmitting ? '저장 중...' : '저장'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className='px-3 py-2 rounded-lg bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--secondary))]/80 text-sm transition-colors'
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 읽기 모드
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <Clock className='w-4 h-4 text-violet-500' />
                            <span className='font-semibold text-[rgb(var(--foreground))]'>{log.hours}시간</span>
                            <span className='text-xs text-[rgb(var(--muted-foreground))]'>
                              {new Date(log.logged_date).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          {log.description && (
                            <p className='text-sm text-[rgb(var(--muted-foreground))] mt-1'>{log.description}</p>
                          )}
                          <div className='flex items-center gap-2 mt-2 text-xs text-[rgb(var(--muted-foreground))]'>
                            <span>
                              {log.user?.username || log.user?.email?.split('@')[0] || '익명'}
                            </span>
                            <span>•</span>
                            <span>{new Date(log.created_at).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                        {canEdit && isOwn && (
                          <div className='flex items-center gap-1 flex-shrink-0'>
                            <button
                              onClick={() => handleStartEdit(log)}
                              className='p-1.5 rounded hover:bg-[rgb(var(--secondary))] transition-colors'
                              title='수정'
                            >
                              <Pencil className='w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]' />
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              disabled={deletingId === log.id}
                              className='p-1.5 rounded hover:bg-red-500/10 transition-colors'
                              title='삭제'
                            >
                              {deletingId === log.id ? (
                                <div className='w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin' />
                              ) : (
                                <Trash2 className='w-3.5 h-3.5 text-red-500' />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
