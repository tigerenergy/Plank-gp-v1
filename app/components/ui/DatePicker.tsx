'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parseISO, isValid } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-day-picker/style.css'

interface DatePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = '마감일 선택' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
      const hours = isValidDate ? selectedDate.getHours() : 18
      const minutes = isValidDate ? selectedDate.getMinutes() : 0
      date.setHours(hours, minutes)
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
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex items-center gap-3 px-4 py-3 rounded-xl input text-left'
      >
        <Calendar className='w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0' />
        <span className={isValidDate ? 'text-[rgb(var(--foreground))]' : 'text-[rgb(var(--muted-foreground))]'}>
          {isValidDate ? format(selectedDate, 'yyyy년 M월 d일 HH:mm', { locale: ko }) : placeholder}
        </span>
        {isValidDate && (
          <button
            type='button'
            onClick={handleClear}
            className='ml-auto p-1 rounded-md hover:bg-[rgb(var(--secondary))] transition-colors'
          >
            <X className='w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]' />
          </button>
        )}
      </button>

      {isOpen && (
        <div
          className='absolute z-50 mt-2 left-0 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl shadow-xl overflow-hidden'
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className='p-4'>
            <style jsx global>{`
              .rdp-root {
                --rdp-accent-color: rgb(99, 102, 241);
                --rdp-accent-background-color: rgb(99, 102, 241);
                font-family: inherit;
              }
              .rdp-months {
                display: flex;
                flex-direction: column;
              }
              .rdp-month {
                width: 280px;
              }
              .rdp-month_caption {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 8px 16px 8px;
              }
              .rdp-caption_label {
                font-size: 15px;
                font-weight: 600;
                color: rgb(var(--foreground));
              }
              .rdp-nav {
                display: flex;
                gap: 4px;
              }
              .rdp-button_previous,
              .rdp-button_next {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                color: rgb(var(--muted-foreground));
                transition: all 0.15s;
              }
              .rdp-button_previous:hover,
              .rdp-button_next:hover {
                background: rgb(var(--secondary));
                color: rgb(var(--foreground));
              }
              .rdp-weekdays {
                display: grid !important;
                grid-template-columns: repeat(7, 40px) !important;
                margin-bottom: 8px;
              }
              .rdp-weekday {
                width: 40px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                color: rgb(var(--muted-foreground));
              }
              .rdp-weeks {
                display: flex;
                flex-direction: column;
                gap: 2px;
              }
              .rdp-week {
                display: grid !important;
                grid-template-columns: repeat(7, 40px) !important;
              }
              .rdp-day {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .rdp-day_button {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                font-size: 14px;
                color: rgb(var(--foreground));
                transition: all 0.15s;
                cursor: pointer;
              }
              .rdp-day_button:hover {
                background: rgb(var(--secondary));
              }
              .rdp-selected .rdp-day_button {
                background: rgb(99, 102, 241) !important;
                color: white !important;
                font-weight: 500;
              }
              .rdp-today .rdp-day_button {
                font-weight: 700;
                color: rgb(99, 102, 241);
              }
              .rdp-today.rdp-selected .rdp-day_button {
                color: white;
              }
              .rdp-outside .rdp-day_button {
                color: rgb(var(--muted-foreground));
                opacity: 0.4;
              }
              .rdp-disabled .rdp-day_button {
                color: rgb(var(--muted-foreground));
                opacity: 0.3;
                cursor: not-allowed;
              }
            `}</style>
            
            <DayPicker
              mode='single'
              selected={isValidDate ? selectedDate : undefined}
              onSelect={handleSelect}
              locale={ko}
              showOutsideDays
            />
          </div>

          {/* 시간 선택 */}
          <div className='px-4 pb-4 pt-2 border-t border-[rgb(var(--border))]'>
            <label className='block text-xs font-semibold text-[rgb(var(--muted-foreground))] mb-2'>시간</label>
            <input
              type='time'
              value={isValidDate ? format(selectedDate, 'HH:mm') : '18:00'}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number)
                const newDate = isValidDate ? new Date(selectedDate) : new Date()
                newDate.setHours(hours, minutes)
                const isoString = format(newDate, "yyyy-MM-dd'T'HH:mm")
                onChange(isoString)
              }}
              className='w-full px-4 py-3 rounded-xl input'
            />
          </div>

          {/* 빠른 선택 */}
          <div className='px-4 pb-4 flex gap-2'>
            <button
              type='button'
              onClick={() => {
                const today = new Date()
                today.setHours(18, 0)
                handleSelect(today)
              }}
              className='flex-1 py-2.5 rounded-xl btn-secondary text-xs font-semibold'
            >
              오늘
            </button>
            <button
              type='button'
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow.setHours(18, 0)
                handleSelect(tomorrow)
              }}
              className='flex-1 py-2.5 rounded-xl btn-secondary text-xs font-semibold'
            >
              내일
            </button>
            <button
              type='button'
              onClick={() => {
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                nextWeek.setHours(18, 0)
                handleSelect(nextWeek)
              }}
              className='flex-1 py-2.5 rounded-xl btn-secondary text-xs font-semibold'
            >
              다음 주
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
