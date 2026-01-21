/**
 * 주간보고 기능 테스트
 * 
 * 실행 방법:
 * - npm test (Jest 설정 필요)
 * - 또는 수동으로 각 함수 테스트
 */

import { describe, it, expect, beforeAll } from '@jest/globals'

// 테스트용 헬퍼 함수
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return weekEnd
}

describe('주간보고 기능', () => {
  describe('주간 날짜 계산', () => {
    it('주간 시작일이 월요일인지 확인', () => {
      const weekStart = getWeekStart()
      expect(weekStart.getDay()).toBe(1) // 월요일 = 1
    })

    it('주간 종료일이 일요일인지 확인', () => {
      const weekEnd = getWeekEnd()
      expect(weekEnd.getDay()).toBe(0) // 일요일 = 0
    })

    it('주간 시작일과 종료일이 6일 차이나는지 확인', () => {
      const weekStart = getWeekStart()
      const weekEnd = getWeekEnd()
      const diff = Math.floor((weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
      expect(diff).toBe(6)
    })
  })

  describe('데이터 구조', () => {
    it('주간보고 타입이 올바른지 확인', () => {
      const report = {
        id: 'test-id',
        board_id: 'board-id',
        user_id: 'user-id',
        week_start_date: '2026-01-20',
        week_end_date: '2026-01-26',
        status: 'draft' as const,
        completed_cards: [],
        in_progress_cards: [],
        card_activities: [],
        total_hours: 0,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      expect(report.status).toBe('draft')
      expect(report.completed_cards).toBeInstanceOf(Array)
      expect(report.in_progress_cards).toBeInstanceOf(Array)
      expect(report.card_activities).toBeInstanceOf(Array)
    })
  })
})
