import { Resend } from 'resend'

// Resend 클라이언트 (서버 사이드에서만 사용)
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

// 마크다운을 HTML로 변환 (간단한 버전)
function markdownToHtml(markdown: string): string {
  return markdown
    // 헤더
    .replace(/^### (.*$)/gm, '<h3 style="margin: 16px 0 8px; color: #1f2937;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="margin: 20px 0 10px; color: #1f2937;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="margin: 24px 0 12px; color: #1f2937;">$1</h1>')
    // 굵은 글씨
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 기울임
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 리스트
    .replace(/^\- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin: 8px 0; padding-left: 20px;">$&</ul>')
    // 줄바꿈
    .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
    .replace(/\n/g, '<br/>')
    // 코드 블록
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, '').replace(/```/g, '')
      return `<pre style="background: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px;"><code>${code}</code></pre>`
    })
    // 인라인 코드
    .replace(/`(.*?)`/g, '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px;">$1</code>')
}

// 이메일 템플릿 생성
function createEmailTemplate(input: {
  title: string
  content: string
  boardTitle: string
  periodLabel: string
}): string {
  const htmlContent = markdownToHtml(input.content)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
    <!-- 헤더 -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
        📋 ${input.boardTitle}
      </h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
        ${input.periodLabel} 보고서
      </p>
    </div>

    <!-- 본문 -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="color: #374151; font-size: 15px; line-height: 1.7;">
        <p style="margin: 12px 0;">${htmlContent}</p>
      </div>
    </div>

    <!-- 푸터 -->
    <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">
        Powered by <strong style="color: #8b5cf6;">Plank</strong> - AI 기반 프로젝트 관리
      </p>
      <p style="margin: 8px 0 0;">
        이 이메일은 자동으로 생성되었습니다.
      </p>
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
