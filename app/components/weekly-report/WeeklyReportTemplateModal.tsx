'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, FileText, Star } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getWeeklyReportTemplates,
  createWeeklyReportTemplate,
  updateWeeklyReportTemplate,
  deleteWeeklyReportTemplate,
  type WeeklyReportTemplate,
} from '@/app/actions/weekly-report-template'
import { fadeIn, slideUp, zoomIn, easeTransition } from '@/lib/animations'

interface WeeklyReportTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  boardId: string
  onSelectTemplate: (template: WeeklyReportTemplate) => void
  onSaveAsTemplate?: (data: {
    name: string
    description?: string
    template_data: WeeklyReportTemplate['template_data']
  }) => void
}

export function WeeklyReportTemplateModal({
  isOpen,
  onClose,
  boardId,
  onSelectTemplate,
  onSaveAsTemplate,
}: WeeklyReportTemplateModalProps) {
  const [templates, setTemplates] = useState<WeeklyReportTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false,
  })

  // 템플릿 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, boardId])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const result = await getWeeklyReportTemplates(boardId)
      if (result.success) {
        setTemplates(result.data || [])
      } else {
        toast.error(result.error || '템플릿을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('템플릿 로드 에러:', error)
      toast.error('템플릿을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 템플릿 생성
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('템플릿 이름을 입력해주세요.')
      return
    }

    setIsCreating(true)
    try {
      const result = await createWeeklyReportTemplate({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        board_id: boardId,
        is_default: formData.is_default,
        template_data: {}, // 빈 템플릿으로 시작 (나중에 현재 보고서를 저장할 때 채움)
      })

      if (result.success) {
        toast.success('템플릿이 생성되었습니다.')
        setFormData({ name: '', description: '', is_default: false })
        setShowCreateForm(false)
        loadTemplates()
        // onSaveAsTemplate이 제공된 경우 호출
        if (onSaveAsTemplate && result.data) {
          onSaveAsTemplate({
            name: result.data.name,
            description: result.data.description || undefined,
            template_data: result.data.template_data,
          })
        }
      } else {
        toast.error(result.error || '템플릿 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('템플릿 생성 에러:', error)
      toast.error('템플릿 생성 중 오류가 발생했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  // 템플릿 삭제
  const handleDelete = async (templateId: string) => {
    if (!confirm('이 템플릿을 삭제하시겠습니까?')) return

    try {
      const result = await deleteWeeklyReportTemplate(templateId)
      if (result.success) {
        toast.success('템플릿이 삭제되었습니다.')
        loadTemplates()
      } else {
        toast.error(result.error || '템플릿 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('템플릿 삭제 에러:', error)
      toast.error('템플릿 삭제 중 오류가 발생했습니다.')
    }
  }

  // 템플릿 기본 설정 토글
  const handleToggleDefault = async (template: WeeklyReportTemplate) => {
    try {
      const result = await updateWeeklyReportTemplate(template.id, {
        is_default: !template.is_default,
      })
      if (result.success) {
        toast.success(
          template.is_default ? '기본 템플릿이 해제되었습니다.' : '기본 템플릿으로 설정되었습니다.'
        )
        loadTemplates()
      } else {
        toast.error(result.error || '템플릿 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('템플릿 수정 에러:', error)
      toast.error('템플릿 수정 중 오류가 발생했습니다.')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
        variants={fadeIn}
        initial='initial'
        animate='animate'
        exit='exit'
        transition={easeTransition}
      >
        <motion.div
          className='w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-2xl'
          onClick={(e) => e.stopPropagation()}
          variants={zoomIn}
          initial='initial'
          animate='animate'
          exit='exit'
          transition={easeTransition}
        >
          {/* 헤더 */}
          <div className='flex items-center justify-between p-6 border-b border-[rgb(var(--border))]'>
            <div className='flex items-center gap-3'>
              <FileText className='w-5 h-5 text-violet-600 dark:text-violet-400' />
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))]'>주간보고 템플릿</h2>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className='flex items-center gap-2 px-4 py-2 rounded-xl btn-ghost border border-[rgb(var(--border))] text-sm'
              >
                <Plus className='w-4 h-4' />
                새 템플릿
              </button>
              <button onClick={onClose} className='p-2 rounded-xl btn-ghost'>
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* 내용 */}
          <div className='overflow-y-auto max-h-[calc(85vh-80px)]'>
            {/* 생성 폼 */}
            {showCreateForm && (
              <div className='p-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30'>
                <h3 className='text-sm font-semibold text-[rgb(var(--foreground))] mb-4'>새 템플릿 생성</h3>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-[rgb(var(--foreground))] mb-2'>
                      템플릿 이름 *
                    </label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder='예: 기본 주간보고 템플릿'
                      className='w-full px-4 py-2.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-violet-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[rgb(var(--foreground))] mb-2'>
                      설명 (선택사항)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder='템플릿에 대한 설명을 입력하세요'
                      rows={2}
                      className='w-full px-4 py-2.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none'
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      id='is_default'
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className='w-4 h-4 rounded border-[rgb(var(--border))] text-violet-600 focus:ring-violet-500'
                    />
                    <label htmlFor='is_default' className='text-sm text-[rgb(var(--foreground))] cursor-pointer'>
                      기본 템플릿으로 설정
                    </label>
                  </div>
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => {
                        setShowCreateForm(false)
                        setFormData({ name: '', description: '', is_default: false })
                      }}
                      className='px-4 py-2 rounded-xl btn-secondary text-sm'
                    >
                      취소
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={isCreating}
                      className='px-4 py-2 rounded-xl btn-primary text-sm disabled:opacity-50'
                    >
                      {isCreating ? '생성 중...' : '생성'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 템플릿 목록 */}
            <div className='p-6'>
              {isLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin' />
                </div>
              ) : templates.length === 0 ? (
                <div className='text-center py-12'>
                  <FileText className='w-12 h-12 mx-auto text-[rgb(var(--muted-foreground))] mb-4' />
                  <p className='text-sm text-[rgb(var(--muted-foreground))]'>템플릿이 없습니다.</p>
                  <p className='text-xs text-[rgb(var(--muted-foreground))] mt-2'>
                    새 템플릿을 생성하여 주간보고 작성을 더 빠르게 하세요.
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className='p-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] hover:border-violet-500/50 transition-colors'
                    >
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='text-sm font-semibold text-[rgb(var(--foreground))] truncate'>
                              {template.name}
                            </h3>
                            {template.is_default && (
                              <Star className='w-4 h-4 text-yellow-500 fill-yellow-500' />
                            )}
                          </div>
                          {template.description && (
                            <p className='text-xs text-[rgb(var(--muted-foreground))] line-clamp-2'>
                              {template.description}
                            </p>
                          )}
                          <p className='text-xs text-[rgb(var(--muted-foreground))] mt-2'>
                            {new Date(template.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className='flex items-center gap-2 flex-shrink-0'>
                          <button
                            onClick={() => {
                              onSelectTemplate(template)
                              onClose()
                            }}
                            className='px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-xs font-medium transition-colors'
                          >
                            적용
                          </button>
                          <button
                            onClick={() => handleToggleDefault(template)}
                            className='p-1.5 rounded-lg btn-ghost'
                            title={template.is_default ? '기본 템플릿 해제' : '기본 템플릿 설정'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                template.is_default
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-[rgb(var(--muted-foreground))]'
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(template.id)}
                            className='p-1.5 rounded-lg btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            title='삭제'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
