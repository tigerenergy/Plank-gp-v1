'use client'

export function BoardLoading() {
  return (
    <div className='flex items-center justify-center min-h-[100dvh] px-4'>
      <div className='flex flex-col items-center gap-4'>
        <div className='w-12 h-12 border-3 border-bg-tertiary border-t-pastel-violet rounded-full animate-spin' />
        <p className='text-text-tertiary font-medium text-sm'>보드를 불러오는 중...</p>
      </div>
    </div>
  )
}
