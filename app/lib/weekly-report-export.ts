import jsPDF from 'jspdf'
import type { WeeklyReport } from '@/app/actions/weekly-report'
import type { Board } from '@/types'

// PDF 생성
export function generateWeeklyReportPDF(
  board: Board | null,
  reports: WeeklyReport[],
  weekStartDate: string,
  weekEndDate: string
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // 헤더
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  if (board) {
    doc.text(`${board.emoji || '📋'} ${board.title} - 주간보고`, margin, yPos)
  } else {
    doc.text('주간보고 공유', margin, yPos)
  }
  yPos += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const weekText = `${new Date(weekStartDate).toLocaleDateString('ko-KR')} ~ ${new Date(weekEndDate).toLocaleDateString('ko-KR')}`
  doc.text(weekText, margin, yPos)
  yPos += 15

  // 각 사용자별 보고서
  for (const report of reports) {
    // 페이지 체크
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = margin
    }

    const user = (report as any).user
    const userName = user?.username || user?.email?.split('@')[0] || '익명'

    // 사용자 헤더
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(userName, margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`작업 시간: ${report.total_hours}시간`, margin, yPos)
    doc.text(`상태: ${report.status === 'submitted' ? '제출 완료' : '작성 중'}`, margin + 80, yPos)
    yPos += 10

    // 완료된 작업
    if (report.completed_cards && report.completed_cards.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`완료된 작업 (${report.completed_cards.length}개)`, margin, yPos)
      yPos += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      for (const card of report.completed_cards.slice(0, 10)) {
        if (yPos > pageHeight - 20) {
          doc.addPage()
          yPos = margin
        }
        doc.text(`• ${card.title}`, margin + 5, yPos)
        yPos += 6
      }
      if (report.completed_cards.length > 10) {
        doc.text(`... 외 ${report.completed_cards.length - 10}개`, margin + 5, yPos)
        yPos += 6
      }
      yPos += 5
    }

    // 진행 중인 작업
    if (report.in_progress_cards && report.in_progress_cards.length > 0) {
      if (yPos > pageHeight - 40) {
        doc.addPage()
        yPos = margin
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`진행 중인 작업 (${report.in_progress_cards.length}개)`, margin, yPos)
      yPos += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      for (const card of report.in_progress_cards.slice(0, 10)) {
        if (yPos > pageHeight - 20) {
          doc.addPage()
          yPos = margin
        }

        const progress = card.user_input?.progress || card.auto_collected?.checklist_progress || 0
        const status = card.user_input?.status || '진행중'

        doc.text(`• ${card.title} [${status}] - ${progress}%`, margin + 5, yPos)
        yPos += 6

        if (card.user_input?.description) {
          const desc = doc.splitTextToSize(`  ${card.user_input.description}`, pageWidth - margin * 2 - 10)
          doc.setFontSize(9)
          doc.text(desc, margin + 10, yPos)
          yPos += desc.length * 5
          doc.setFontSize(10)
        }

        if (card.user_input?.issues) {
          const issues = doc.splitTextToSize(`  ⚠️ ${card.user_input.issues}`, pageWidth - margin * 2 - 10)
          doc.setFontSize(9)
          doc.setTextColor(255, 0, 0)
          doc.text(issues, margin + 10, yPos)
          yPos += issues.length * 5
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(10)
        }
        yPos += 3
      }
      if (report.in_progress_cards.length > 10) {
        doc.text(`... 외 ${report.in_progress_cards.length - 10}개`, margin + 5, yPos)
        yPos += 6
      }
      yPos += 5
    }

    // 추가 메모
    if (report.notes) {
      if (yPos > pageHeight - 30) {
        doc.addPage()
        yPos = margin
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('추가 메모', margin, yPos)
      yPos += 7

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const notes = doc.splitTextToSize(report.notes, pageWidth - margin * 2)
      doc.text(notes, margin, yPos)
      yPos += notes.length * 5 + 10
    }

    // 구분선
    if (yPos < pageHeight - 20) {
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 10
    }
  }

  // 파일명 생성
  const fileName = board ? `${board.title}_주간보고_${weekStartDate}.pdf` : `주간보고_공유_${weekStartDate}.pdf`
  doc.save(fileName)
}

// CSV 생성
export function generateWeeklyReportCSV(
  board: Board | null,
  reports: WeeklyReport[],
  weekStartDate: string,
  weekEndDate: string
): void {
  const rows: string[] = []

  // 헤더
  if (board) {
    rows.push(`보드,${board.title}`)
  } else {
    rows.push('보드,전체')
  }
  rows.push(`기간,${weekStartDate} ~ ${weekEndDate}`)
  rows.push('')

  // 각 사용자별 데이터
  for (const report of reports) {
    const user = (report as any).user
    const userName = user?.username || user?.email?.split('@')[0] || '익명'

    rows.push(`사용자,${userName}`)
    rows.push(`작업 시간,${report.total_hours}시간`)
    rows.push(`상태,${report.status === 'submitted' ? '제출 완료' : '작성 중'}`)
    rows.push('')

    // 완료된 작업
    if (report.completed_cards && report.completed_cards.length > 0) {
      rows.push('완료된 작업')
      rows.push('제목,리스트')
      for (const card of report.completed_cards) {
        const title = (card.title || '').replace(/,/g, '，')
        const listTitle = (card.list_title || '').replace(/,/g, '，')
        rows.push(`${title},${listTitle}`)
      }
      rows.push('')
    }

    // 진행 중인 작업
    if (report.in_progress_cards && report.in_progress_cards.length > 0) {
      rows.push('진행 중인 작업')
      rows.push('제목,상태,진척도,설명,이슈')
      for (const card of report.in_progress_cards) {
        const title = (card.title || '').replace(/,/g, '，')
        const status = (card.user_input?.status || '진행중').replace(/,/g, '，')
        const progress = card.user_input?.progress || card.auto_collected?.checklist_progress || 0
        const description = (card.user_input?.description || '').replace(/,/g, '，').replace(/\n/g, ' ')
        const issues = (card.user_input?.issues || '').replace(/,/g, '，').replace(/\n/g, ' ')
        rows.push(`${title},${status},${progress}%,${description},${issues}`)
      }
      rows.push('')
    }

    // 추가 메모
    if (report.notes) {
      rows.push('추가 메모')
      rows.push(report.notes.replace(/,/g, '，').replace(/\n/g, ' '))
      rows.push('')
    }

    rows.push('---')
    rows.push('')
  }

  // BOM 추가 (한글 깨짐 방지)
  const csvContent = '\uFEFF' + rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  const fileName = board 
    ? `${board.title}_주간보고_${weekStartDate}.csv`
    : `주간보고_공유_${weekStartDate}.csv`
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
