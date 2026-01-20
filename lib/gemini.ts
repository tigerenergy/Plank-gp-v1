import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini API 클라이언트 (서버 사이드에서만 사용)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ReportCard {
  title: string
  description?: string | null
  completed_at: string | null
  completer_name?: string
  list_title?: string
}

export type ReportType = 'weekly' | 'monthly' | 'custom'

// 보고서 생성
export async function generateReport(
  cards: ReportCard[],
  boardTitle: string,
  reportType: ReportType = 'weekly',
  periodLabel: string = '이번 주'
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const cardList = cards
    .map((c, i) => {
      const completedDate = c.completed_at
        ? new Date(c.completed_at).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })
        : '날짜 없음'

      return `${i + 1}. **${c.title}**
   - 설명: ${c.description || '없음'}
   - 완료일: ${completedDate}
   - 담당자: ${c.completer_name || '미지정'}
   - 리스트: ${c.list_title || '알 수 없음'}`
    })
    .join('\n\n')

  const prompt = `당신은 전문 프로젝트 매니저입니다. 아래 완료된 작업 목록을 바탕으로 ${reportType === 'weekly' ? '주간' : reportType === 'monthly' ? '월간' : ''} 보고서를 작성해주세요.

## 프로젝트 정보
- **보드명**: ${boardTitle}
- **기간**: ${periodLabel}
- **완료된 작업 수**: ${cards.length}개

## 완료된 작업 목록
${cardList || '완료된 작업이 없습니다.'}

---

## 요청사항
위 내용을 바탕으로 전문적이고 간결한 보고서를 마크다운 형식으로 작성해주세요.

**보고서 구조:**
1. **📋 요약** (3줄 이내로 핵심 내용 정리)
2. **✅ 주요 완료 항목** (카테고리별로 그룹화하여 정리)
3. **📊 성과 분석** (완료된 작업의 의미와 진행 상황 분석)
4. **💡 특이사항 및 제안** (있다면)

**작성 시 주의사항:**
- 한국어로 작성
- 전문적이면서도 읽기 쉽게
- 이모지를 적절히 활용
- 불필요한 내용은 생략
- 완료된 작업이 없으면 그에 맞게 작성`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    if (!text) {
      throw new Error('AI 응답이 비어있습니다.')
    }

    return text
  } catch (error) {
    console.error('Gemini API 에러:', error)
    throw new Error('AI 보고서 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
  }
}

// 보고서 제목 생성
export function generateReportTitle(boardTitle: string, reportType: ReportType): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  switch (reportType) {
    case 'weekly':
      return `[주간보고] ${boardTitle} - ${dateStr}`
    case 'monthly':
      return `[월간보고] ${boardTitle} - ${now.getFullYear()}년 ${now.getMonth() + 1}월`
    default:
      return `[보고서] ${boardTitle} - ${dateStr}`
  }
}
