'use client'

import { Skeleton } from '@/app/components/ui/Skeleton'

export default function WeeklyReportNewLoading() {
  return (
    <div className='min-h-screen bg-[rgb(var(--background))]'>
      {/* 헤더 스켈레톤 */}
      <header className='sticky top-0 z-40 bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-[rgb(var(--border))]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Skeleton className='w-10 h-10 rounded-xl' />
              <div>
                <Skeleton className='h-5 w-48 mb-2' />
                <Skeleton className='h-4 w-32' />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-10 w-24 rounded-xl' />
              <Skeleton className='h-10 w-20 rounded-xl' />
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-6'>
          {/* 완료된 카드 섹션 스켈레톤 */}
          <div className='card p-6'>
            <Skeleton className='h-6 w-32 mb-4' />
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='p-4 bg-[rgb(var(--secondary))] rounded-xl border border-[rgb(var(--border))]'>
                  <Skeleton className='h-5 w-3/4 mb-2' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              ))}
            </div>
          </div>

          {/* 진행 중인 카드 섹션 스켈레톤 */}
          <div className='card p-6'>
            <Skeleton className='h-6 w-32 mb-4' />
            <div className='space-y-4'>
              {[1, 2].map((i) => (
                <div key={i} className='p-4 bg-[rgb(var(--secondary))] rounded-xl border border-[rgb(var(--border))]'>
                  <Skeleton className='h-5 w-2/3 mb-2' />
                  <Skeleton className='h-4 w-1/3 mb-4' />
                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <Skeleton className='h-10 w-full' />
                    <Skeleton className='h-10 w-full' />
                  </div>
                  <Skeleton className='h-10 w-full mb-4' />
                  <Skeleton className='h-20 w-full mb-4' />
                  <Skeleton className='h-16 w-full' />
                </div>
              ))}
            </div>
          </div>

          {/* 총 작업 시간 스켈레톤 */}
          <div className='card p-6'>
            <Skeleton className='h-8 w-48' />
          </div>

          {/* 추가 메모 스켈레톤 */}
          <div className='card p-6'>
            <Skeleton className='h-5 w-24 mb-2' />
            <Skeleton className='h-32 w-full' />
          </div>
        </div>
      </main>
    </div>
  )
}
