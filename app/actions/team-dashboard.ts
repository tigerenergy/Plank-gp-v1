'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// 팀 전체 통계 타입
export interface TeamDashboardStats {
  // 전체 요약
  totalMembers: number
  totalReports: number
  totalHours: number
  avgHoursPerMember: number
  avgHoursPerWeek: number
  
  // 주간별 통계
  weeklyStats: {
    week_start_date: string
    total_hours: number
    member_count: number
    report_count: number
    completed_cards: number
    in_progress_cards: number
  }[]
  
  // 멤버별 통계
  memberStats: {
    user_id: string
    username: string | null
    email: string
    avatar_url: string | null
    total_hours: number
    report_count: number
    avg_hours_per_week: number
    completed_cards: number
    in_progress_cards: number
    last_report_date: string | null
  }[]
  
  // 프로젝트 진행률
  projectProgress: {
    total_cards: number
    completed_cards: number
    in_progress_cards: number
    completion_rate: number
  }
  
  // 최근 활동
  recentActivity: {
    type: 'report_submitted' | 'report_created' | 'card_completed'
    user_id: string
    username: string | null
    email: string
    description: string
    date: string
  }[]
}

// 팀 전체 통계 대시보드 조회
export async function getTeamDashboardStats(
  boardId: string,
  weeks: number = 8
): Promise<ActionResult<TeamDashboardStats>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 보드 멤버 조회
    const { data: boardMembers } = await supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', boardId)

    const { data: boardOwner } = await supabase
      .from('boards')
      .select('created_by')
      .eq('id', boardId)
      .single()

    const memberIds = new Set<string>()
    boardMembers?.forEach((m) => memberIds.add(m.user_id))
    if (boardOwner?.created_by) {
      memberIds.add(boardOwner.created_by)
    }

    if (memberIds.size === 0) {
      return {
        success: true,
        data: {
          totalMembers: 0,
          totalReports: 0,
          totalHours: 0,
          avgHoursPerMember: 0,
          avgHoursPerWeek: 0,
          weeklyStats: [],
          memberStats: [],
          projectProgress: {
            total_cards: 0,
            completed_cards: 0,
            in_progress_cards: 0,
            completion_rate: 0,
          },
          recentActivity: [],
        },
      }
    }

    // 최근 N주간 날짜 계산
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - weeks * 7)

    // 주간보고 통계
    const { data: reports } = await supabase
      .from('weekly_reports')
      .select(
        `
        *,
        user:profiles!weekly_reports_user_id_fkey(id, email, username, avatar_url)
      `
      )
      .eq('board_id', boardId)
      .gte('week_start_date', startDate.toISOString().split('T')[0])
      .lte('week_start_date', endDate.toISOString().split('T')[0])
      .order('week_start_date', { ascending: false })

    // 전체 통계 계산
    const totalReports = reports?.length || 0
    const totalHours = reports?.reduce((sum, r) => sum + Number(r.total_hours || 0), 0) || 0
    const avgHoursPerMember = memberIds.size > 0 ? totalHours / memberIds.size : 0
    const uniqueWeeks = new Set(reports?.map((r) => r.week_start_date) || []).size
    const avgHoursPerWeek = uniqueWeeks > 0 ? totalHours / uniqueWeeks : 0

    // 주간별 통계
    const weeklyStatsMap = new Map<string, {
      week_start_date: string
      total_hours: number
      member_count: Set<string>
      report_count: number
      completed_cards: number
      in_progress_cards: number
    }>()

    reports?.forEach((report) => {
      const weekKey = report.week_start_date
      if (!weeklyStatsMap.has(weekKey)) {
        weeklyStatsMap.set(weekKey, {
          week_start_date: weekKey,
          total_hours: 0,
          member_count: new Set(),
          report_count: 0,
          completed_cards: 0,
          in_progress_cards: 0,
        })
      }
      const weekData = weeklyStatsMap.get(weekKey)!
      weekData.total_hours += Number(report.total_hours || 0)
      weekData.member_count.add(report.user_id)
      weekData.report_count += 1
      if (Array.isArray(report.completed_cards)) {
        weekData.completed_cards += report.completed_cards.length
      }
      if (Array.isArray(report.in_progress_cards)) {
        weekData.in_progress_cards += report.in_progress_cards.length
      }
    })

    const weeklyStats = Array.from(weeklyStatsMap.values())
      .map((w) => ({
        week_start_date: w.week_start_date,
        total_hours: w.total_hours,
        member_count: w.member_count.size,
        report_count: w.report_count,
        completed_cards: w.completed_cards,
        in_progress_cards: w.in_progress_cards,
      }))
      .sort((a, b) => new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime())

    // 멤버별 통계
    const memberStatsMap = new Map<string, {
      user_id: string
      username: string | null
      email: string
      avatar_url: string | null
      total_hours: number
      report_count: number
      completed_cards: number
      in_progress_cards: number
      last_report_date: string | null
    }>()

    // 프로필 정보 조회
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, username, avatar_url')
      .in('id', Array.from(memberIds))

    profiles?.forEach((profile) => {
      memberStatsMap.set(profile.id, {
        user_id: profile.id,
        username: profile.username,
        email: profile.email,
        avatar_url: profile.avatar_url,
        total_hours: 0,
        report_count: 0,
        completed_cards: 0,
        in_progress_cards: 0,
        last_report_date: null,
      })
    })

    reports?.forEach((report) => {
      const memberData = memberStatsMap.get(report.user_id)
      if (memberData) {
        memberData.total_hours += Number(report.total_hours || 0)
        memberData.report_count += 1
        if (Array.isArray(report.completed_cards)) {
          memberData.completed_cards += report.completed_cards.length
        }
        if (Array.isArray(report.in_progress_cards)) {
          memberData.in_progress_cards += report.in_progress_cards.length
        }
        if (!memberData.last_report_date || report.week_start_date > memberData.last_report_date) {
          memberData.last_report_date = report.week_start_date
        }
      }
    })

    const memberStats = Array.from(memberStatsMap.values())
      .map((m) => ({
        ...m,
        avg_hours_per_week: m.report_count > 0 ? m.total_hours / m.report_count : 0,
      }))
      .sort((a, b) => b.total_hours - a.total_hours)

    // 프로젝트 진행률 (카드 통계)
    const { data: lists } = await supabase
      .from('lists')
      .select('id')
      .eq('board_id', boardId)

    const listIds = lists?.map((l) => l.id) || []
    let totalCards = 0
    let completedCards = 0
    let inProgressCards = 0

    if (listIds.length > 0) {
      const { count: total } = await supabase
        .from('cards')
        .select('id', { count: 'exact', head: true })
        .in('list_id', listIds)

      const { count: completed } = await supabase
        .from('cards')
        .select('id', { count: 'exact', head: true })
        .in('list_id', listIds)
        .eq('is_completed', true)

      const { count: inProgress } = await supabase
        .from('cards')
        .select('id', { count: 'exact', head: true })
        .in('list_id', listIds)
        .eq('is_completed', false)

      totalCards = total || 0
      completedCards = completed || 0
      inProgressCards = inProgress || 0
    }

    const projectProgress = {
      total_cards: totalCards,
      completed_cards: completedCards,
      in_progress_cards: inProgressCards,
      completion_rate: totalCards > 0 ? (completedCards / totalCards) * 100 : 0,
    }

    // 최근 활동
    const recentActivity: TeamDashboardStats['recentActivity'] = []
    
    // 최근 제출된 보고서
    const recentReports = reports
      ?.filter((r) => r.status === 'submitted')
      .slice(0, 10)
      .map((r) => ({
        type: 'report_submitted' as const,
        user_id: r.user_id,
        username: (r as any).user?.username || null,
        email: (r as any).user?.email || '',
        description: `${r.week_start_date} 주간보고 제출`,
        date: r.updated_at || r.created_at,
      })) || []

    recentActivity.push(...recentReports)

    // 최근 활동 정렬
    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const limitedRecentActivity = recentActivity.slice(0, 20)

    return {
      success: true,
      data: {
        totalMembers: memberIds.size,
        totalReports,
        totalHours,
        avgHoursPerMember,
        avgHoursPerWeek,
        weeklyStats,
        memberStats,
        projectProgress,
        recentActivity: limitedRecentActivity,
      },
    }
  } catch (error) {
    console.error('팀 대시보드 통계 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
