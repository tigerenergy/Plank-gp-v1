import { Resend } from 'resend'

// Resend 클라이언트 (서버 사이드에서만 사용)
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

// 마크다운을 HTML로 변환 (미니멀 버전)
function markdownToHtml(markdown: string): string {
  return markdown
    // 이모지 섹션 헤더
    .replace(/^## (📋|✅|📊|💡|🎯|⚠️|🔥|✨) (.*$)/gm, 
      '<h2 style="margin: 32px 0 16px; font-size: 18px; font-weight: 700; color: #111827;">$1 $2</h2>')
    // 일반 헤더
    .replace(/^### (.*$)/gm, '<h3 style="margin: 24px 0 12px; font-size: 15px; font-weight: 600; color: #374151;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="margin: 28px 0 14px; font-size: 17px; font-weight: 700; color: #1f2937;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="margin: 32px 0 16px; font-size: 20px; font-weight: 700; color: #111827;">$1</h1>')
    // 굵은 글씨
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #111827;">$1</strong>')
    // 기울임
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 체크리스트
    .replace(/^- \[x\] (.*$)/gm, '<div style="margin: 8px 0; padding: 12px 16px; background: #f0fdf4; border-radius: 8px; border-left: 3px solid #22c55e;"><span style="color: #166534;">✓ $1</span></div>')
    .replace(/^- \[ \] (.*$)/gm, '<div style="margin: 8px 0; padding: 12px 16px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #d1d5db;"><span style="color: #6b7280;">○ $1</span></div>')
    // 일반 리스트
    .replace(/^\- (.*$)/gm, '<div style="margin: 6px 0; padding-left: 16px; position: relative;"><span style="position: absolute; left: 0; color: #9ca3af;">•</span>$1</div>')
    // 수평선
    .replace(/^---$/gm, '<hr style="margin: 24px 0; border: none; height: 1px; background: #e5e7eb;"/>')
    // 인용구
    .replace(/^> (.*$)/gm, '<div style="margin: 16px 0; padding: 16px 20px; background: #f9fafb; border-left: 3px solid #8b5cf6; color: #6b7280; font-style: italic;">$1</div>')
    // 줄바꿈
    .replace(/\n\n/g, '</p><p style="margin: 16px 0;">')
    .replace(/\n/g, '<br/>')
    // 코드 블록
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, '').replace(/```/g, '')
      return `<pre style="margin: 16px 0; padding: 16px; background: #1f2937; color: #f3f4f6; border-radius: 8px; font-size: 13px; font-family: monospace; overflow-x: auto;"><code>${code}</code></pre>`
    })
    // 인라인 코드
    .replace(/`(.*?)`/g, '<code style="padding: 2px 6px; background: #f3f4f6; border-radius: 4px; font-size: 13px; font-family: monospace;">$1</code>')
}

// lib/email.ts는 현재 사용되지 않음
// 보드 초대 이메일 기능이 필요하면 나중에 추가
