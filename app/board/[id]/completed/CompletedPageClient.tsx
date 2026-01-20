'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Users, 
  TrendingUp,
  Download,
  FileText,
  X,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Clock,
  Mail,
  Send,
  Plus
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { toast } from 'sonner'
import type { Board } from '@/types'
import { 
  getCompletedCards, 
  getCompletionStats, 
  type CompletedCard, 
  type CompletionStats,
  type PeriodFilter 
} from '@/app/actions/completed'
import { createAIReport, getReports, deleteReport, type Report } from '@/app/actions/report'
import { sendReportToEmail, getEmailLogs, type EmailLog } from '@/app/actions/email'
import type { ReportType } from '@/lib/gemini'

interface CompletedPageClientProps {
  board: Board
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b']

export function CompletedPageClient({ board }: CompletedPageClientProps) {
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [cards, setCards] = useState<CompletedCard[]>([])
  const [stats, setStats] = useState<CompletionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  
  // 보고서 관련 상태
  const [showReportModal, setShowReportModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reportType, setReportType] = useState<ReportType>('weekly')
  const [copied, setCopied] = useState(false)

  // 이메일 발송 관련 상태
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string[]>([''])
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const [cardsResult, statsResult] = await Promise.all([
      getCompletedCards(board.id, period),
      getCompletionStats(board.id),
    ])

    if (cardsResult.success && cardsResult.data) {
      setCards(cardsResult.data)
    }
    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data)
    }
    setIsLoading(false)
  }, [board.id, period])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedCards.size === cards.length) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(cards.map((c) => c.id)))
    }
  }

  // 개별 선택
  const toggleSelect = (cardId: string) => {
    const newSet = new Set(selectedCards)
    if (newSet.has(cardId)) {
      newSet.delete(cardId)
    } else {
      newSet.add(cardId)
    }
    setSelectedCards(newSet)
  }

  // 보고서 목록 로드
  const loadReports = useCallback(async () => {
    const result = await getReports(board.id)
    if (result.success && result.data) {
      setReports(result.data)
    }
  }, [board.id])

  // 모달 열릴 때 보고서 목록 로드
  useEffect(() => {
    if (showReportModal) {
      loadReports()
    }
  }, [showReportModal, loadReports])

  // AI 보고서 생성
  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const result = await createAIReport({
        boardId: board.id,
        boardTitle: board.title,
        period,
        reportType,
      })

      if (result.success && result.data) {
        toast.success('보고서가 생성되었습니다!')
        setSelectedReport(result.data)
        loadReports()
      } else {
        toast.error(result.error || '보고서 생성에 실패했습니다.')
      }
    } catch {
      toast.error('보고서 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  // 보고서 삭제
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('이 보고서를 삭제하시겠습니까?')) return
    
    const result = await deleteReport(reportId)
    if (result.success) {
      toast.success('보고서가 삭제되었습니다.')
      if (selectedReport?.id === reportId) {
        setSelectedReport(null)
      }
      loadReports()
    } else {
      toast.error(result.error || '보고서 삭제에 실패했습니다.')
    }
  }

  // 보고서 복사
  const handleCopyReport = async () => {
    if (!selectedReport) return
    
    await navigator.clipboard.writeText(selectedReport.content)
    setCopied(true)
    toast.success('보고서가 클립보드에 복사되었습니다!')
    setTimeout(() => setCopied(false), 2000)
  }

  // 보고서 다운로드 (마크다운 파일)
  const handleDownloadReport = () => {
    if (!selectedReport) return
    
    const blob = new Blob([selectedReport.content], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedReport.title}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 이메일 발송 모달 열기
  const openEmailModal = () => {
    if (!selectedReport) {
      toast.error('먼저 보고서를 선택해주세요.')
      return
    }
    setShowEmailModal(true)
  }

  // 이메일 로그 로드
  const loadEmailLogs = useCallback(async () => {
    const result = await getEmailLogs(board.id)
    if (result.success && result.data) {
      setEmailLogs(result.data)
    }
  }, [board.id])

  // 이메일 모달 열릴 때 로그 로드
  useEffect(() => {
    if (showEmailModal) {
      loadEmailLogs()
    }
  }, [showEmailModal, loadEmailLogs])

  // 수신자 추가
  const addRecipient = () => {
    setEmailRecipients([...emailRecipients, ''])
  }

  // 수신자 제거
  const removeRecipient = (index: number) => {
    if (emailRecipients.length === 1) return
    setEmailRecipients(emailRecipients.filter((_, i) => i !== index))
  }

  // 수신자 변경
  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...emailRecipients]
    newRecipients[index] = value
    setEmailRecipients(newRecipients)
  }

  // 이메일 발송
  const handleSendEmail = async () => {
    if (!selectedReport) return

    const validEmails = emailRecipients.filter((e) => e.trim())
    if (validEmails.length === 0) {
      toast.error('수신자 이메일을 입력해주세요.')
      return
    }

    setIsSendingEmail(true)
    try {
      const periodLabel = period === 'week' 
        ? '이번 주' 
        : period === 'month' 
          ? '이번 달' 
          : '전체'

      const result = await sendReportToEmail({
        reportId: selectedReport.id,
        recipients: validEmails,
        boardTitle: board.title,
        periodLabel,
      })

      if (result.success) {
        toast.success('이메일이 발송되었습니다!')
        setShowEmailModal(false)
        setEmailRecipients([''])
        loadEmailLogs()
      } else {
        toast.error(result.error || '이메일 발송에 실패했습니다.')
      }
    } catch {
      toast.error('이메일 발송 중 오류가 발생했습니다.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  // CSV 다운로드
  const downloadCSV = () => {
    const targetCards = selectedCards.size > 0 
      ? cards.filter((c) => selectedCards.has(c.id))
      : cards

    const header = '제목,설명,리스트,완료일,완료자\n'
    const rows = targetCards.map((c) => {
      const completedAt = c.completed_at 
        ? new Date(c.completed_at).toLocaleDateString('ko-KR')
        : ''
      const completerName = c.completer?.username || c.completer?.email || ''
      return `"${c.title}","${c.description || ''}","${c.list_title || ''}","${completedAt}","${completerName}"`
    }).join('\n')

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${board.title}_완료된작업_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 주간 차트 데이터 포맷
  const weeklyChartData = stats?.byWeek.map((w) => ({
    name: new Date(w.week).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    완료: w.count,
  })) || []

  // 멤버별 차트 데이터
  const memberChartData = stats?.byMember.slice(0, 5).map((m) => ({
    name: m.profile.username || m.profile.email?.split('@')[0] || '익명',
    value: m.count,
  })) || []

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
                  {board.emoji || '📋'} {board.title}
                </h1>
                <p className='text-sm text-[rgb(var(--muted-foreground))]'>완료된 작업들</p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className='flex items-center gap-2'>
              <button
                onClick={downloadCSV}
                className='flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))]'
              >
                <Download className='w-4 h-4' />
                <span className='hidden sm:inline'>CSV</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className='flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white transition-colors'
              >
                <Sparkles className='w-4 h-4' />
                <span className='hidden sm:inline'>AI 보고서</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full' />
          </div>
        ) : (
          <div className='space-y-8'>
            {/* 통계 카드 */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              <StatCard
                icon={<CheckCircle2 className='w-5 h-5 text-emerald-500' />}
                label='총 완료'
                value={stats?.completedCards || 0}
                subtext={`전체 ${stats?.totalCards || 0}개 중`}
              />
              <StatCard
                icon={<Calendar className='w-5 h-5 text-blue-500' />}
                label='이번 주'
                value={stats?.completedThisWeek || 0}
                subtext='완료'
              />
              <StatCard
                icon={<TrendingUp className='w-5 h-5 text-violet-500' />}
                label='완료율'
                value={`${stats?.completionRate || 0}%`}
                subtext='달성'
              />
              <StatCard
                icon={<Users className='w-5 h-5 text-amber-500' />}
                label='이번 달'
                value={stats?.completedThisMonth || 0}
                subtext='완료'
              />
            </div>

            {/* 차트 섹션 */}
            {(weeklyChartData.length > 0 || memberChartData.length > 0) && (
              <div className='grid lg:grid-cols-2 gap-6'>
                {/* 주간 완료 추이 */}
                {weeklyChartData.length > 0 && (
                  <div className='card p-6'>
                    <h3 className='text-sm font-semibold text-[rgb(var(--foreground))] mb-4'>
                      📈 주간 완료 추이
                    </h3>
                    <div className='h-64'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={weeklyChartData}>
                          <CartesianGrid strokeDasharray='3 3' stroke='rgb(var(--border))' />
                          <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgb(var(--card))',
                              border: '1px solid rgb(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey='완료' fill='#8b5cf6' radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 팀원별 완료 */}
                {memberChartData.length > 0 && (
                  <div className='card p-6'>
                    <h3 className='text-sm font-semibold text-[rgb(var(--foreground))] mb-4'>
                      👥 팀원별 완료 현황
                    </h3>
                    <div className='h-64 flex items-center justify-center'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                          <Pie
                            data={memberChartData}
                            cx='50%'
                            cy='50%'
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey='value'
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {memberChartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 기간 필터 + 카드 목록 */}
            <div className='card'>
              <div className='p-4 border-b border-[rgb(var(--border))] flex flex-wrap items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-[rgb(var(--foreground))]'>기간:</span>
                  <div className='flex gap-1'>
                    {(['week', 'month', 'all'] as PeriodFilter[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          period === p
                            ? 'bg-violet-500 text-white'
                            : 'bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))]/80'
                        }`}
                      >
                        {p === 'week' ? '이번 주' : p === 'month' ? '이번 달' : '전체'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='flex items-center gap-4'>
                  <label className='flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]'>
                    <input
                      type='checkbox'
                      checked={selectedCards.size === cards.length && cards.length > 0}
                      onChange={toggleSelectAll}
                      className='w-4 h-4 rounded border-gray-300'
                    />
                    전체 선택
                  </label>
                  <span className='text-sm text-[rgb(var(--muted-foreground))]'>
                    {selectedCards.size > 0 ? `${selectedCards.size}개 선택됨` : `${cards.length}개`}
                  </span>
                </div>
              </div>

              {/* 카드 목록 */}
              <div className='divide-y divide-[rgb(var(--border))]'>
                {cards.length === 0 ? (
                  <div className='py-12 text-center'>
                    <CheckCircle2 className='w-12 h-12 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
                    <p className='text-[rgb(var(--muted-foreground))]'>
                      {period === 'all' ? '완료된 카드가 없습니다' : '해당 기간에 완료된 카드가 없습니다'}
                    </p>
                  </div>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.id}
                      className='p-4 flex items-start gap-4 hover:bg-[rgb(var(--secondary))]/50 transition-colors'
                    >
                      <input
                        type='checkbox'
                        checked={selectedCards.has(card.id)}
                        onChange={() => toggleSelect(card.id)}
                        className='w-4 h-4 mt-1 rounded border-gray-300'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <CheckCircle2 className='w-4 h-4 text-emerald-500 flex-shrink-0' />
                          <span className='font-medium text-[rgb(var(--foreground))] truncate'>
                            {card.title}
                          </span>
                        </div>
                        {card.description && (
                          <p className='text-sm text-[rgb(var(--muted-foreground))] line-clamp-1 mb-2'>
                            {card.description}
                          </p>
                        )}
                        <div className='flex flex-wrap items-center gap-3 text-xs text-[rgb(var(--muted-foreground))]'>
                          <span className='px-2 py-0.5 bg-[rgb(var(--secondary))] rounded'>
                            {card.list_title}
                          </span>
                          {card.completed_at && (
                            <span>
                              완료: {new Date(card.completed_at).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                          {card.completer && (
                            <span className='flex items-center gap-1'>
                              by{' '}
                              {card.completer.avatar_url ? (
                                <img
                                  src={card.completer.avatar_url}
                                  alt=''
                                  className='w-4 h-4 rounded-full'
                                  referrerPolicy='no-referrer'
                                />
                              ) : null}
                              {card.completer.username || card.completer.email?.split('@')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI 보고서 모달 */}
      {showReportModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-4xl max-h-[90vh] bg-[rgb(var(--card))] rounded-2xl shadow-2xl overflow-hidden flex flex-col'>
            {/* 모달 헤더 */}
            <div className='px-6 py-4 border-b border-[rgb(var(--border))] flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Sparkles className='w-5 h-5 text-violet-500' />
                <h2 className='text-lg font-bold text-[rgb(var(--foreground))]'>AI 보고서</h2>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className='p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className='flex-1 overflow-hidden flex'>
              {/* 왼쪽: 보고서 목록 */}
              <div className='w-64 border-r border-[rgb(var(--border))] flex flex-col'>
                {/* 새 보고서 생성 */}
                <div className='p-4 border-b border-[rgb(var(--border))]'>
                  <div className='mb-3'>
                    <label className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1 block'>
                      보고서 유형
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      className='w-full px-3 py-2 rounded-lg bg-[rgb(var(--secondary))] border border-[rgb(var(--border))] text-sm'
                    >
                      <option value='weekly'>주간 보고</option>
                      <option value='monthly'>월간 보고</option>
                      <option value='custom'>사용자 지정</option>
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className='w-full py-2 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors'
                  >
                    {isGenerating ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className='w-4 h-4' />
                        새 보고서 생성
                      </>
                    )}
                  </button>
                </div>

                {/* 보고서 목록 */}
                <div className='flex-1 overflow-y-auto'>
                  <div className='p-2'>
                    <div className='text-xs font-medium text-[rgb(var(--muted-foreground))] px-2 py-1 mb-1'>
                      저장된 보고서
                    </div>
                    {reports.length === 0 ? (
                      <div className='text-center py-8 text-sm text-[rgb(var(--muted-foreground))]'>
                        보고서가 없습니다
                      </div>
                    ) : (
                      reports.map((report) => (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedReport?.id === report.id
                              ? 'bg-violet-500/10 border border-violet-500/30'
                              : 'hover:bg-[rgb(var(--secondary))]'
                          }`}
                        >
                          <div className='flex items-start justify-between gap-2'>
                            <div className='flex-1 min-w-0'>
                              <div className='text-sm font-medium text-[rgb(var(--foreground))] truncate'>
                                {report.report_type === 'weekly' ? '📅' : report.report_type === 'monthly' ? '📆' : '📄'}{' '}
                                {report.report_type === 'weekly' ? '주간' : report.report_type === 'monthly' ? '월간' : '보고서'}
                              </div>
                              <div className='text-xs text-[rgb(var(--muted-foreground))] flex items-center gap-1 mt-1'>
                                <Clock className='w-3 h-3' />
                                {new Date(report.created_at).toLocaleDateString('ko-KR', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteReport(report.id)
                              }}
                              className='p-1 rounded hover:bg-red-500/10 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 보고서 미리보기 */}
              <div className='flex-1 flex flex-col overflow-hidden'>
                {selectedReport ? (
                  <>
                    {/* 보고서 헤더 */}
                    <div className='px-6 py-3 border-b border-[rgb(var(--border))] flex items-center justify-between'>
                      <h3 className='font-medium text-[rgb(var(--foreground))] truncate flex-1 mr-4'>{selectedReport.title}</h3>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={handleCopyReport}
                          className='p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors'
                          title='복사'
                        >
                          {copied ? (
                            <Check className='w-4 h-4 text-emerald-500' />
                          ) : (
                            <Copy className='w-4 h-4' />
                          )}
                        </button>
                        <button
                          onClick={handleDownloadReport}
                          className='p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors'
                          title='다운로드'
                        >
                          <Download className='w-4 h-4' />
                        </button>
                        <button
                          onClick={openEmailModal}
                          className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors'
                          title='이메일 발송'
                        >
                          <Mail className='w-4 h-4' />
                          <span className='hidden sm:inline'>이메일</span>
                        </button>
                      </div>
                    </div>

                    {/* 보고서 내용 */}
                    <div className='flex-1 overflow-y-auto p-6'>
                      <div className='prose prose-sm dark:prose-invert max-w-none'>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedReport.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='flex-1 flex items-center justify-center'>
                    <div className='text-center'>
                      <FileText className='w-12 h-12 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-30' />
                      <p className='text-[rgb(var(--muted-foreground))]'>
                        보고서를 선택하거나 새로 생성하세요
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이메일 발송 모달 */}
      {showEmailModal && selectedReport && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-lg bg-[rgb(var(--card))] rounded-2xl shadow-2xl overflow-hidden'>
            {/* 모달 헤더 */}
            <div className='px-6 py-4 border-b border-[rgb(var(--border))] flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Mail className='w-5 h-5 text-blue-500' />
                <h2 className='text-lg font-bold text-[rgb(var(--foreground))]'>이메일 발송</h2>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className='p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className='p-6 space-y-4'>
              {/* 보고서 정보 */}
              <div className='p-4 bg-[rgb(var(--secondary))] rounded-xl'>
                <div className='text-xs text-[rgb(var(--muted-foreground))] mb-1'>발송할 보고서</div>
                <div className='font-medium text-[rgb(var(--foreground))]'>{selectedReport.title}</div>
              </div>

              {/* 수신자 입력 */}
              <div>
                <label className='text-sm font-medium text-[rgb(var(--foreground))] mb-2 block'>
                  수신자 이메일
                </label>
                <div className='space-y-2'>
                  {emailRecipients.map((email, index) => (
                    <div key={index} className='flex gap-2'>
                      <input
                        type='email'
                        value={email}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        placeholder='example@email.com'
                        className='flex-1 px-4 py-2 rounded-xl bg-[rgb(var(--secondary))] border border-[rgb(var(--border))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      {emailRecipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className='p-2 rounded-xl hover:bg-red-500/10 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors'
                        >
                          <X className='w-5 h-5' />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addRecipient}
                  className='mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors'
                >
                  <Plus className='w-4 h-4' />
                  수신자 추가
                </button>
              </div>

              {/* 발송 기록 */}
              {emailLogs.length > 0 && (
                <div>
                  <div className='text-xs text-[rgb(var(--muted-foreground))] mb-2'>최근 발송 기록</div>
                  <div className='max-h-32 overflow-y-auto space-y-1'>
                    {emailLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className='flex items-center justify-between text-xs p-2 bg-[rgb(var(--secondary))] rounded-lg'
                      >
                        <span className='text-[rgb(var(--muted-foreground))] truncate'>
                          {log.recipients.join(', ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${
                          log.status === 'sent' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {log.status === 'sent' ? '✓ 발송됨' : '✗ 실패'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className='px-6 py-4 border-t border-[rgb(var(--border))] flex justify-end gap-3'>
              <button
                onClick={() => setShowEmailModal(false)}
                className='px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))]'
              >
                취소
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className='flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium transition-colors'
              >
                {isSendingEmail ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    발송 중...
                  </>
                ) : (
                  <>
                    <Send className='w-4 h-4' />
                    이메일 발송
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 통계 카드 컴포넌트
function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext: string
}) {
  return (
    <div className='card p-4'>
      <div className='flex items-center gap-3 mb-2'>
        {icon}
        <span className='text-sm text-[rgb(var(--muted-foreground))]'>{label}</span>
      </div>
      <div className='text-2xl font-bold text-[rgb(var(--foreground))]'>{value}</div>
      <div className='text-xs text-[rgb(var(--muted-foreground))]'>{subtext}</div>
    </div>
  )
}
