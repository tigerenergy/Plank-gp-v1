'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'
import { generateReport, generateReportTitle, type ReportType, type ReportCard } from '@/lib/gemini'
import { getCompletedCards, type PeriodFilter } from './completed'

// 보고서 타입
export interface Report {
  id: string
  board_id: string
  title: string
  content: string
  report_type: ReportType
  period_start: string | null
  period_end: string | null
  created_by: string | null
  created_at: string
}

// AI 보고서 생성
export async function createAIReport(input: {
  boardId: string
  boardTitle: string
  period: PeriodFilter
  reportType: ReportType
}): Promise<ActionResult<Report>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 완료된 카드 조회
    const cardsResult = await getCompletedCards(input.boardId, input.period)
    if (!cardsResult.success || !cardsResult.data) {
      return { success: false, error: '완료된 카드를 조회할 수 없습니다.' }
    }

    const cards = cardsResult.data

    // 기간 라벨 생성
    const periodLabel = input.period === 'week' 
      ? '이번 주' 
      : input.period === 'month' 
        ? '이번 달' 
        : '전체'

    // 보고서용 카드 데이터 변환
    const reportCards: ReportCard[] = cards.map((c) => ({
      title: c.title,
      description: c.description,
      completed_at: c.completed_at,
      completer_name: c.completer?.username || c.completer?.email?.split('@')[0] || '미지정',
      list_title: c.list_title,
    }))

    // AI 보고서 생성
    const content = await generateReport(
      reportCards,
      input.boardTitle,
      input.reportType,
      periodLabel
    )

    // 보고서 제목 생성
    const title = generateReportTitle(input.boardTitle, input.reportType)

    // 기간 계산
    const now = new Date()
    let periodStart: Date | null = null
    
    if (input.period === 'week') {
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - 7)
    } else if (input.period === 'month') {
      periodStart = new Date(now)
      periodStart.setMonth(now.getMonth() - 1)
    }

    // DB에 저장
    const { data, error } = await supabase
      .from('reports')
      .insert({
        board_id: input.boardId,
        title,
        content,
        report_type: input.reportType,
        period_start: periodStart?.toISOString().split('T')[0] || null,
        period_end: now.toISOString().split('T')[0],
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('보고서 저장 에러:', error)
      return { success: false, error: '보고서 저장에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('AI 보고서 생성 에러:', error)
    const message = error instanceof Error ? error.message : '보고서 생성에 실패했습니다.'
    return { success: false, error: message }
  }
}

// 보드의 보고서 목록 조회
export async function getReports(boardId: string): Promise<ActionResult<Report[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('보고서 조회 에러:', error)
      return { success: false, error: '보고서를 조회할 수 없습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('보고서 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보고서 상세 조회
export async function getReport(reportId: string): Promise<ActionResult<Report>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error) {
      console.error('보고서 조회 에러:', error)
      return { success: false, error: '보고서를 찾을 수 없습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('보고서 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보고서 삭제
export async function deleteReport(reportId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('created_by', user.id)

    if (error) {
      console.error('보고서 삭제 에러:', error)
      return { success: false, error: '보고서 삭제에 실패했습니다.' }
    }

    return { success: true }
  } catch (error) {
    console.error('보고서 삭제 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
