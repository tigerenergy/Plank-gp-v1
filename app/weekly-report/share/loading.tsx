'use client'

import { Skeleton, WeeklyReportCardSkeleton } from '@/app/components/ui/Skeleton'

export default function WeeklyReportShareLoading() {
  return (
    <div className='min-h-screen bg-[rgb(var(--background))]'>
      {/* 헤더 스켈레톤 */}
      <header className='sticky top-0 z-40 bg-[rgb(var(--background))]/80 backdrop-blur-xl border-b border-[rgb(var(--border))]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-16 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Skeleton className='w-10 h-10 rounded-xl' />
              <div>
                <Skeleton className='h-5 w-32 mb-2' />
                <Skeleton className='h-4 w-48' />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-10 w-32 rounded-xl' />
              <Skeleton className='h-10 w-40 rounded-xl' />
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <WeeklyReportCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}
