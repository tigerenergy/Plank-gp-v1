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
      className='card p-5 h-44 ring-2 ring-indigo-200 dark:ring-indigo-800'
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className='h-full flex flex-col'>
        <input
          type='text'
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder='새 보드 이름...'
          className='w-full px-4 py-3 rounded-xl input text-sm'
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancel()
          }}
        />
        <div className='flex gap-2 mt-auto'>
          <button type='submit' className='flex-1 btn-primary py-2.5 text-sm'>
            생성
          </button>
          <button type='button' onClick={onCancel} className='btn-secondary py-2.5 px-4 text-sm'>
            취소
          </button>
        </div>
      </div>
    </form>
  )
}
