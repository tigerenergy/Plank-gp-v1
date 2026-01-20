'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MoreHorizontal, Calendar } from 'lucide-react'
import { DatePicker } from '../ui/DatePicker'

// 기본 이모지 (자주 사용)
const DEFAULT_EMOJIS = ['📋', '💼', '🚀', '🎯', '💡', '🔧']

// 에러 상태 타입
interface FormErrors {
  title?: boolean
  startDate?: boolean
  dueDate?: boolean
}

// 전체 이모지 카테고리
const ALL_EMOJIS = {
  '업무': ['📋', '💼', '📝', '📊', '📈', '📉', '🗂️', '📁', '📂', '🗃️'],
  '프로젝트': ['🚀', '🎯', '⭐', '🏆', '🎖️', '🥇', '✅', '☑️', '✨', '💎'],
  '아이디어': ['💡', '🧠', '💭', '🔮', '🎲', '🎪', '🎨', '🖌️', '🎬', '📸'],
  '개발': ['🔧', '⚙️', '🛠️', '💻', '🖥️', '⌨️', '🔌', '📱', '🌐', '🔒'],
  '소통': ['💬', '📢', '📣', '🔔', '✉️', '📧', '📞', '🤝', '👥', '👋'],
  '기타': ['🏠', '❤️', '🔥', '⚡', '🌈', '☀️', '🌙', '🎵', '🎮', '🎁'],
}

interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; emoji: string; startDate: string; dueDate: string }) => void
  isSubmitting: boolean
}

export function CreateBoardModal({ isOpen, onClose, onSubmit, isSubmitting }: CreateBoardModalProps) {
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('📋')
  const [startDate, setStartDate] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const pickerRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setEmoji('📋')
      setStartDate(null)
      setDueDate(null)
      setErrors({})
    }
  }, [isOpen])

  // 이모지 피커 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  // ESC로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 중복 제출 방지
    if (isSubmitting) return
    
    // 검증
    const newErrors: FormErrors = {}
    
    if (!title.trim()) {
      newErrors.title = true
    }
    if (!startDate) {
      newErrors.startDate = true
    }
    if (!dueDate) {
      newErrors.dueDate = true
    }
    
    setErrors(newErrors)
    
    // 에러가 있으면 첫 번째 에러 필드에 포커싱
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.title && titleInputRef.current) {
        titleInputRef.current.focus()
      }
      return
    }
    
    onSubmit({
      title: title.trim(),
      emoji,
      startDate: startDate || '',
      dueDate: dueDate || '',
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          onClick={handleBackdropClick}
        >
          {/* 배경 오버레이 */}
          <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className='relative w-full max-w-md max-h-[90vh] bg-[rgb(var(--card))] rounded-2xl shadow-2xl overflow-hidden flex flex-col'
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            {/* 헤더 */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))]'>
              <h2 className='text-lg font-bold text-[rgb(var(--foreground))]'>
                새 프로젝트 만들기
              </h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className='p-2 rounded-lg hover:bg-[rgb(var(--secondary))] transition-colors disabled:opacity-50'
              >
                <X className='w-5 h-5 text-[rgb(var(--muted-foreground))]' />
              </button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className='p-6 space-y-5 overflow-y-auto flex-1'>
              {/* 이모지 선택 */}
              <div className='relative' ref={pickerRef}>
                <label className='block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-2'>
                  아이콘 선택
                </label>
                <div className='flex gap-2 items-center flex-wrap'>
                  {DEFAULT_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type='button'
                      onClick={() => setEmoji(e)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all
                        ${emoji === e
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500'
                          : 'bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--muted))]'
                        }`}
                    >
                      {e}
                    </button>
                  ))}
                  <button
                    type='button'
                    onClick={() => setShowPicker(!showPicker)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                      ${showPicker
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500'
                        : 'bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--muted))]'
                      }`}
                  >
                    <MoreHorizontal className='w-5 h-5 text-[rgb(var(--foreground))]' />
                  </button>
                  {!DEFAULT_EMOJIS.includes(emoji) && (
                    <div className='w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500'>
                      {emoji}
                    </div>
                  )}
                </div>

                {/* 이모지 피커 */}
                {showPicker && (
                  <div className='absolute top-full left-0 mt-2 z-50 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl shadow-lg p-3 w-72 max-h-64 overflow-y-auto'>
                    {Object.entries(ALL_EMOJIS).map(([category, emojis]) => (
                      <div key={category} className='mb-3 last:mb-0'>
                        <div className='text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1.5'>{category}</div>
                        <div className='flex flex-wrap gap-1'>
                          {emojis.map((e) => (
                            <button
                              key={e}
                              type='button'
                              onClick={() => {
                                setEmoji(e)
                                setShowPicker(false)
                              }}
                              className={`w-8 h-8 rounded-md flex items-center justify-center text-base hover:bg-[rgb(var(--muted))] transition-colors
                                ${emoji === e ? 'bg-indigo-100 dark:bg-indigo-500/20' : ''}`}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 프로젝트 이름 */}
              <div>
                <label className='block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-2'>
                  프로젝트 이름
                </label>
                <input
                  ref={titleInputRef}
                  type='text'
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, title: false }))
                    }
                  }}
                  placeholder='프로젝트 이름을 입력하세요'
                  className={`w-full px-4 py-3 rounded-xl input text-sm transition-all
                    ${errors.title 
                      ? 'ring-2 ring-red-500 border-red-500' 
                      : title.trim() 
                        ? 'ring-2 ring-emerald-500 border-emerald-500' 
                        : ''
                    }`}
                  autoFocus
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className='text-xs text-red-500 mt-1'>프로젝트 이름을 입력해주세요.</p>
                )}
              </div>

              {/* 시작일 */}
              <div>
                <label className='block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-1.5'>
                  <Calendar className='w-4 h-4' />
                  프로젝트 시작일
                </label>
                <DatePicker
                  value={startDate}
                  onChange={(val) => {
                    setStartDate(val)
                    if (val) setErrors(prev => ({ ...prev, startDate: false }))
                  }}
                  placeholder='시작일 선택'
                  hasError={errors.startDate}
                  hasSuccess={!!startDate}
                />
                {errors.startDate && (
                  <p className='text-xs text-red-500 mt-1'>시작일을 선택해주세요.</p>
                )}
              </div>

              {/* 마감일 */}
              <div>
                <label className='block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-1.5'>
                  <Calendar className='w-4 h-4' />
                  프로젝트 마감일
                </label>
                <DatePicker
                  value={dueDate}
                  onChange={(val) => {
                    setDueDate(val)
                    if (val) setErrors(prev => ({ ...prev, dueDate: false }))
                  }}
                  placeholder='마감일 선택'
                  hasError={errors.dueDate}
                  hasSuccess={!!dueDate}
                />
                {errors.dueDate && (
                  <p className='text-xs text-red-500 mt-1'>마감일을 선택해주세요.</p>
                )}
              </div>

              {/* 버튼 */}
              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={onClose}
                  disabled={isSubmitting}
                  className='flex-1 btn-secondary py-3 text-sm font-semibold disabled:opacity-50'
                >
                  취소
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex-1 btn-primary py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  {isSubmitting && (
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  )}
                  {isSubmitting ? '생성 중...' : '프로젝트 만들기'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
