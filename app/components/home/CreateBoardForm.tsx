'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'

// 기본 이모지 (자주 사용)
const DEFAULT_EMOJIS = ['📋', '💼', '🚀', '🎯', '💡', '🔧']

// 전체 이모지 카테고리
const ALL_EMOJIS = {
  '업무': ['📋', '💼', '📝', '📊', '📈', '📉', '🗂️', '📁', '📂', '🗃️'],
  '프로젝트': ['🚀', '🎯', '⭐', '🏆', '🎖️', '🥇', '✅', '☑️', '✨', '💎'],
  '아이디어': ['💡', '🧠', '💭', '🔮', '🎲', '🎪', '🎨', '🖌️', '🎬', '📸'],
  '개발': ['🔧', '⚙️', '🛠️', '💻', '🖥️', '⌨️', '🔌', '📱', '🌐', '🔒'],
  '소통': ['💬', '📢', '📣', '🔔', '✉️', '📧', '📞', '🤝', '👥', '👋'],
  '기타': ['🏠', '❤️', '🔥', '⚡', '🌈', '☀️', '🌙', '🎵', '🎮', '🎁'],
}

interface CreateBoardFormProps {
  title: string
  emoji: string
  isSubmitting: boolean
  onTitleChange: (title: string) => void
  onEmojiChange: (emoji: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function CreateBoardForm({ 
  title, 
  emoji,
  isSubmitting, 
  onTitleChange, 
  onEmojiChange,
  onSubmit, 
  onCancel 
}: CreateBoardFormProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 피커 닫기
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

  const handleEmojiSelect = (selectedEmoji: string) => {
    onEmojiChange(selectedEmoji)
    setShowPicker(false)
  }

  return (
    <form
      onSubmit={onSubmit}
      className='card p-5 ring-2 ring-indigo-200 dark:ring-indigo-800'
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <fieldset disabled={isSubmitting} className='space-y-3'>
        {/* 이모지 선택 */}
        <div className='relative' ref={pickerRef}>
          <label className='block text-xs text-[rgb(var(--muted-foreground))] mb-2'>아이콘 선택</label>
          <div className='flex gap-1.5 items-center'>
            {DEFAULT_EMOJIS.map((e) => (
              <button
                key={e}
                type='button'
                onClick={() => onEmojiChange(e)}
                className={`w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center text-lg transition-all
                  ${emoji === e 
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500' 
                    : 'bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--muted))]'
                  }`}
              >
                {e}
              </button>
            ))}
            {/* 더보기 버튼 */}
            <button
              type='button'
              onClick={() => setShowPicker(!showPicker)}
              className={`w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center transition-all
                ${showPicker 
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500' 
                  : 'bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]'
                }`}
              title='더 많은 아이콘'
            >
              <MoreHorizontal className='w-4 h-4' />
            </button>
            {/* 선택된 이모지가 기본에 없으면 표시 */}
            {!DEFAULT_EMOJIS.includes(emoji) && (
              <div className='w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center text-lg bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500'>
                {emoji}
              </div>
            )}
          </div>

          {/* 이모지 피커 드롭다운 */}
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
                        onClick={() => handleEmojiSelect(e)}
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

        {/* 제목 입력 */}
        <input
          type='text'
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder='새 보드 이름...'
          className='w-full px-4 py-3 rounded-xl input text-sm disabled:opacity-60 disabled:cursor-not-allowed'
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !isSubmitting) onCancel()
          }}
        />

        {/* 버튼 */}
        <div className='flex gap-2'>
          <button 
            type='submit' 
            className='flex-1 btn-primary py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {isSubmitting ? '생성 중...' : '보드 만들기'}
          </button>
          <button 
            type='button' 
            onClick={onCancel} 
            className='btn-secondary py-2.5 px-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed'
          >
            돌아가기
          </button>
        </div>
      </fieldset>
    </form>
  )
}

export { DEFAULT_EMOJIS, ALL_EMOJIS }
