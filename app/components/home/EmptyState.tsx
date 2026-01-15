'use client'

import { Plus, Sparkles } from 'lucide-react'

interface EmptyStateProps {
  onCreateClick: () => void
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-24'>
      {/* 애니메이션 배경 */}
      <div className='relative mb-8'>
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 animate-pulse' />
        <div className='relative w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl'>
          <div className='text-5xl'>📋</div>
          <Sparkles className='absolute -top-2 -right-2 w-8 h-8 text-amber-400' />
        </div>
      </div>
      
      <h2 className='text-2xl font-bold text-[rgb(var(--foreground))] mb-3'>
        아직 보드가 없습니다
      </h2>
      <p className='text-base text-[rgb(var(--muted-foreground))] mb-8 text-center max-w-md'>
        첫 번째 보드를 만들어서 프로젝트를 체계적으로 관리해보세요.
        <br />
        <span className='text-sm'>팀원들과 함께 협업할 수 있습니다.</span>
      </p>
      
      <button 
        onClick={onCreateClick} 
        className='group relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl'
      >
        {/* 배경 그라데이션 */}
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' />
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity' />
        
        {/* 컨텐츠 */}
        <span className='relative flex items-center gap-2'>
          <Plus className='w-5 h-5' />
          새 보드 만들기
        </span>
      </button>
    </div>
  )
}
