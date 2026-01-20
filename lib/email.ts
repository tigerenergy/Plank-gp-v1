import { Resend } from 'resend'

// Resend 클라이언트 (서버 사이드에서만 사용)
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

// 마크다운을 HTML로 변환 (향상된 버전)
function markdownToHtml(markdown: string): string {
  return markdown
    // 이모지 강조 헤더 (📋, ✅ 등으로 시작하는 헤더)
    .replace(/^## (📋|✅|📊|💡|🎯|⚠️|🔥|✨) (.*$)/gm, `
      <div style="margin: 28px 0 16px; padding: 16px 20px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 12px; border-left: 4px solid #8b5cf6;">
        <h2 style="margin: 0; color: #5b21b6; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 22px;">$1</span> $2
        </h2>
      </div>
    `)
    // 일반 헤더
    .replace(/^### (.*$)/gm, '<h3 style="margin: 20px 0 10px; color: #374151; font-size: 16px; font-weight: 600; padding-bottom: 8px; border-bottom: 2px solid #e9d5ff;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="margin: 24px 0 12px; color: #1f2937; font-size: 18px; font-weight: 700;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="margin: 28px 0 14px; color: #111827; font-size: 22px; font-weight: 800;">$1</h1>')
    // 굵은 글씨
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937; font-weight: 600;">$1</strong>')
    // 기울임
    .replace(/\*(.*?)\*/g, '<em style="color: #6b7280;">$1</em>')
    // 체크리스트
    .replace(/^- \[x\] (.*$)/gm, '<div style="display: flex; align-items: flex-start; gap: 10px; margin: 8px 0; padding: 10px 14px; background: #f0fdf4; border-radius: 8px;"><span style="color: #22c55e; font-size: 16px;">✓</span><span style="color: #166534;">$1</span></div>')
    .replace(/^- \[ \] (.*$)/gm, '<div style="display: flex; align-items: flex-start; gap: 10px; margin: 8px 0; padding: 10px 14px; background: #fafafa; border-radius: 8px;"><span style="color: #d1d5db; font-size: 16px;">○</span><span style="color: #6b7280;">$1</span></div>')
    // 일반 리스트
    .replace(/^\- (.*$)/gm, '<li style="margin: 6px 0; padding: 4px 0; color: #374151;">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin: 12px 0; padding-left: 24px; list-style-type: none;">$&</ul>')
    // 번호 리스트
    .replace(/^\d+\. (.*$)/gm, '<li style="margin: 6px 0; padding: 4px 0; color: #374151;">$1</li>')
    // 수평선
    .replace(/^---$/gm, '<hr style="margin: 24px 0; border: none; border-top: 2px solid #e9d5ff;"/>')
    // 인용구
    .replace(/^> (.*$)/gm, '<blockquote style="margin: 16px 0; padding: 12px 20px; background: #faf5ff; border-left: 4px solid #8b5cf6; color: #6b7280; font-style: italic; border-radius: 0 8px 8px 0;">$1</blockquote>')
    // 줄바꿈
    .replace(/\n\n/g, '</p><p style="margin: 14px 0; color: #374151; line-height: 1.7;">')
    .replace(/\n/g, '<br/>')
    // 코드 블록
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, '').replace(/```/g, '')
      return `<pre style="background: #1f2937; color: #e5e7eb; padding: 16px 20px; border-radius: 12px; overflow-x: auto; font-size: 13px; font-family: 'Fira Code', monospace; margin: 16px 0;"><code>${code}</code></pre>`
    })
    // 인라인 코드
    .replace(/`(.*?)`/g, '<code style="background: #f3e8ff; color: #7c3aed; padding: 3px 8px; border-radius: 6px; font-size: 13px; font-family: monospace;">$1</code>')
}

// 이메일 템플릿 생성
function createEmailTemplate(input: {
  title: string
  content: string
  boardTitle: string
  periodLabel: string
  senderName?: string
  generatedAt?: string
}): string {
  const htmlContent = markdownToHtml(input.content)
  const currentDate = input.generatedAt || new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f3ff;">
  <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- 로고 & 브랜딩 -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 28px; font-weight: 800; color: #7c3aed; letter-spacing: -1px;">Plank</span>
      <span style="display: block; font-size: 11px; color: #a78bfa; margin-top: 4px; letter-spacing: 2px;">PROJECT REPORT</span>
    </div>

    <!-- 메인 카드 -->
    <div style="background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.15);">
      
      <!-- 헤더 그라데이션 -->
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%); padding: 40px 32px; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
        <div style="position: relative; z-index: 1;">
          <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-size: 12px; color: white; margin-bottom: 16px;">
            📊 ${input.periodLabel} 보고서
          </div>
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; line-height: 1.3;">
            ${input.boardTitle}
          </h1>
          <p style="margin: 12px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
            ${currentDate} 생성
          </p>
        </div>
      </div>

      <!-- 보고서 요약 배지 -->
      <div style="padding: 24px 32px; background: linear-gradient(180deg, #f5f3ff 0%, white 100%); border-bottom: 1px solid #e9d5ff;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 120px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);">
            <div style="font-size: 11px; color: #8b5cf6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">보고서 유형</div>
            <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-top: 4px;">${input.periodLabel}</div>
          </div>
          <div style="flex: 1; min-width: 120px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);">
            <div style="font-size: 11px; color: #8b5cf6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">프로젝트</div>
            <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-top: 4px;">${input.boardTitle}</div>
          </div>
        </div>
      </div>

      <!-- 본문 컨텐츠 -->
      <div style="padding: 32px;">
        <div style="color: #374151; font-size: 15px; line-height: 1.8;">
          ${htmlContent}
        </div>
      </div>

      <!-- 하단 CTA -->
      <div style="padding: 24px 32px; background: #faf5ff; border-top: 1px solid #e9d5ff; text-align: center;">
        <p style="margin: 0 0 16px; color: #6b7280; font-size: 13px;">
          더 자세한 내용은 Plank에서 확인하세요
        </p>
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
          Plank에서 보기 →
        </a>
      </div>
    </div>

    <!-- 푸터 -->
    <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
      <div style="display: inline-flex; align-items: center; gap: 8px; color: #8b5cf6; font-size: 14px; font-weight: 600; margin-bottom: 12px;">
        <span>✨</span>
        <span>Plank</span>
      </div>
      <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px;">
        AI 기반 스마트 프로젝트 관리 플랫폼
      </p>
      <p style="margin: 0; color: #d1d5db; font-size: 11px;">
        이 이메일은 Plank에서 자동으로 생성되었습니다.
      </p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <span style="color: #d1d5db; font-size: 11px;">© ${new Date().getFullYear()} Plank. All rights reserved.</span>
      </div>
    </div>

  </div>
</body>
</html>
`
}

// 보고서 이메일 발송
export async function sendReportEmail(input: {
  to: string[]
  title: string
  content: string
  boardTitle: string
  periodLabel: string
}): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY가 설정되지 않았습니다.' }
  }

  try {
    const html = createEmailTemplate({
      title: input.title,
      content: input.content,
      boardTitle: input.boardTitle,
      periodLabel: input.periodLabel,
    })

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Plank <onboarding@resend.dev>',
      to: input.to,
      subject: `📋 ${input.title}`,
      html,
    })

    if (error) {
      console.error('Resend 에러:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('이메일 발송 에러:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '이메일 발송에 실패했습니다.',
    }
  }
}
