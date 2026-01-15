'use client'

interface BoardErrorProps {
  error: string
  onRetry: () => void
  onBack: () => void
}

export function BoardError({ error, onRetry, onBack }: BoardErrorProps) {
  return (
    <div className='flex items-center justify-center min-h-[100dvh] px-4'>
      <div
        className='flex flex-col items-center gap-4 text-center w-full max-w-md 
                      bg-bg-secondary border border-white/10 rounded-xl p-6 sm:p-8
                      shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
      >
        <div className='w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center'>
          <svg className='w-7 h-7 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>
        <div>
          <h2 className='text-lg font-bold text-text-primary mb-2'>오류가 발생했습니다</h2>
          <p className='text-sm text-text-tertiary'>{error}</p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2'>
          <button
            onClick={onBack}
            className='px-4 py-2.5 rounded-lg text-sm font-medium
                       bg-white/5 border border-white/10 text-text-secondary
                       hover:bg-white/10 transition-all w-full sm:w-auto'
          >
            보드 목록으로
          </button>
          <button
            onClick={onRetry}
            className='px-4 py-2.5 rounded-lg text-sm font-medium
                       bg-violet-600 hover:bg-violet-500 text-white
                       transition-all w-full sm:w-auto'
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  )
}
