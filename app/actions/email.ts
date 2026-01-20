'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'
import { sendReportEmail } from '@/lib/email'

// 이메일 발송 로그 타입
export interface EmailLog {
  id: string
  report_id: string | null
  recipients: string[]
  subject: string
  status: 'sent' | 'failed' | 'pending'
  sent_at: string
  sent_by: string | null
}

// 보고서 이메일 발송
export async function sendReportToEmail(input: {
  reportId: string
  recipients: string[]
  boardId: string
  boardTitle: string
}): Promise<ActionResult<{ emailId?: string }>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = input.recipients.filter((email) => !emailRegex.test(email.trim()))
    if (invalidEmails.length > 0) {
      return { success: false, error: `잘못된 이메일 형식: ${invalidEmails.join(', ')}` }
    }

    // 보고서 조회
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', input.reportId)
      .single()

    if (reportError || !report) {
      return { success: false, error: '보고서를 찾을 수 없습니다.' }
    }

    // 보고서 유형에 따른 라벨
    const periodLabel = report.report_type === 'weekly' 
      ? '주간' 
      : report.report_type === 'monthly' 
        ? '월간' 
        : '커스텀'

    // 이메일 발송
    const result = await sendReportEmail({
      to: input.recipients.map((e) => e.trim()),
      title: report.title,
      content: report.content,
      boardId: input.boardId,
      boardTitle: input.boardTitle,
      periodLabel,
    })

    // 발송 기록 저장
    const { error: logError } = await supabase.from('email_logs').insert({
      report_id: input.reportId,
      recipients: input.recipients.map((e) => e.trim()),
      subject: report.title,
      status: result.success ? 'sent' : 'failed',
      sent_by: user.id,
    })

    if (logError) {
      console.error('이메일 로그 저장 에러:', logError)
      // 로그 저장 실패해도 이메일은 발송됨
    }

    if (!result.success) {
      return { success: false, error: result.error || '이메일 발송에 실패했습니다.' }
    }

    return { success: true, data: { emailId: result.id } }
  } catch (error) {
    console.error('이메일 발송 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}

// 이메일 발송 기록 조회
export async function getEmailLogs(boardId: string): Promise<ActionResult<EmailLog[]>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 해당 보드의 보고서들에 대한 이메일 로그 조회
    const { data: reports } = await supabase
      .from('reports')
      .select('id')
      .eq('board_id', boardId)

    if (!reports || reports.length === 0) {
      return { success: true, data: [] }
    }

    const reportIds = reports.map((r) => r.id)

    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .in('report_id', reportIds)
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('이메일 로그 조회 에러:', error)
      return { success: false, error: '이메일 기록을 조회할 수 없습니다.' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('이메일 로그 조회 에러:', error)
    return { success: false, error: '서버 연결에 실패했습니다.' }
  }
}
