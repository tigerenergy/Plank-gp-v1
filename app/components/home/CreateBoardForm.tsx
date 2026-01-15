'use client'

interface CreateBoardFormProps {
  title: string
  onTitleChange: (title: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function CreateBoardForm({ title, onTitleChange, onSubmit, onCancel }: CreateBoardFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className='rounded-xl p-5 h-36 bg-bg-secondary border border-violet-500/30
                 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
    >
      <input
        type='text'
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder='보드 제목 입력...'
        className='w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-white/10
                   text-text-primary text-sm placeholder-text-muted
                   focus:outline-none focus:border-violet-500/50 mb-3'
        autoFocus
      />
      <div className='flex gap-2'>
        <button
          type='submit'
          className='flex-1 py-2 rounded-lg text-sm font-medium
                   bg-violet-600 hover:bg-violet-500 text-white transition-all'
        >
          생성
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 rounded-lg text-sm
                     bg-white/5 text-text-tertiary hover:bg-white/10 transition-all'
        >
          취소
        </button>
      </div>
    </form>
  )
}
