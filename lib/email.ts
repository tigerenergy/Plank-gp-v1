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

// 이메일 템플릿 생성
function createEmailTemplate(input: {
  title: string
  content: string
  boardTitle: string
  periodLabel: string
  boardUrl?: string
  senderName?: string
  generatedAt?: string
}): string {
  const htmlContent = markdownToHtml(input.content)
  const currentDate = input.generatedAt || new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const boardUrl = input.boardUrl || '#'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  
  <!-- 전체 컨테이너 -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 48px 24px;">
        
        <!-- 메인 컨텐츠 -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px;">
          
          <!-- 상단 라인 -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%); border-radius: 4px;"></td>
          </tr>
          
          <!-- 헤더 -->
          <tr>
            <td style="padding: 40px 0 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 6px 12px; background: #f3f4f6; border-radius: 6px; font-size: 12px; font-weight: 600; color: #6b7280; letter-spacing: 0.5px;">
                      ${input.periodLabel.toUpperCase()} 보고서
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; line-height: 1.3;">
                      ${input.boardTitle}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 8px;">
                    <span style="font-size: 14px; color: #9ca3af;">${currentDate}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- 구분선 -->
          <tr>
            <td style="height: 1px; background: #e5e7eb;"></td>
          </tr>
          
          <!-- 본문 -->
          <tr>
            <td style="padding: 32px 0;">
              <div style="color: #374151; font-size: 15px; line-height: 1.75;">
                ${htmlContent}
              </div>
            </td>
          </tr>
          
          <!-- 구분선 -->
          <tr>
            <td style="height: 1px; background: #e5e7eb;"></td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px 0; text-align: center;">
              <a href="${boardUrl}" style="display: inline-block; padding: 14px 32px; background: #111827; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                프로젝트 열기 →
              </a>
            </td>
          </tr>
          
          <!-- 푸터 -->
          <tr>
            <td style="padding: 32px 0 0; border-top: 1px solid #e5e7eb;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #9ca3af;">
                      이 보고서는 <strong style="color: #6b7280;">Plank</strong>에서 AI로 생성되었습니다.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #d1d5db;">
                      © ${new Date().getFullYear()} Plank
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
`
}

// 보고서 이메일 발송
export async function sendReportEmail(input: {
  to: string[]
  title: string
  content: string
  boardId: string
  boardTitle: string
  periodLabel: string
}): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY가 설정되지 않았습니다.' }
  }

  try {
    // 보드 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const boardUrl = `${baseUrl}/board/${input.boardId}`

    const html = createEmailTemplate({
      title: input.title,
      content: input.content,
      boardTitle: input.boardTitle,
      periodLabel: input.periodLabel,
      boardUrl,
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
