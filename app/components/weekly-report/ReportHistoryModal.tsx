'use client'

import { useEffect, useState } from 'react'
import { X, Clock, User, FileEdit, CheckCircle2, Plus } from 'lucide-react'
import { getWeeklyReportHistory, type WeeklyReportHistory } from '@/app/actions/weekly-report-history'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface ReportHistoryModalProps {
  reportId: string
  isOpen: boolean
  onClose: () => void
}

export function ReportHistoryModal({ reportId, isOpen, onClose }: ReportHistoryModalProps) {
  const [history, setHistory] = useState<WeeklyReportHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && reportId) {
      loadHistory()
    }
  }, [isOpen, reportId])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const result = await getWeeklyReportHistory(reportId)
      if (result.success && result.data) {
        setHistory(result.data)
      }
    } catch (error) {
      console.error('이력 로드 에러:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className='w-4 h-4 text-blue-500' />
      case 'updated':
        return <FileEdit className='w-4 h-4 text-violet-500' />
      case 'submitted':
        return <CheckCircle2 className='w-4 h-4 text-emerald-500' />
      default:
        return <Clock className='w-4 h-4 text-gray-500' />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return '생성됨'
      case 'updated':
        return '수정됨'
      case 'submitted':
        return '제출됨'
      default:
        return action
    }
  }

  const formatChanges = (changes: any) => {
    if (!changes || Object.keys(changes).length === 0) return null

    const items: string[] = []
    if (changes.status) {
      items.push(`상태: ${changes.status.old} → ${changes.status.new}`)
    }
    if (changes.total_hours) {
      items.push(`작업 시간: ${changes.total_hours.old}시간 → ${changes.total_hours.new}시간`)
    }
    if (changes.notes_changed) {
      items.push('메모 수정됨')
    }
    if (changes.in_progress_cards_updated) {
      items.push('진행 중인 작업 업데이트됨')
    }
    if (changes.completed_cards_count !== undefined) {
      items.push(`완료된 작업: ${changes.completed_cards_count}개`)
    }
    if (changes.in_progress_cards_count !== undefined) {
      items.push(`진행 중인 작업: ${changes.in_progress_cards_count}개`)
    }

    return items.length > 0 ? items : null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm' onClick={onClose}>
      <div
        className='relative w-full max-w-2xl max-h-[80vh] bg-[rgb(var(--card))] rounded-2xl shadow-xl border border-[rgb(var(--border))] overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className='sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]'>
          <div>
            <h2 className='text-xl font-bold text-[rgb(var(--foreground))]'>수정 이력</h2>
            <p className='text-sm text-[rgb(var(--muted-foreground))] mt-1'>주간보고의 모든 변경 사항을 확인할 수 있습니다</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-xl hover:bg-[rgb(var(--secondary))] transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* 내용 */}
        <div className='overflow-y-auto max-h-[calc(80vh-80px)] p-6'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full' />
            </div>
          ) : history.length === 0 ? (
            <div className='text-center py-12'>
              <Clock className='w-12 h-12 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
              <p className='text-sm text-[rgb(var(--muted-foreground))]'>아직 수정 이력이 없습니다</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {history.map((item, idx) => {
                const user = item.user
                const userName = user?.username || user?.email?.split('@')[0] || '익명'
                const changes = formatChanges(item.changes)

                return (
                  <div
                    key={item.id}
                    className='relative pl-8 pb-4 border-l-2 border-[rgb(var(--border))] last:border-l-0'
                  >
                    {/* 타임라인 점 */}
                    <div className='absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[rgb(var(--card))] border-2 border-[rgb(var(--border))] flex items-center justify-center'>
                      {getActionIcon(item.action)}
                    </div>

                    {/* 내용 */}
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-[rgb(var(--foreground))]'>
                            {getActionLabel(item.action)}
                          </span>
                          {user && (
                            <div className='flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))]'>
                              <User className='w-3 h-3' />
                              <span>{userName}</span>
                            </div>
                          )}
                        </div>
                        <span className='text-xs text-[rgb(var(--muted-foreground))]'>
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </span>
                      </div>

                      {changes && changes.length > 0 && (
                        <div className='pl-4 space-y-1'>
                          {changes.map((change, i) => (
                            <div key={i} className='text-xs text-[rgb(var(--muted-foreground))]'>
                              • {change}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.previous_data && Object.keys(item.previous_data).length > 0 && (
                        <details className='pl-4 text-xs'>
                          <summary className='cursor-pointer text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'>
                            이전 데이터 보기
                          </summary>
                          <div className='mt-2 p-2 bg-[rgb(var(--secondary))] rounded-lg'>
                            <pre className='text-xs whitespace-pre-wrap'>
                              {JSON.stringify(item.previous_data, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
