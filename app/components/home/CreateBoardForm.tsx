'use client'

// 보드 이모지 옵션
const BOARD_EMOJI_OPTIONS = [
  { emoji: '📋', label: '할 일' },
  { emoji: '💼', label: '업무' },
  { emoji: '🚀', label: '프로젝트' },
  { emoji: '🎯', label: '목표' },
  { emoji: '💡', label: '아이디어' },
  { emoji: '🔧', label: '개발' },
  { emoji: '🎨', label: '디자인' },
  { emoji: '📊', label: '분석' },
  { emoji: '📝', label: '문서' },
  { emoji: '🏠', label: '개인' },
]

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
  return (
    <form
      onSubmit={onSubmit}
      className='card p-5 ring-2 ring-indigo-200 dark:ring-indigo-800'
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <fieldset disabled={isSubmitting} className='space-y-3'>
        {/* 이모지 선택 */}
        <div>
          <label className='block text-xs text-[rgb(var(--muted-foreground))] mb-2'>아이콘 선택</label>
          <div className='flex flex-wrap gap-1.5'>
            {BOARD_EMOJI_OPTIONS.map((option) => (
              <button
                key={option.emoji}
                type='button'
                onClick={() => onEmojiChange(option.emoji)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all
                  ${emoji === option.emoji 
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500' 
                    : 'bg-[rgb(var(--secondary))] hover:bg-[rgb(var(--muted))]'
                  }`}
                title={option.label}
              >
                {option.emoji}
              </button>
            ))}
          </div>
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

export { BOARD_EMOJI_OPTIONS }
