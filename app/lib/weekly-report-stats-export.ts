import jsPDF from 'jspdf'
import type { Board } from '@/types'
import type { WeeklyHoursTrend, CompletionTrend, TeamHoursComparison } from '@/app/actions/weekly-report-stats'

// 통계 PDF 생성
export function generateStatsPDF(
  board: Board,
  hoursTrend: WeeklyHoursTrend[],
  completionTrend: CompletionTrend[],
  teamComparison: TeamHoursComparison[]
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // 헤더
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(`${board.emoji || '📋'} ${board.title} - 주간보고 통계`, margin, yPos)
  yPos += 15

  // 요약 정보
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('요약', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const totalHours = teamComparison.reduce((sum, item) => sum + item.total_hours, 0)
  const totalCompleted = completionTrend.reduce((sum, item) => sum + item.completed_count, 0)
  doc.text(`총 작업 시간: ${totalHours.toFixed(1)}시간`, margin, yPos)
  yPos += 6
  doc.text(`총 완료 작업: ${totalCompleted}개`, margin, yPos)
  yPos += 6
  doc.text(`활성 팀원: ${teamComparison.length}명`, margin, yPos)
  yPos += 15

  // 주간별 작업 시간 추이
  if (hoursTrend.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = margin
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('주간별 작업 시간 추이', margin, yPos)
    yPos += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('주간', margin, yPos)
    doc.text('총 시간', margin + 50, yPos)
    doc.text('인원', margin + 90, yPos)
    yPos += 6

    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 5

    for (const item of hoursTrend) {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = margin
      }

      const weekLabel = new Date(item.week_start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      doc.text(weekLabel, margin, yPos)
      doc.text(`${item.total_hours.toFixed(1)}시간`, margin + 50, yPos)
      doc.text(`${item.user_count}명`, margin + 90, yPos)
      yPos += 6
    }
    yPos += 10
  }

  // 완료된 작업 수 추이
  if (completionTrend.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = margin
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('완료된 작업 수 추이', margin, yPos)
    yPos += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('주간', margin, yPos)
    doc.text('완료', margin + 50, yPos)
    doc.text('진행중', margin + 80, yPos)
    yPos += 6

    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 5

    for (const item of completionTrend) {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = margin
      }

      const weekLabel = new Date(item.week_start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      doc.text(weekLabel, margin, yPos)
      doc.text(`${item.completed_count}개`, margin + 50, yPos)
      doc.text(`${item.in_progress_count}개`, margin + 80, yPos)
      yPos += 6
    }
    yPos += 10
  }

  // 팀원별 작업 시간 비교
  if (teamComparison.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = margin
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('팀원별 작업 시간 비교', margin, yPos)
    yPos += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('팀원', margin, yPos)
    doc.text('총 시간', margin + 60, yPos)
    doc.text('보고서 수', margin + 100, yPos)
    yPos += 6

    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 5

    for (const item of teamComparison) {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = margin
      }

      const userName = item.username || item.email.split('@')[0] || '익명'
      doc.text(userName, margin, yPos)
      doc.text(`${item.total_hours.toFixed(1)}시간`, margin + 60, yPos)
      doc.text(`${item.report_count}개`, margin + 100, yPos)
      yPos += 6
    }
  }

  // 파일명 생성
  const fileName = `${board.title}_주간보고통계_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// 통계 CSV 생성
export function generateStatsCSV(
  board: Board,
  hoursTrend: WeeklyHoursTrend[],
  completionTrend: CompletionTrend[],
  teamComparison: TeamHoursComparison[]
): void {
  const rows: string[] = []

  rows.push(`보드,${board.title}`)
  rows.push(`생성일,${new Date().toLocaleDateString('ko-KR')}`)
  rows.push('')

  // 요약
  const totalHours = teamComparison.reduce((sum, item) => sum + item.total_hours, 0)
  const totalCompleted = completionTrend.reduce((sum, item) => sum + item.completed_count, 0)
  rows.push('요약')
  rows.push(`총 작업 시간,${totalHours.toFixed(1)}시간`)
  rows.push(`총 완료 작업,${totalCompleted}개`)
  rows.push(`활성 팀원,${teamComparison.length}명`)
  rows.push('')

  // 주간별 작업 시간 추이
  if (hoursTrend.length > 0) {
    rows.push('주간별 작업 시간 추이')
    rows.push('주간,총 시간,인원')
    for (const item of hoursTrend) {
      const weekLabel = `${item.week_start_date} ~ ${item.week_end_date}`
      rows.push(`${weekLabel},${item.total_hours.toFixed(1)},${item.user_count}`)
    }
    rows.push('')
  }

  // 완료된 작업 수 추이
  if (completionTrend.length > 0) {
    rows.push('완료된 작업 수 추이')
    rows.push('주간,완료,진행중')
    for (const item of completionTrend) {
      const weekLabel = `${item.week_start_date} ~ ${item.week_end_date}`
      rows.push(`${weekLabel},${item.completed_count},${item.in_progress_count}`)
    }
    rows.push('')
  }

  // 팀원별 작업 시간 비교
  if (teamComparison.length > 0) {
    rows.push('팀원별 작업 시간 비교')
    rows.push('팀원,총 시간,보고서 수')
    for (const item of teamComparison) {
      const userName = (item.username || item.email.split('@')[0] || '익명').replace(/,/g, '，')
      rows.push(`${userName},${item.total_hours.toFixed(1)},${item.report_count}`)
    }
  }

  // BOM 추가 (한글 깨짐 방지)
  const csvContent = '\uFEFF' + rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${board.title}_주간보고통계_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
