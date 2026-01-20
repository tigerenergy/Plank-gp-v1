'use client'

import { Plus } from 'lucide-react'

interface EmptyStateProps {
  onCreateClick: () => void
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-16 md:py-24'>
      {/* 3D 칸반 보드 일러스트레이션 */}
      <div 
        className='relative mb-12 group'
        style={{ perspective: '1000px' }}
      >
        {/* 배경 글로우 효과 */}
        <div className='absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-[40px] blur-3xl opacity-20 animate-pulse scale-110' />
        <div className='absolute -inset-10 bg-gradient-to-br from-indigo-400/20 via-transparent to-pink-400/20 rounded-full blur-2xl animate-spin-slow' />
        
        {/* 메인 3D 컨테이너 */}
        <div 
          className='relative transition-transform duration-700 ease-out group-hover:rotate-y-6'
          style={{ 
            transform: 'rotateX(12deg) rotateY(-8deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* 바닥 그림자 */}
          <div 
            className='absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-r from-purple-500/30 via-indigo-500/40 to-purple-500/30 rounded-full blur-xl'
            style={{ transform: 'translateZ(-50px) rotateX(90deg)' }}
          />
          
          {/* 보드 베이스 */}
          <div 
            className='relative w-64 md:w-72 h-52 md:h-56 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/90'
            style={{ 
              boxShadow: `
                0 25px 50px -12px rgba(99, 102, 241, 0.25),
                0 0 0 1px rgba(255,255,255,0.8),
                inset 0 1px 0 rgba(255,255,255,1)
              `,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* 보드 헤더 */}
            <div className='h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center px-4 gap-2'>
              <div className='flex gap-1.5'>
                <div className='w-2.5 h-2.5 rounded-full bg-white/40' />
                <div className='w-2.5 h-2.5 rounded-full bg-white/40' />
                <div className='w-2.5 h-2.5 rounded-full bg-white/40' />
              </div>
              <div className='h-2 w-20 bg-white/30 rounded-full ml-auto' />
            </div>
            
            {/* 칸반 컬럼들 */}
            <div className='flex gap-3 p-4 h-[calc(100%-40px)]'>
              {/* 컬럼 1 - To Do */}
              <div className='flex-1 flex flex-col gap-2'>
                <div className='h-1.5 w-12 bg-amber-400/60 rounded-full' />
                {/* 카드 1 - 플로팅 */}
                <div 
                  className='bg-white dark:bg-slate-700 rounded-lg p-2.5 shadow-lg animate-float-slow'
                  style={{ 
                    transform: 'translateZ(20px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className='h-1.5 w-full bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mb-2' />
                  <div className='h-1 w-3/4 bg-slate-200 dark:bg-slate-600 rounded-full' />
                  <div className='h-1 w-1/2 bg-slate-200 dark:bg-slate-600 rounded-full mt-1' />
                </div>
                {/* 카드 2 */}
                <div 
                  className='bg-white/80 dark:bg-slate-700/80 rounded-lg p-2.5 shadow-md animate-float-slower'
                  style={{ transform: 'translateZ(10px)' }}
                >
                  <div className='h-1.5 w-8 bg-emerald-400/60 rounded-full mb-2' />
                  <div className='h-1 w-2/3 bg-slate-200 dark:bg-slate-600 rounded-full' />
                </div>
              </div>
              
              {/* 컬럼 2 - In Progress */}
              <div className='flex-1 flex flex-col gap-2'>
                <div className='h-1.5 w-14 bg-blue-400/60 rounded-full' />
                {/* 카드 3 - 메인 플로팅 카드 */}
                <div 
                  className='bg-white dark:bg-slate-700 rounded-lg p-2.5 shadow-xl animate-float ring-2 ring-indigo-400/30'
                  style={{ 
                    transform: 'translateZ(35px)',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2), 0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className='h-1.5 w-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-2' />
                  <div className='h-1 w-full bg-slate-200 dark:bg-slate-600 rounded-full' />
                  <div className='h-1 w-4/5 bg-slate-200 dark:bg-slate-600 rounded-full mt-1' />
                  <div className='flex gap-1 mt-2'>
                    <div className='w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400' />
                    <div className='w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 -ml-1.5' />
                  </div>
                </div>
              </div>
              
              {/* 컬럼 3 - Done */}
              <div className='flex-1 flex flex-col gap-2'>
                <div className='h-1.5 w-10 bg-emerald-400/60 rounded-full' />
                {/* 카드 4 */}
                <div 
                  className='bg-white/70 dark:bg-slate-700/70 rounded-lg p-2.5 shadow-md animate-float-slower'
                  style={{ transform: 'translateZ(15px)' }}
                >
                  <div className='flex items-center gap-1.5'>
                    <div className='w-3 h-3 rounded-full bg-emerald-400 flex items-center justify-center'>
                      <svg className='w-2 h-2 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                      </svg>
                    </div>
                    <div className='h-1 w-8 bg-slate-300 dark:bg-slate-500 rounded-full' />
                  </div>
                </div>
                {/* 카드 5 */}
                <div 
                  className='bg-white/60 dark:bg-slate-700/60 rounded-lg p-2.5 shadow animate-float-slow'
                  style={{ transform: 'translateZ(8px)' }}
                >
                  <div className='h-1.5 w-6 bg-pink-400/60 rounded-full mb-2' />
                  <div className='h-1 w-full bg-slate-200 dark:bg-slate-600 rounded-full' />
                </div>
              </div>
            </div>
          </div>
          
          {/* 플로팅 장식 요소들 */}
          <div 
            className='absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg animate-bounce-slow flex items-center justify-center'
            style={{ transform: 'translateZ(60px) rotate(12deg)' }}
          >
            <span className='text-lg'>✨</span>
          </div>
          
          <div 
            className='absolute -bottom-2 -left-6 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg animate-bounce-slower flex items-center justify-center'
            style={{ transform: 'translateZ(45px) rotate(-8deg)' }}
          >
            <span className='text-sm'>🚀</span>
          </div>
          
          <div 
            className='absolute top-1/2 -right-8 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg animate-pulse flex items-center justify-center'
            style={{ transform: 'translateZ(40px)' }}
          >
            <span className='text-xs'>💜</span>
          </div>
        </div>
      </div>
      
      {/* 텍스트 */}
      <h2 className='text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4'>
        아직 보드가 없습니다
      </h2>
      <p className='text-base text-[rgb(var(--muted-foreground))] mb-2 text-center max-w-md'>
        첫 번째 보드를 만들어서 프로젝트를 체계적으로 관리해보세요.
      </p>
      <p className='text-sm text-[rgb(var(--muted-foreground))] mb-10'>
        팀원들과 함께 협업할 수 있습니다.
      </p>
      
      {/* CTA 버튼 */}
      <button 
        onClick={onCreateClick} 
        className='group relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-100'
        style={{
          boxShadow: '0 10px 40px -10px rgba(99, 102, 241, 0.5), 0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {/* 배경 그라데이션 */}
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500' />
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        
        {/* 빛나는 효과 */}
        <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
        </div>
        
        {/* 컨텐츠 */}
        <span className='relative flex items-center gap-2'>
          <Plus className='w-5 h-5 transition-transform group-hover:rotate-90 duration-300' />
          새 프로젝트 만들기
        </span>
      </button>
    </div>
  )
}
