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

// 주간 시작일 계산 (월요일) - 시간을 00:00:00으로 설정
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 월요일로 조정
  const weekStart = new Date(d.setDate(diff))
  weekStart.setHours(0, 0, 0, 0) // 시간을 00:00:00으로 설정
  return weekStart
}

// 주간 종료일 계산 (일요일) - 시간을 23:59:59로 설정
function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999) // 시간을 23:59:59로 설정
  return weekEnd
}

// 주간보고 자동 수집: 완료된 카드
async function collectCompletedCards(
  boardId: string,
  weekStart: Date,
  weekEnd: Date,
  userId: string
): Promise<any[]> {
  const result = await getCompletedCards(boardId, 'all')
  if (!result.success || !result.data) return []

  // 해당 주간 완료된 카드만 필터링
  const filteredCards = result.data.filter((card) => {
    if (!card.completed_at) return false
    const completedAt = new Date(card.completed_at)
    return completedAt >= weekStart && completedAt <= weekEnd
  })

  // 완료된 카드의 주간 시간 로그와 체크리스트 정보 수집
  const supabase = await createClient()
  const cardIds = filteredCards.map((card) => card.id)
  
  // 모든 체크리스트와 체크리스트 항목을 한 번에 조회
  const { data: checklistsData } = await supabase
    .from('checklists')
    .select(`
      *,
      items:checklist_items(*)
    `)
    .in('card_id', cardIds)
    .order('position', { ascending: true })

  // 카드별 체크리스트 매핑
  const checklistsByCardId = new Map<string, any[]>()
  if (checklistsData) {
    for (const checklist of checklistsData) {
      if (!checklistsByCardId.has(checklist.card_id)) {
        checklistsByCardId.set(checklist.card_id, [])
      }
      checklistsByCardId.get(checklist.card_id)!.push(checklist)
    }
  }

  const completedCardsWithHours = await Promise.all(
    filteredCards.map(async (card) => {
      const weeklyHours = await getCardWeeklyHours(card.id, weekStart, weekEnd, userId)
      const checklists = checklistsByCardId.get(card.id) || []
      
      // 체크리스트 진행률 계산
      const totalItems = checklists.reduce((sum, cl) => sum + (cl.items?.length || 0), 0)
      const completedItems = checklists.reduce(
        (sum, cl) => sum + (cl.items?.filter((item: any) => item.is_checked)?.length || 0),
        0
      )
      const checklistProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      
      return {
        ...card,
        weekly_hours: weeklyHours,
        checklists: checklists.map((cl) => ({
          id: cl.id,
          title: cl.title,
          items: cl.items || [],
          progress: cl.items?.length > 0 
            ? Math.round((cl.items.filter((item: any) => item.is_checked).length / cl.items.length) * 100)
            : 0,
        })),
        checklist_progress: checklistProgress,
      }
    })
  )

  return completedCardsWithHours
}

// 주간보고 자동 수집: 진행 중인 카드 (모든 리스트의 미완료 카드)
async function collectInProgressCards(
  boardId: string,
  weekStart: Date,
  weekEnd: Date,
  userId: string
): Promise<any[]> {
  const boardDataResult = await getBoardData(boardId)
  if (!boardDataResult.success || !boardDataResult.data) return []

  // 1단계: 모든 미완료 카드 수집 (완료 취소된 카드도 포함)
  const allCards: Array<{ card: any; list: any }> = []
  for (const list of boardDataResult.data) {
    if (list.is_done_list) continue
    for (const card of list.cards) {
      // 완료 취소된 카드도 진행 중인 카드로 포함
      // (해당 주간에 작업한 모든 카드를 포함하기 위해)
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

  // 4단계: 결과 병합 및 시간 로그 병렬 조회
  const inProgressCards: any[] = []
  
  // 모든 카드의 주간 시간 로그를 병렬로 조회
  const timeLogPromises = allCards.map(({ card }) => 
    getCardWeeklyHours(card.id, weekStart, weekEnd, userId)
  )
  const weeklyHoursArray = await Promise.all(timeLogPromises)
  
  for (let i = 0; i < allCards.length; i++) {
    const { card, list } = allCards[i]
    const weeklyHours = weeklyHoursArray[i]
    
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
        weekly_hours: weeklyHours,
      },
      // 사용자 입력 필드 (카드 데이터로 자동 채움)
      user_input: {
        status: '진행중',
        progress: checklistProgress,
        description: card.description || '', // 카드 설명 자동 반영
        expected_completion_date: card.due_date || null, // 마감일 자동 반영
        issues: '',
        hours_spent: Number(weeklyHours) || 0, // 주간 시간 로그 자동 집계 (명시적 변환)
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
  const supabase = await createClient()

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

  // 체크리스트 항목 완료 이력 수집 (card_time_logs에서 체크리스트 관련 로그 수집)
  const { data: timeLogs } = await supabase
    .from('card_time_logs')
    .select(`
      id,
      hours,
      description,
      logged_date,
      cards!inner(
        id,
        title,
        lists!inner(
          id,
          title,
          boards!inner(id)
        )
      )
    `)
    .eq('cards.lists.boards.id', boardId)
    .like('description', '체크리스트:%')
    .gte('logged_date', weekStart.toISOString().split('T')[0])
    .lte('logged_date', weekEnd.toISOString().split('T')[0])

  if (timeLogs) {
    for (const log of timeLogs) {
      const card = log.cards as any
      const list = card.lists as any
      const itemContent = log.description?.replace('체크리스트: ', '') || ''
      
      activities.push({
        type: 'checklist_item_completed',
        card_id: card.id,
        card_title: card.title,
        list_title: list.title,
        item_content: itemContent,
        hours: log.hours,
        date: log.logged_date,
      })
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
      collectCompletedCards(boardId, weekStart, weekEnd, user.id),
      collectInProgressCards(boardId, weekStart, weekEnd, user.id),
      collectCardActivities(boardId, weekStart, weekEnd),
    ])

    // 시간 집계 (완료된 카드 + 진행 중인 카드의 시간 로그 합계)
    const completedHours = completedCards.reduce((sum, card) => {
      return sum + (card.weekly_hours || 0)
    }, 0)
    const inProgressHours = inProgressCards.reduce((sum, card) => {
      return sum + (card.user_input?.hours_spent || card.auto_collected?.weekly_hours || 0)
    }, 0)
    const totalHours = completedHours + inProgressHours

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

// 주간보고 데이터 자동 갱신 (최신 카드 데이터로 업데이트)
export async function refreshWeeklyReportData(
  reportId: string,
  boardId: string,
  weekStartDate: string
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
      .select('user_id, status, notes')
      .eq('id', reportId)
      .single()

    if (!report || report.user_id !== user.id) {
      return { success: false, error: '주간보고를 수정할 권한이 없습니다.' }
    }

    // 주간 날짜 계산
    const weekStart = new Date(weekStartDate)
    const weekEnd = getWeekEnd(weekStart)

    // 기존 주간보고 데이터 조회 (완료 취소된 카드 유지를 위해)
    const { data: existingReport } = await supabase
      .from('weekly_reports')
      .select('completed_cards, in_progress_cards')
      .eq('id', reportId)
      .single()

    // 최신 데이터 자동 수집 (병렬 처리)
    const [newCompletedCards, inProgressCards, cardActivities] = await Promise.all([
      collectCompletedCards(boardId, weekStart, weekEnd, user.id),
      collectInProgressCards(boardId, weekStart, weekEnd, user.id),
      collectCardActivities(boardId, weekStart, weekEnd),
    ])

    // 완료된 카드는 새로 수집된 카드만 유지
    // 완료 취소된 카드는 완전히 삭제 (completed_cards에서 제거, in_progress_cards에도 추가하지 않음)
    const mergedCompletedCards = [...newCompletedCards]

    // 기존 user_input 데이터를 새로 수집된 카드와 병합
    const existingUserInputs = new Map<string, any>()
    if (existingReport?.in_progress_cards && Array.isArray(existingReport.in_progress_cards)) {
      for (const card of existingReport.in_progress_cards) {
        if (card.card_id && card.user_input) {
          existingUserInputs.set(card.card_id, card.user_input)
        }
      }
    }

    // 새로 수집된 진행 중인 카드에 기존 user_input 병합
    const mergedInProgressCards = inProgressCards.map((card) => {
      const existingInput = existingUserInputs.get(card.card_id)
      // 최신 자동 수집 시간 (시간 로그에서 최신 집계)
      const latestAutoHours = card.auto_collected?.weekly_hours || 0
      
      if (existingInput) {
        return {
          ...card,
          user_input: {
            ...card.user_input,
            // 시간은 최신 자동 수집 시간을 우선 사용 (시간 로그가 추가되면 자동으로 반영)
            // 사용자가 수동으로 입력한 시간이 있고, 그것이 최신 자동 수집 시간보다 크면 사용자 입력 사용
            hours_spent: existingInput.hours_spent && existingInput.hours_spent > latestAutoHours
              ? existingInput.hours_spent
              : latestAutoHours,
            status: existingInput.status ?? card.user_input?.status ?? '진행중',
            description: existingInput.description || card.user_input?.description || card.description || '',
            issues: existingInput.issues || card.user_input?.issues || '',
            expected_completion_date: existingInput.expected_completion_date || card.user_input?.expected_completion_date || card.due_date || null,
            // 진척도는 체크리스트 진행률로 자동 업데이트 (사용자가 수정한 경우 유지)
            progress: existingInput.progress !== undefined ? existingInput.progress : (card.auto_collected?.checklist_progress || 0),
          },
        }
      }
      return card
    })

    // 시간 집계 (완료된 카드 + 진행 중인 카드의 시간 로그 합계)
    // 최신 자동 수집 시간을 우선 사용
    const completedHours = mergedCompletedCards.reduce((sum, card) => {
      return sum + (card.weekly_hours || 0)
    }, 0)
    const inProgressHours = mergedInProgressCards.reduce((sum, card) => {
      // 최신 자동 수집 시간 우선, 없으면 사용자 입력 시간
      const hours = card.auto_collected?.weekly_hours || card.user_input?.hours_spent || 0
      return sum + hours
    }, 0)
    const totalHours = completedHours + inProgressHours

    // 최신 데이터로 업데이트 (기존 notes는 유지)
    const { data, error } = await supabase
      .from('weekly_reports')
      .update({
        completed_cards: mergedCompletedCards,
        in_progress_cards: mergedInProgressCards,
        card_activities: cardActivities,
        total_hours: totalHours,
        // notes는 기존 값 유지
      })
      .eq('id', reportId)
      .select()
      .single()

    if (error) {
      console.error('주간보고 갱신 에러:', error)
      return { success: false, error: '주간보고 갱신에 실패했습니다.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('주간보고 갱신 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
