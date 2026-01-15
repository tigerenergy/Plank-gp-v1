'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parseISO, isValid } from 'date-fns'
import { ko } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, X } from 'lucide-react'

interface DatePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = '마감일 선택' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedDate = value ? parseISO(value) : undefined
  const isValidDate = selectedDate && isValid(selectedDate)

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // ISO string 형태로 저장 (YYYY-MM-DDTHH:mm)
      const isoString = format(date, "yyyy-MM-dd'T'HH:mm")
      onChange(isoString)
    }
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div ref={containerRef} className='relative'>
      {/* 입력 버튼 */}
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center gap-2 px-4 py-2.5 rounded-lg 
                 bg-gray-100 dark:bg-[#252542] 
                 border border-gray-300 dark:border-white/10 
                 text-sm text-left
                 hover:border-violet-500/50 focus:outline-none focus:border-violet-500
                 transition-colors'
      >
        <Calendar className='w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' />
        <span className={isValidDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
          {isValidDate ? format(selectedDate, 'yyyy년 M월 d일 HH:mm', { locale: ko }) : placeholder}
        </span>
        {isValidDate && (
          <button
            type='button'
            onClick={handleClear}
            className='ml-auto p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-colors'
          >
            <X className='w-3 h-3 text-gray-400' />
          </button>
        )}
      </button>

      {/* 캘린더 팝업 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className='absolute z-50 mt-2 p-4 
                     bg-white dark:bg-[#1e1e35] 
                     border border-gray-200 dark:border-white/10 
                     rounded-xl shadow-xl'
          >
            <DayPicker
              mode='single'
              selected={isValidDate ? selectedDate : undefined}
              onSelect={handleSelect}
              locale={ko}
              showOutsideDays
              classNames={{
                root: 'text-gray-900 dark:text-gray-100',
                months: 'flex flex-col',
                month: 'space-y-3',
                caption: 'flex justify-center items-center relative h-10',
                caption_label: 'text-sm font-semibold',
                nav: 'flex items-center gap-1',
                nav_button: 'p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell: 'w-9 text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-2',
                row: 'flex w-full',
                cell: 'w-9 h-9 text-center text-sm p-0 relative',
                day: 'w-full h-full flex items-center justify-center rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors cursor-pointer',
                day_selected: 'bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-600 font-semibold',
                day_today: 'bg-gray-100 dark:bg-white/10 font-semibold',
                day_outside: 'text-gray-300 dark:text-gray-600',
                day_disabled: 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
              }}
              components={{
                Chevron: ({ orientation }) => (
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path 
                      strokeLinecap='round' 
                      strokeLinejoin='round' 
                      strokeWidth={2} 
                      d={orientation === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} 
                    />
                  </svg>
                ),
              }}
            />

            {/* 시간 선택 */}
            <div className='mt-3 pt-3 border-t border-gray-200 dark:border-white/10'>
              <label className='block text-xs text-gray-500 dark:text-gray-400 mb-2'>시간</label>
              <input
                type='time'
                value={isValidDate ? format(selectedDate, 'HH:mm') : '09:00'}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number)
                  const newDate = isValidDate ? new Date(selectedDate) : new Date()
                  newDate.setHours(hours, minutes)
                  const isoString = format(newDate, "yyyy-MM-dd'T'HH:mm")
                  onChange(isoString)
                }}
                className='w-full px-3 py-2 rounded-lg 
                         bg-gray-100 dark:bg-[#252542] 
                         border border-gray-300 dark:border-white/10 
                         text-sm text-gray-900 dark:text-gray-100
                         focus:outline-none focus:border-violet-500'
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
