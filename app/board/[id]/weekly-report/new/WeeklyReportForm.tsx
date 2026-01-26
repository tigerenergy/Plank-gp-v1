'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Send, Clock, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Select from 'react-select'
import type { StylesConfig, SingleValue } from 'react-select'
import type { Board } from '@/types'
import { updateWeeklyReport, submitWeeklyReport, refreshWeeklyReportData } from '@/app/actions/weekly-report'
import type { WeeklyReport } from '@/app/actions/weekly-report'
import { ConfirmModal } from '@/app/components/ConfirmModal'

// react-select 스타일
const selectStyles: StylesConfig<{ value: string; label: string }, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: 'rgb(var(--background))',
    borderColor: 'rgb(var(--border))',
    borderRadius: '0.75rem',
    padding: '0.125rem 0.25rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'rgb(var(--border))',
    },
    '&:focus-within': {
      borderColor: 'rgb(139 92 246)',
      boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'rgb(var(--card))',
    borderRadius: '0.75rem',
    border: '1px solid rgb(var(--border))',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'rgb(139 92 246)'
      : state.isFocused
      ? 'rgb(var(--secondary))'
      : 'transparent',
    color: state.isSelected ? 'white' : 'rgb(var(--foreground))',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'rgb(139 92 246 / 0.8)',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: 'rgb(var(--foreground))',
  }),
  input: (base) => ({
    ...base,
    color: 'rgb(var(--foreground))',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgb(var(--muted-foreground))',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'rgb(var(--muted-foreground))',
    '&:hover': {
      color: 'rgb(var(--foreground))',
    },
  }),
}

interface WeeklyReportFormProps {
  board: Board
  report: WeeklyReport
}

export function WeeklyReportForm({ board, report: initialReport }: WeeklyReportFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [report, setReport] = useState(initialReport)
  const [inProgressCards, setInProgressCards] = useState(initialReport.in_progress_cards || [])
  const [totalHours, setTotalHours] = useState(initialReport.total_hours || 0)
  const [notes, setNotes] = useState(initialReport.notes || '')
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'current' | 'next'>('current')

  // 진행 상태 옵션
  const statusOptions = [
    { value: '진행중', label: '진행중' },
    { value: '완료', label: '완료' },
    { value: '대기', label: '대기' },
    { value: '예정', label: '예정' },
  ]

  // 시간 자동 집계 (완료된 카드 + 진행 중인 카드)
  useEffect(() => {
    // 진행 중인 카드 시간
    const inProgressHours = inProgressCards.reduce((sum, card) => {
      const cardHours = card.user_input?.hours_spent ?? card.auto_collected?.weekly_hours ?? 0
      return sum + Number(cardHours || 0)
    }, 0)
    
    // 완료된 카드 시간
    const completedHours = (report.completed_cards || []).reduce((sum: number, card: any) => {
      const cardHours = card.weekly_hours || 0
      return sum + Number(cardHours || 0)
    }, 0)
    
    setTotalHours(inProgressHours + completedHours)
  }, [inProgressCards, report.completed_cards])

  // 주간보고 데이터 새로고침
  const handleRefresh = async () => {
    if (isRefreshing || report.status === 'submitted') return
    
    setIsRefreshing(true)
    try {
      const weekStartStr = report.week_start_date
      const refreshResult = await refreshWeeklyReportData(report.id, board.id, weekStartStr)
      
      if (refreshResult.success && refreshResult.data) {
        setReport(refreshResult.data)
        setInProgressCards(refreshResult.data.in_progress_cards || [])
        setTotalHours(refreshResult.data.total_hours || 0)
        // notes는 사용자가 입력한 값 유지
        toast.success('주간보고 데이터가 새로고침되었습니다.')
      } else {
        toast.error(refreshResult.error || '새로고침에 실패했습니다.')
      }
    } catch (error) {
      console.error('새로고침 에러:', error)
      toast.error('새로고침 중 오류가 발생했습니다.')
    } finally {
      setIsRefreshing(false)
    }
  }

  // 카드 업데이트
  const updateCard = (cardId: string, updates: any) => {
    setInProgressCards((cards) =>
      cards.map((card) =>
        card.card_id === cardId
          ? {
              ...card,
              user_input: {
                ...card.user_input,
                ...updates,
              },
            }
          : card
      )
    )
  }

  // 시간 입력 검증 (주간 최대 168시간, 현실적으로 80시간 제한)
  const validateHours = (hours: number): { valid: boolean; error?: string } => {
    if (hours < 0) {
      return { valid: false, error: '작업 시간은 0 이상이어야 합니다.' }
    }
    if (hours > 80) {
      return { valid: false, error: '작업 시간은 주간 최대 80시간까지 입력 가능합니다.' }
    }
    return { valid: true }
  }

  // 저장
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateWeeklyReport(report.id, {
        in_progress_cards: inProgressCards,
        total_hours: totalHours,
        notes: notes.trim() || undefined,
        status: 'draft',
      })

      if (result.success) {
        toast.success('임시 저장되었습니다.')
      } else {
        toast.error(result.error || '저장에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('저장 중 오류:', error)
      toast.error('저장 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  // 제출 확인 모달 열기
  const handleSubmitClick = () => {
    setShowSubmitConfirm(true)
  }

  // 제출 실행
  const handleSubmit = async () => {
    setShowSubmitConfirm(false)
    setIsSubmitting(true)
    try {
      // 먼저 저장
      await updateWeeklyReport(report.id, {
        in_progress_cards: inProgressCards,
        total_hours: totalHours,
        notes: notes.trim() || undefined,
      })

      // 제출
      const result = await submitWeeklyReport(report.id)

      if (result.success) {
        toast.success('주간보고가 제출되었습니다!')
        // 공유 페이지로 이동
        window.location.href = `/board/${board.id}/weekly-report/share?week=${report.week_start_date}`
      } else {
        toast.error(result.error || '제출에 실패했습니다.')
      }
    } catch {
      toast.error('제출 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const weekStart = new Date(report.week_start_date)
  const weekEnd = new Date(report.week_end_date)

  return (
    <div className='min-h-screen bg-[rgb(var(--background))]'>
      {/* 헤더 */}
      <header className='sticky top-0 z-40 bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-[rgb(var(--border))]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                href={`/board/${board.id}`}
                className='p-2 rounded-xl btn-ghost'
              >
                <ArrowLeft className='w-5 h-5' />
              </Link>
              <div>
                <h1 className='text-lg font-bold text-[rgb(var(--foreground))]'>
                  {board.emoji || '📋'} {board.title} - 주간보고 작성
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                  {weekStart.toLocaleDateString('ko-KR')} ~ {weekEnd.toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isSaving || isSubmitting || report.status === 'submitted'}
                className='flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))] disabled:opacity-50'
                title='최신 데이터로 새로고침'
              >
                {isRefreshing ? (
                  <>
                    <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                    새로고침 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className='w-4 h-4' />
                    새로고침
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isSubmitting}
                className='flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))] disabled:opacity-50'
              >
                {isSaving ? (
                  <>
                    <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    임시 저장
                  </>
                )}
              </button>
              <button
                onClick={handleSubmitClick}
                disabled={isSaving || isSubmitting}
                className='flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white transition-colors'
              >
                {isSubmitting ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4' />
                    제출
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-6'>
          {/* 탭 네비게이션 */}
          <div className='flex gap-2 border-b border-[rgb(var(--border))]'>
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === 'current'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
              }`}
            >
              현재 주간 보고서
              {activeTab === 'current' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400' />
              )}
            </button>
            <button
              onClick={() => setActiveTab('next')}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                activeTab === 'next'
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
              }`}
            >
              차주에 있을 일
              {activeTab === 'next' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400' />
              )}
            </button>
          </div>

          {/* 현재 주간 보고서 탭 */}
          {activeTab === 'current' && (
            <>
              {/* 총 작업 시간 - 맨 위로 이동 */}
              <div className='card p-6 bg-gradient-to-br from-violet-500/10 to-blue-500/10 border-violet-500/20'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-3 bg-violet-500/20 rounded-xl'>
                      <Clock className='w-6 h-6 text-violet-600' />
                    </div>
                    <div>
                      <div className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>주간 총 작업 시간</div>
                      <div className='text-3xl font-bold text-[rgb(var(--foreground))] mt-1'>{totalHours.toFixed(1)}시간</div>
                    </div>
                  </div>
                </div>
              </div>

          {/* 완료된 카드 */}
          {report.completed_cards && report.completed_cards.length > 0 ? (
            <div className='card p-6'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                <CheckCircle2 className='w-5 h-5 text-emerald-500' />
                완료된 작업 ({report.completed_cards.length}개)
              </h2>
              <div className='space-y-3'>
                {report.completed_cards.map((card: any) => (
                    <div
                      key={card.id || card.card_id}
                      className='p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div className='flex-1'>
                          <div className='font-medium text-[rgb(var(--foreground))]'>{card.title}</div>
                          {card.description && (
                            <div className='text-sm text-[rgb(var(--muted-foreground))] mt-1 line-clamp-2'>
                              {card.description}
                            </div>
                          )}
                        </div>
                        {card.weekly_hours && card.weekly_hours > 0 && (
                          <div className='flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 ml-2'>
                            <Clock className='w-3 h-3' />
                            {card.weekly_hours}시간
                          </div>
                        )}
                      </div>
                      <div className='flex items-center gap-3 mt-2 text-xs text-[rgb(var(--muted-foreground))]'>
                        <span className='px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded'>
                          {card.list_title}
                        </span>
                        {card.completed_at && (
                          <span>
                            완료: {new Date(card.completed_at).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className='card p-6'>
              <div className='text-center py-8'>
                <CheckCircle2 className='w-12 h-12 mx-auto mb-3 text-[rgb(var(--muted-foreground))] opacity-30' />
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                  이번 주에 완료된 작업이 없습니다.
                </p>
              </div>
            </div>
          )}

          {/* 진행 중인 카드 */}
          {inProgressCards.length > 0 ? (
            <div className='card p-6'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-6 flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-blue-500' />
                진행 중인 작업 ({inProgressCards.length}개)
              </h2>
              <div className='space-y-6'>
                {inProgressCards.map((card: any) => (
                <div
                  key={card.card_id}
                  className='p-6 bg-gradient-to-br from-[rgb(var(--card))] to-[rgb(var(--secondary))]/30 rounded-2xl border border-[rgb(var(--border))] shadow-sm hover:shadow-md transition-all'
                >
                  {/* 카드 헤더 */}
                  <div className='mb-6 pb-4 border-b border-[rgb(var(--border))]'>
                    <h3 className='text-base font-semibold text-[rgb(var(--foreground))] mb-1'>
                      {card.title}
                    </h3>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded-md font-medium'>
                        {card.list_title}
                      </span>
                    </div>
                  </div>

                  {/* 주요 정보 그리드 */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                    {/* 진행 상태 */}
                    <div>
                      <label className='text-xs font-semibold text-[rgb(var(--muted-foreground))] mb-2 block uppercase tracking-wide'>
                        진행 상태
                      </label>
                      <Select
                        value={statusOptions.find((opt) => opt.value === (card.user_input?.status || '진행중'))}
                        onChange={(option: SingleValue<{ value: string; label: string }>) => {
                          if (option) updateCard(card.card_id, { status: option.value })
                        }}
                        options={statusOptions}
                        styles={selectStyles}
                        isSearchable={false}
                        placeholder="상태 선택"
                      />
                    </div>

                    {/* 진척도 */}
                    <div>
                      <label className='text-xs font-semibold text-[rgb(var(--muted-foreground))] mb-2 block uppercase tracking-wide'>
                        진척도
                      </label>
                      <div className='relative'>
                        <input
                          type='number'
                          min='0'
                          max='100'
                          value={card.user_input?.progress || card.auto_collected?.checklist_progress || 0}
                          onChange={(e) =>
                            updateCard(card.card_id, { progress: parseInt(e.target.value) || 0 })
                          }
                          className='w-full px-4 py-2.5 rounded-xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all'
                        />
                        <span className='absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[rgb(var(--muted-foreground))]'>
                          %
                        </span>
                      </div>
                    </div>

                    {/* 작업 시간 */}
                    <div>
                      <label className='text-xs font-semibold text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-1.5 uppercase tracking-wide'>
                        <Clock className='w-3.5 h-3.5' />
                        작업 시간
                      </label>
                      <div className='relative'>
                        <input
                          type='number'
                          min='0'
                          max='80'
                          step='0.5'
                          value={card.user_input?.hours_spent ?? card.auto_collected?.weekly_hours ?? 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            const validation = validateHours(value)
                            if (validation.valid) {
                              updateCard(card.card_id, { hours_spent: value })
                            } else {
                              toast.error(validation.error || '잘못된 시간 값입니다.')
                              // 잘못된 값이면 이전 값으로 되돌림
                              e.target.value = String(card.user_input?.hours_spent ?? card.auto_collected?.weekly_hours ?? 0)
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            const validation = validateHours(value)
                            if (!validation.valid) {
                              toast.error(validation.error || '잘못된 시간 값입니다.')
                              // 최대값으로 제한
                              const maxValue = Math.min(value, 80)
                              updateCard(card.card_id, { hours_spent: maxValue })
                            }
                          }}
                          className='w-full px-4 py-2.5 rounded-xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all'
                          placeholder='0'
                        />
                        <span className='absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[rgb(var(--muted-foreground))]'>
                          시간
                        </span>
                      </div>
                      <p className='text-xs text-[rgb(var(--muted-foreground))] mt-1'>
                        최대 80시간까지 입력 가능 (자동 집계된 시간이 표시됩니다)
                      </p>
                    </div>
                  </div>

                  {/* 추가 설명 */}
                  <div className='mb-4'>
                    <label className='text-xs font-semibold text-[rgb(var(--muted-foreground))] mb-2 block uppercase tracking-wide'>
                      추가 설명
                    </label>
                    <textarea
                      value={card.user_input?.description || ''}
                      onChange={(e) => updateCard(card.card_id, { description: e.target.value })}
                      className='w-full px-4 py-3 rounded-xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-y placeholder:text-[rgb(var(--muted-foreground))]'
                      placeholder='작업 내용을 자세히 설명해주세요...'
                    />
                  </div>

                  {/* 이슈사항 */}
                  <div>
                    <label className='text-xs font-semibold text-[rgb(var(--muted-foreground))] mb-2 block uppercase tracking-wide'>
                      이슈사항 <span className='normal-case font-normal text-[rgb(var(--muted-foreground))]/60'>(선택사항)</span>
                    </label>
                    <textarea
                      value={card.user_input?.issues || ''}
                      onChange={(e) => updateCard(card.card_id, { issues: e.target.value })}
                      className='w-full px-4 py-3 rounded-xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-y placeholder:text-[rgb(var(--muted-foreground))]'
                      placeholder='이슈사항이 있다면 적어주세요...'
                    />
                  </div>
                </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='card p-6'>
              <div className='text-center py-8'>
                <TrendingUp className='w-12 h-12 mx-auto mb-3 text-[rgb(var(--muted-foreground))] opacity-30' />
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                  현재 진행 중인 작업이 없습니다.
                </p>
              </div>
            </div>
          )}

              {/* 체크리스트 완료 항목 */}
              {report.card_activities && report.card_activities.filter((a: any) => a.type === 'checklist_item_completed').length > 0 && (
                <div className='card p-6'>
                  <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                    <CheckCircle2 className='w-5 h-5 text-amber-500' />
                    체크리스트 완료 항목 ({report.card_activities.filter((a: any) => a.type === 'checklist_item_completed').length}개)
                  </h2>
                  <div className='space-y-2'>
                    {report.card_activities
                      .filter((a: any) => a.type === 'checklist_item_completed')
                      .map((activity: any, idx: number) => (
                        <div
                          key={idx}
                          className='p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-colors'
                        >
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <div className='text-sm font-medium text-[rgb(var(--foreground))] mb-1'>
                                {activity.item_content}
                              </div>
                              <div className='text-xs text-[rgb(var(--muted-foreground))]'>
                                {activity.card_title} • {activity.list_title}
                              </div>
                            </div>
                            {activity.hours && (
                              <div className='flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 ml-2'>
                                <Clock className='w-3 h-3' />
                                {activity.hours}시간
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 추가 메모 */}
              <div className='card p-6'>
                <label className='text-sm font-semibold text-[rgb(var(--foreground))] mb-3 block'>
                  추가 메모
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-y placeholder:text-[rgb(var(--muted-foreground))]'
                  placeholder='추가로 기록하고 싶은 내용이 있다면 적어주세요...'
                />
              </div>
            </>
          )}

          {/* 차주에 있을 일 탭 */}
          {activeTab === 'next' && (
            <div className='space-y-6'>
              <div className='card p-6'>
                <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                  <TrendingUp className='w-5 h-5 text-blue-500' />
                  차주에 있을 일 ({inProgressCards.filter((card: any) => (card.user_input?.status || '진행중') !== '완료').length}개)
                </h2>
                {inProgressCards.filter((card: any) => (card.user_input?.status || '진행중') !== '완료').length > 0 ? (
                  <div className='space-y-4'>
                    {inProgressCards
                      .filter((card: any) => (card.user_input?.status || '진행중') !== '완료')
                      .map((card: any) => {
                        const progress = card.user_input?.progress || card.auto_collected?.checklist_progress || 0
                        const hours = card.user_input?.hours_spent || card.auto_collected?.weekly_hours || 0
                        return (
                          <div
                            key={card.card_id}
                            className='p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-colors'
                          >
                            <div className='flex items-start justify-between mb-3'>
                              <div className='flex-1'>
                                <div className='text-sm font-medium text-[rgb(var(--foreground))] mb-1'>{card.title}</div>
                                <div className='flex items-center gap-2 mt-2'>
                                  <span className='px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded text-xs font-medium'>
                                    {card.user_input?.status || '진행중'}
                                  </span>
                                  <span className='px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-xs font-medium'>
                                    {card.list_title}
                                  </span>
                                  {hours > 0 && (
                                    <span className='flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))]'>
                                      <Clock className='w-3 h-3' />
                                      {hours}시간
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 진척도 */}
                            <div className='mb-3'>
                              <div className='flex items-center justify-between mb-1'>
                                <span className='text-xs text-[rgb(var(--muted-foreground))]'>진척도</span>
                                <span className='text-xs font-medium text-[rgb(var(--foreground))]'>{progress}%</span>
                              </div>
                              <div className='w-full h-2 bg-[rgb(var(--secondary))] rounded-full overflow-hidden'>
                                <div
                                  className='h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300'
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            {/* 설명 */}
                            {card.user_input?.description && (
                              <div className='text-xs text-[rgb(var(--foreground))] mb-2 whitespace-pre-wrap'>
                                {card.user_input.description}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <TrendingUp className='w-12 h-12 mx-auto mb-3 text-[rgb(var(--muted-foreground))] opacity-30' />
                    <p className='text-sm text-[rgb(var(--muted-foreground))]'>
                      차주에 예정된 작업이 없습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 제출 확인 모달 */}
      <ConfirmModal
        isOpen={showSubmitConfirm}
        title='주간보고 제출'
        message='주간보고를 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.'
        confirmText='제출하기'
        cancelText='취소'
        variant='default'
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
      />

    </div>
  )
}
