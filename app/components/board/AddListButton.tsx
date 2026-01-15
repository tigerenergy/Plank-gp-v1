'use client'

import { toast } from 'sonner'

export function AddListButton() {
  const handleClick = () => {
    toast.info('리스트 추가 기능은 준비 중입니다.')
  }

  return (
    <div className='sm:flex-shrink-0'>
      <button
        onClick={handleClick}
        className='w-full sm:w-72 sm:min-w-[288px] p-3
                   bg-white/5 border border-dashed border-white/15 
                   hover:border-violet-500/40 hover:bg-violet-500/5
                   rounded-xl text-text-muted hover:text-pastel-violet
                   flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]'
      >
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
        </svg>
        <span className='text-sm font-medium'>리스트 추가</span>
      </button>
    </div>
  )
}
