'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Card, Profile } from '@/types'

// 완료된 카드 타입 (확장)
export interface CompletedCard extends Card {
  completer?: Profile | null
  list_title?: string
}

// 완료 통계 타입
export interface CompletionStats {
  totalCards: number
  completedCards: number
  completedThisWeek: number
  completedThisMonth: number
  completionRate: number
  byMember: { profile: Profile; count: number }[]
  byWeek: { week: string; count: number }[]
}

// 기간 타입
export type PeriodFilter = 'week' | 'month' | 'all'

// 보드의 완료된 카드 목록 조회
export async function getCompletedCards(
  boardId: string,
  period: PeriodFilter = 'all'
): Promise<ActionResult<CompletedCard[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 기간 필터 계산
    let startDate: Date | null = null
    const now = new Date()

    if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
    }

    // 보드의 리스트 ID 조회
    const { data: lists, error: listError } = await supabase
      .from('lists')
      .select('id, title')
      .eq('board_id', boardId)

    if (listError || !lists) {
      return { success: false, error: '리스트를 조회할 수 없습니다.' }
    }

    const listIds = lists.map((l) => l.id)
    const listMap = Object.fromEntries(lists.map((l) => [l.id, l.title]))

    if (listIds.length === 0) {
      return { success: true, data: [] }
    }

    // 완료된 카드 조회 (foreign key 없이 안전하게)
    let query = supabase
      .from('cards')
      .select('*')
      .in('list_id', listIds)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })

    if (startDate) {
      query = query.gte('completed_at', startDate.toISOString())
    }

    const { data: cards, error: cardError } = await query

    if (cardError) {
      console.error('완료된 카드 조회 에러:', cardError)
      return { success: false, error: '완료된 카드를 조회할 수 없습니다.' }
    }

    // 완료자 프로필 별도 조회
    const completerIds = [...new Set((cards || []).map((c) => c.completed_by).filter(Boolean))]
    let completerMap: Record<string, Profile> = {}
    
    if (completerIds.length > 0) {
      const { data: completers } = await supabase
        .from('profiles')
        .select('id, email, username, avatar_url')
        .in('id', completerIds)
      
      if (completers) {
        completerMap = Object.fromEntries(completers.map((p) => [p.id, p]))
      }
    }

    // 리스트 제목 + 완료자 정보 추가
    const cardsWithListTitle = (cards || []).map((card) => ({
      ...card,
      list_title: listMap[card.list_id] || '알 수 없음',
      completer: card.completed_by ? completerMap[card.completed_by] : null,
    }))

    return { success: true, data: cardsWithListTitle }
  } catch (error) {
    console.error('완료된 카드 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 보드의 완료 통계 조회
export async function getCompletionStats(boardId: string): Promise<ActionResult<CompletionStats>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드의 리스트 ID 조회
    const { data: lists } = await supabase
      .from('lists')
      .select('id')
      .eq('board_id', boardId)

    if (!lists || lists.length === 0) {
      return {
        success: true,
        data: {
          totalCards: 0,
          completedCards: 0,
          completedThisWeek: 0,
          completedThisMonth: 0,
          completionRate: 0,
          byMember: [],
          byWeek: [],
        },
      }
    }

    const listIds = lists.map((l) => l.id)

    // 전체 카드 수
    const { count: totalCards } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .in('list_id', listIds)

    // 완료된 카드 수
    const { count: completedCards } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .in('list_id', listIds)
      .eq('is_completed', true)

    // 이번 주 완료
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { count: completedThisWeek } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .in('list_id', listIds)
      .eq('is_completed', true)
      .gte('completed_at', weekAgo.toISOString())

    // 이번 달 완료
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const { count: completedThisMonth } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .in('list_id', listIds)
      .eq('is_completed', true)
      .gte('completed_at', monthAgo.toISOString())

    // 멤버별 완료 현황 (foreign key 없이)
    const { data: completedByMember } = await supabase
      .from('cards')
      .select('completed_by')
      .in('list_id', listIds)
      .eq('is_completed', true)
      .not('completed_by', 'is', null)

    // 멤버별 집계
    const memberCountMap = new Map<string, number>()
    for (const card of completedByMember || []) {
      if (card.completed_by) {
        memberCountMap.set(card.completed_by, (memberCountMap.get(card.completed_by) || 0) + 1)
      }
    }

    // 프로필 정보 별도 조회
    const memberIds = Array.from(memberCountMap.keys())
    let byMember: { profile: Profile; count: number }[] = []
    
    if (memberIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', memberIds)
      
      if (profiles) {
        byMember = profiles.map((profile) => ({
          profile: profile as Profile,
          count: memberCountMap.get(profile.id) || 0,
        })).sort((a, b) => b.count - a.count)
      }
    }

    // 주간별 완료 추이 (최근 8주)
    const { data: weeklyData } = await supabase
      .from('cards')
      .select('completed_at')
      .in('list_id', listIds)
      .eq('is_completed', true)
      .not('completed_at', 'is', null)
      .gte('completed_at', new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString())

    // 주간별 집계
    const weekCountMap = new Map<string, number>()
    for (const card of weeklyData || []) {
      if (card.completed_at) {
        const date = new Date(card.completed_at)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        weekCountMap.set(weekKey, (weekCountMap.get(weekKey) || 0) + 1)
      }
    }
    const byWeek = Array.from(weekCountMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))

    const total = totalCards || 0
    const completed = completedCards || 0
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      success: true,
      data: {
        totalCards: total,
        completedCards: completed,
        completedThisWeek: completedThisWeek || 0,
        completedThisMonth: completedThisMonth || 0,
        completionRate,
        byMember,
        byWeek,
      },
    }
  } catch (error) {
    console.error('완료 통계 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
