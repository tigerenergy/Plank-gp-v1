'use client'

interface CreateBoardFormProps {
  title: string
  isSubmitting: boolean
  onTitleChange: (title: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function CreateBoardForm({ title, isSubmitting, onTitleChange, onSubmit, onCancel }: CreateBoardFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className='card p-5 h-44 ring-2 ring-indigo-200 dark:ring-indigo-800'
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <fieldset disabled={isSubmitting} className='h-full'>
        <div className='h-full flex flex-col'>
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
          <div className='flex gap-2 mt-auto'>
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
        </div>
      </fieldset>
    </form>
  )
}
