'use client'

interface CreateBoardFormProps {
  title: string
  onTitleChange: (title: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function CreateBoardForm({
  title,
  onTitleChange,
  onSubmit,
  onCancel,
}: CreateBoardFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className='rounded-xl p-5 h-36 bg-violet-50 dark:bg-[#1a1a2e] border border-violet-300 dark:border-violet-500/30
                 shadow-lg shadow-violet-500/10'
    >
      <input
        type='text'
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder='보드 제목 입력...'
        className='w-full px-3 py-2 rounded-lg bg-white dark:bg-[#252542] border border-gray-300 dark:border-white/10
                   text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:border-violet-500 dark:focus:border-violet-500/50 mb-3'
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
                     bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/10 transition-all'
        >
          취소
        </button>
      </div>
    </form>
  )
}
