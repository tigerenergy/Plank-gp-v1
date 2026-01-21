'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'
import { getCompletedCards, type PeriodFilter } from './completed'
import { getBoardData } from './board'
import { getCardWeeklyHours } from './time-log'

// 주간보고 타입
export interface WeeklyReport {
  id: string
  board_id: string
  user_id: string
  week_start_date: string
  week_end_date: string
  status: 'draft' | 'submitted'
  completed_cards: any[]
  in_progress_cards: any[]
  card_activities: any[]
  total_hours: number
  notes: string | null
  created_at: string
  updated_at: string
}

// 주간 시작일 계산 (월요일)
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 월요일로 조정
  return new Date(d.setDate(diff))
}

// 주간 종료일 계산 (일요일)
function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return weekEnd
}

// 주간보고 자동 수집: 완료된 카드
async function collectCompletedCards(
  boardId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<any[]> {
  const result = await getCompletedCards(boardId, 'all')
  if (!result.success || !result.data) return []

  // 해당 주간 완료된 카드만 필터링
  return result.data.filter((card) => {
    if (!card.completed_at) return false
    const completedAt = new Date(card.completed_at)
    return completedAt >= weekStart && completedAt <= weekEnd
  })
}

// 주간보고 자동 수집: 진행 중인 카드 (모든 리스트의 미완료 카드)
async function collectInProgressCards(
  boardId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<any[]> {
  const boardDataResult = await getBoardData(boardId)
  if (!boardDataResult.success || !boardDataResult.data) return []

  // 1단계: 모든 미완료 카드 수집
  const allCards: Array<{ card: any; list: any }> = []
  for (const list of boardDataResult.data) {
    if (list.is_done_list) continue
    for (const card of list.cards) {
      if (card.is_completed) continue
      allCards.push({ card, list })
    }
  }

  if (allCards.length === 0) return []

  // 2단계: 모든 카드의 체크리스트와 댓글을 한 번에 병렬 조회 (2번의 쿼리로 최적화)
  const cardIds = allCards.map(({ card }) => card.id)
  const supabase = await createClient()

  const [checklistsResult, commentsResult] = await Promise.all([
    // 모든 체크리스트 한 번에 조회
    supabase
      .from('checklists')
      .select(`
        *,
        items:checklist_items(*)
      `)
      .in('card_id', cardIds)
      .order('position', { ascending: true }),
    // 모든 댓글 한 번에 조회 (카운트만 필요하므로 card_id만)
    supabase
      .from('comments')
      .select('card_id')
      .in('card_id', cardIds),
  ])

  // 3단계: 결과를 Map으로 매핑 (O(1) 조회)
  const checklistsByCardId = new Map<string, any[]>()
  if (checklistsResult.data) {
    for (const checklist of checklistsResult.data) {
      if (!checklistsByCardId.has(checklist.card_id)) {
        checklistsByCardId.set(checklist.card_id, [])
      }
      checklistsByCardId.get(checklist.card_id)!.push(checklist)
    }
  }

  const commentsCountByCardId = new Map<string, number>()
  if (commentsResult.data) {
    for (const comment of commentsResult.data) {
      commentsCountByCardId.set(
        comment.card_id,
        (commentsCountByCardId.get(comment.card_id) || 0) + 1
      )
    }
  }

  // 4단계: 결과 병합
  const inProgressCards: any[] = []
  for (const { card, list } of allCards) {
    // 체크리스트 진행률 계산
    const checklists = checklistsByCardId.get(card.id) || []
    const totalItems = checklists.reduce((sum, cl) => sum + (cl.items?.length || 0), 0)
    const completedItems = checklists.reduce(
      (sum, cl) => sum + (cl.items?.filter((item: any) => item.is_checked)?.length || 0),
      0
    )
    const checklistProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    // 댓글 수
    const commentsCount = commentsCountByCardId.get(card.id) || 0

    inProgressCards.push({
      card_id: card.id,
      list_id: list.id,
      list_title: list.title,
      title: card.title,
      description: card.description,
      created_at: card.created_at,
      updated_at: card.updated_at,
      checklist_progress: checklistProgress,
      comments_count: commentsCount,
      assignee: card.assignee,
      creator: card.creator,
      labels: card.labels || [],
      // 자동 수집된 메타데이터
      auto_collected: {
        created_at: card.created_at,
        updated_at: card.updated_at,
        checklist_progress: checklistProgress,
        comments_count: commentsCount,
      },
      // 사용자 입력 필드 (초기값)
      user_input: {
        status: '진행중',
        progress: checklistProgress,
        description: '',
        expected_completion_date: null,
        issues: '',
        hours_spent: 0,
      },
    })
  }

  return inProgressCards
}

// 주간보고 자동 수집: 카드 활동 이력
async function collectCardActivities(
  boardId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<any[]> {
  const boardDataResult = await getBoardData(boardId)
  if (!boardDataResult.success || !boardDataResult.data) return []

  const activities: any[] = []

  // 모든 리스트의 모든 카드 순회
  for (const list of boardDataResult.data) {
    for (const card of list.cards) {
      const cardCreatedAt = new Date(card.created_at)
      const cardUpdatedAt = new Date(card.updated_at)

      // 카드 생성 이력
      if (cardCreatedAt >= weekStart && cardCreatedAt <= weekEnd) {
        activities.push({
          type: 'created',
          card_id: card.id,
          card_title: card.title,
          list_title: list.title,
          date: card.created_at,
        })
      }

      // 카드 수정 이력 (생성과 다른 경우만)
      if (
        cardUpdatedAt >= weekStart &&
        cardUpdatedAt <= weekEnd &&
        cardUpdatedAt.getTime() !== cardCreatedAt.getTime()
      ) {
        activities.push({
          type: 'updated',
          card_id: card.id,
          card_title: card.title,
          list_title: list.title,
          date: card.updated_at,
        })
      }

      // 카드 완료 이력
      if (card.is_completed && card.completed_at) {
        const completedAt = new Date(card.completed_at)
        if (completedAt >= weekStart && completedAt <= weekEnd) {
          activities.push({
            type: 'completed',
            card_id: card.id,
            card_title: card.title,
            list_title: list.title,
            date: card.completed_at,
          })
        }
      }
    }
  }

  return activities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// 주간보고 생성
export async function createWeeklyReport(
  boardId: string,
  weekStartDate?: string
): Promise<ActionResult<WeeklyReport>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 주간 날짜 계산
    const weekStart = weekStartDate ? new Date(weekStartDate) : getWeekStart()
    const weekEnd = getWeekEnd(weekStart)

    // 중복 확인
    const { data: existing } = await supabase
      .from('weekly_reports')
      .select('id')
      .eq('board_id', boardId)
      .eq('user_id', user.id)
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .maybeSingle()

    if (existing) {
      return { success: false, error: '이미 해당 주간의 주간보고가 존재합니다.' }
    }

    // 자동 수집 (병렬 처리)
    const [completedCards, inProgressCards, cardActivities] = await Promise.all([
      collectCompletedCards(boardId, weekStart, weekEnd),
      collectInProgressCards(boardId, weekStart, weekEnd),
      collectCardActivities(boardId, weekStart, weekEnd),
    ])

    // 시간 집계 (진행 중인 카드의 시간 로그 합계)
    const totalHours = inProgressCards.reduce((sum, card) => {
      return sum + (card.user_input?.hours_spent || card.auto_collected?.weekly_hours || 0)
    }, 0)

    // 주간보고 생성
    const { data, error } = await supabase
      .from('weekly_reports')
      .insert({
        board_id: boardId,
        user_id: user.id,
        week_start_date: weekStart.toISOString().split('T')[0],
        week_end_date: weekEnd.toISOString().split('T')[0],
        status: 'draft',
        completed_cards: completedCards,
        in_progress_cards: inProgressCards,
        card_activities: cardActivities,
        total_hours: totalHours,
        notes: null,
      })
      .select()
      .single()

    if (error) {
      console.error('주간보고 생성 에러:', error)
      return { success: false, error: '주간보고 생성에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('주간보고 생성 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 주간보고 수정
export async function updateWeeklyReport(
  reportId: string,
  updates: {
    in_progress_cards?: any[]
    total_hours?: number
    notes?: string | null
    status?: 'draft' | 'submitted'
  }
): Promise<ActionResult<WeeklyReport>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 작성자 확인
    const { data: report } = await supabase
      .from('weekly_reports')
      .select('user_id')
      .eq('id', reportId)
      .single()

    if (!report || report.user_id !== user.id) {
      return { success: false, error: '주간보고를 수정할 권한이 없습니다.' }
    }

    const { data, error } = await supabase
      .from('weekly_reports')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single()

    if (error) {
      console.error('주간보고 수정 에러:', error)
      return { success: false, error: '주간보고 수정에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('주간보고 수정 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 주간보고 조회
export async function getWeeklyReport(reportId: string): Promise<ActionResult<WeeklyReport>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data, error } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error) {
      console.error('주간보고 조회 에러:', error)
      return { success: false, error: '주간보고를 찾을 수 없습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('주간보고 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드별 주간보고 목록 조회 (공유 페이지용)
export async function getWeeklyReportsByBoard(
  boardId: string,
  weekStartDate?: string
): Promise<ActionResult<WeeklyReport[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    let query = supabase
      .from('weekly_reports')
      .select(
        `
        *,
        user:profiles!weekly_reports_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .eq('board_id', boardId)
      .order('week_start_date', { ascending: false })

    if (weekStartDate) {
      query = query.eq('week_start_date', weekStartDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('주간보고 목록 조회 에러:', error)
      return { success: false, error: '주간보고 목록을 조회할 수 없습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('주간보고 목록 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 주간보고 제출
export async function submitWeeklyReport(reportId: string): Promise<ActionResult<WeeklyReport>> {
  return updateWeeklyReport(reportId, { status: 'submitted' })
}
