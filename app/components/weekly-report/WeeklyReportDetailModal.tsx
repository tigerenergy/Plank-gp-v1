'use client'

import { X, CheckCircle2, TrendingUp, Clock, Calendar, AlertCircle } from 'lucide-react'
import type { WeeklyReport } from '@/app/actions/weekly-report'

interface WeeklyReportDetailModalProps {
  report: WeeklyReport | null
  isOpen: boolean
  onClose: () => void
}

export function WeeklyReportDetailModal({ report, isOpen, onClose }: WeeklyReportDetailModalProps) {
  if (!isOpen || !report) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150'
      onClick={onClose}
    >
      <div
        className='w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150'
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className='sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold'>
              {((report as any).user?.username || (report as any).user?.email?.split('@')[0] || '익명')[0].toUpperCase()}
            </div>
            <div>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))]'>
                {(report as any).user?.username || (report as any).user?.email?.split('@')[0] || '익명'}의 주간보고
              </h2>
              <p className='text-xs text-[rgb(var(--muted-foreground))]'>
                {new Date(report.week_start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~{' '}
                {new Date(report.week_end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* 내용 */}
        <div className='p-6 space-y-6'>
          {/* 총 작업 시간 */}
          <div className='flex items-center gap-2 px-4 py-3 bg-violet-500/10 rounded-xl border border-violet-500/20'>
            <Clock className='w-5 h-5 text-violet-600 dark:text-violet-400' />
            <span className='text-sm font-medium text-[rgb(var(--muted-foreground))]'>총 작업 시간:</span>
            <span className='text-lg font-bold text-violet-600 dark:text-violet-400'>{report.total_hours || 0}시간</span>
          </div>

          {/* 완료된 작업 */}
          {report.completed_cards && report.completed_cards.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <CheckCircle2 className='w-5 h-5 text-emerald-500' />
                <h3 className='text-base font-semibold text-[rgb(var(--foreground))]'>
                  완료된 작업 ({report.completed_cards.length}개)
                </h3>
              </div>
              <div className='space-y-2'>
                {report.completed_cards.map((card: any, idx: number) => (
                  <div
                    key={idx}
                    className='p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors'
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex-1'>
                        <div className='text-sm font-medium text-[rgb(var(--foreground))] mb-1'>{card.title}</div>
                        {card.list_title && (
                          <div className='text-xs text-[rgb(var(--muted-foreground))] mb-2'>{card.list_title}</div>
                        )}
                      </div>
                      {card.weekly_hours && card.weekly_hours > 0 && (
                        <div className='flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 ml-2'>
                          <Clock className='w-3 h-3' />
                          {card.weekly_hours}시간
                        </div>
                      )}
                    </div>
                    {card.description && (
                      <div className='text-xs text-[rgb(var(--muted-foreground))] mt-2'>{card.description}</div>
                    )}
                    
                    {/* 체크리스트 표시 */}
                    {card.checklists && card.checklists.length > 0 && (
                      <div className='mt-3 space-y-2'>
                        {card.checklists.map((checklist: any) => (
                          <div key={checklist.id} className='bg-emerald-500/5 rounded-lg p-2 border border-emerald-500/10'>
                            <div className='flex items-center justify-between mb-1.5'>
                              <span className='text-xs font-medium text-[rgb(var(--foreground))]'>{checklist.title}</span>
                              <span className='text-xs text-emerald-600 dark:text-emerald-400'>{checklist.progress}%</span>
                            </div>
                            <div className='space-y-1'>
                              {checklist.items?.map((item: any) => (
                                <div key={item.id} className='flex items-center gap-2 text-xs'>
                                  {item.is_checked ? (
                                    <CheckCircle2 className='w-3 h-3 text-emerald-500 flex-shrink-0' />
                                  ) : (
                                    <div className='w-3 h-3 rounded border border-[rgb(var(--border))] flex-shrink-0' />
                                  )}
                                  <span className={item.is_checked ? 'text-[rgb(var(--muted-foreground))] line-through' : 'text-[rgb(var(--foreground))]'}>
                                    {item.content}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {card.completed_at && (
                      <div className='flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2'>
                        <Calendar className='w-3 h-3' />
                        완료일: {new Date(card.completed_at).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 진행 중인 작업 */}
          {report.in_progress_cards && report.in_progress_cards.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <TrendingUp className='w-5 h-5 text-blue-500' />
                <h3 className='text-base font-semibold text-[rgb(var(--foreground))]'>
                  진행 중인 작업 ({report.in_progress_cards.length}개)
                </h3>
              </div>
              <div className='space-y-3'>
                {report.in_progress_cards.map((card: any, idx: number) => {
                  const progress = card.user_input?.progress || card.auto_collected?.checklist_progress || 0
                  const hours = card.user_input?.hours_spent || card.auto_collected?.weekly_hours || 0
                  return (
                    <div
                      key={card.card_id || idx}
                      className='p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-colors'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <div className='text-sm font-medium text-[rgb(var(--foreground))] mb-1'>{card.title}</div>
                          <div className='flex items-center gap-2 mt-2'>
                            <span className='px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded text-xs font-medium'>
                              {card.user_input?.status || '진행중'}
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

                      {/* 예상 완료일 */}
                      {card.user_input?.expected_completion_date && (
                        <div className='flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] mb-2'>
                          <Calendar className='w-3 h-3' />
                          예상 완료일: {new Date(card.user_input.expected_completion_date).toLocaleDateString('ko-KR')}
                        </div>
                      )}

                      {/* 이슈사항 */}
                      {card.user_input?.issues && (
                        <div className='flex items-start gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20 mt-2'>
                          <AlertCircle className='w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5' />
                          <div className='text-xs text-red-600 dark:text-red-400 flex-1'>
                            <div className='font-medium mb-1'>이슈사항</div>
                            <div className='whitespace-pre-wrap'>{card.user_input.issues}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 체크리스트 완료 항목 (했던 일) */}
          {report.card_activities && report.card_activities.length > 0 && (
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <CheckCircle2 className='w-5 h-5 text-amber-500' />
                <h3 className='text-base font-semibold text-[rgb(var(--foreground))]'>
                  체크리스트 완료 항목 ({report.card_activities.filter((a: any) => a.type === 'checklist_item_completed').length}개)
                </h3>
              </div>
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
          {report.notes && (
            <div className='p-4 bg-[rgb(var(--secondary))] rounded-xl'>
              <div className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-2'>추가 메모</div>
              <div className='text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap'>{report.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
