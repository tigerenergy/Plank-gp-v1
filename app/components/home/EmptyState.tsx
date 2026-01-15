'use client'

interface EmptyStateProps {
  onCreateClick: () => void
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className='text-center py-16'>
      <div className='w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-secondary border border-white/5 flex items-center justify-center'>
        <svg className='w-10 h-10 text-text-muted' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
          />
        </svg>
      </div>
      <h3 className='text-xl font-semibold text-text-primary mb-2'>아직 보드가 없어요</h3>
      <p className='text-text-muted mb-6'>첫 번째 보드를 만들어서 작업을 시작해보세요!</p>
      <button
        onClick={onCreateClick}
        className='px-6 py-2.5 rounded-lg font-medium
                   bg-violet-600 hover:bg-violet-500 text-white transition-all'
      >
        + 새 보드 만들기
      </button>
    </div>
  )
}
