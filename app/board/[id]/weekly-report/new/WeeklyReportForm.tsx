'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Send, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import type { Board } from '@/types'
import { updateWeeklyReport, submitWeeklyReport } from '@/app/actions/weekly-report'
import type { WeeklyReport } from '@/app/actions/weekly-report'

interface WeeklyReportFormProps {
  board: Board
  report: WeeklyReport
}

export function WeeklyReportForm({ board, report }: WeeklyReportFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inProgressCards, setInProgressCards] = useState(report.in_progress_cards || [])
  const [totalHours, setTotalHours] = useState(report.total_hours || 0)
  const [notes, setNotes] = useState(report.notes || '')

  // 시간 자동 집계 (프런트엔드에서도 계산)
  useEffect(() => {
    const hours = inProgressCards.reduce((sum, card) => {
      const cardHours = card.user_input?.hours_spent ?? card.auto_collected?.weekly_hours ?? 0
      return sum + Number(cardHours || 0)
    }, 0)
    setTotalHours(hours)
  }, [inProgressCards])

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

  // 제출
  const handleSubmit = async () => {
    if (!confirm('주간보고를 제출하시겠습니까?')) return

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
                onClick={handleSubmit}
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
                    <div className='font-medium text-[rgb(var(--foreground))]'>{card.title}</div>
                    {card.description && (
                      <div className='text-sm text-[rgb(var(--muted-foreground))] mt-1 line-clamp-2'>
                        {card.description}
                      </div>
                    )}
                    <div className='flex items-center gap-3 mt-2 text-xs text-[rgb(var(--muted-foreground))]'>
                      <span className='px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded'>
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
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-blue-500' />
                진행 중인 작업 ({inProgressCards.length}개)
              </h2>
              <div className='space-y-4'>
                {inProgressCards.map((card: any) => (
                <div
                  key={card.card_id}
                  className='p-4 bg-[rgb(var(--secondary))] rounded-xl border border-[rgb(var(--border))]'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <div className='font-medium text-[rgb(var(--foreground))]'>{card.title}</div>
                      <div className='text-xs text-[rgb(var(--muted-foreground))] mt-1'>
                        {card.list_title}
                      </div>
                    </div>
                  </div>

                  {/* 진행 상태 */}
                  <div className='grid grid-cols-2 gap-4 mt-4'>
                    <div>
                      <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                        진행 상태
                      </label>
                      <select
                        value={card.user_input?.status || '진행중'}
                        onChange={(e) => updateCard(card.card_id, { status: e.target.value })}
                        className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm'
                      >
                        <option value='진행중'>진행중</option>
                        <option value='완료'>완료</option>
                        <option value='대기'>대기</option>
                        <option value='예정'>예정</option>
                      </select>
                    </div>

                    <div>
                      <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                        진척도 ({card.user_input?.progress || card.auto_collected?.checklist_progress || 0}%)
                      </label>
                      <input
                        type='number'
                        min='0'
                        max='100'
                        value={card.user_input?.progress || card.auto_collected?.checklist_progress || 0}
                        onChange={(e) =>
                          updateCard(card.card_id, { progress: parseInt(e.target.value) || 0 })
                        }
                        className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm'
                      />
                    </div>
                  </div>

                  {/* 작업 시간 */}
                  <div className='mt-4'>
                    <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block flex items-center gap-2'>
                      <Clock className='w-3 h-3' />
                      작업 시간 (시간)
                    </label>
                    <input
                      type='number'
                      min='0'
                      step='0.5'
                      value={card.user_input?.hours_spent ?? card.auto_collected?.weekly_hours ?? 0}
                      onChange={(e) =>
                        updateCard(card.card_id, { hours_spent: parseFloat(e.target.value) || 0 })
                      }
                      className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm'
                      placeholder='0'
                    />
                  </div>

                  {/* 추가 설명 */}
                  <div className='mt-4'>
                    <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                      추가 설명
                    </label>
                    <textarea
                      value={card.user_input?.description || ''}
                      onChange={(e) => updateCard(card.card_id, { description: e.target.value })}
                      className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-y'
                      placeholder='작업 내용을 자세히 설명해주세요...'
                    />
                  </div>

                  {/* 이슈사항 */}
                  <div className='mt-4'>
                    <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                      이슈사항 <span className='text-[rgb(var(--muted-foreground))]/60'>(선택사항)</span>
                    </label>
                    <textarea
                      value={card.user_input?.issues || ''}
                      onChange={(e) => updateCard(card.card_id, { issues: e.target.value })}
                      className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--background))] border border-[rgb(var(--border))] text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-y'
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

          {/* 총 작업 시간 */}
          <div className='card p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Clock className='w-5 h-5 text-violet-500' />
                <span className='font-medium text-[rgb(var(--foreground))]'>주간 총 작업 시간</span>
              </div>
              <span className='text-2xl font-bold text-[rgb(var(--foreground))]'>{totalHours}시간</span>
            </div>
          </div>

          {/* 추가 메모 */}
          <div className='card p-6'>
            <label className='text-sm font-medium text-[rgb(var(--foreground))] mb-2 block'>
              추가 메모
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='w-full px-4 py-3 rounded-xl bg-[rgb(var(--secondary))] border border-[rgb(var(--border))] text-sm min-h-[120px]'
              placeholder='추가로 기록하고 싶은 내용이 있다면 적어주세요...'
            />
          </div>
        </div>
      </main>
    </div>
  )
}
