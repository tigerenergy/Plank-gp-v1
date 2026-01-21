'use client'

import { Skeleton } from '../../../../components/ui/Skeleton'

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
                <Skeleton className='h-5 w-48 mb-2' />
                <Skeleton className='h-4 w-64' />
              </div>
            </div>
            <Skeleton className='h-10 w-40 rounded-xl' />
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid gap-6'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='card p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='w-5 h-5' />
                  <div>
                    <Skeleton className='h-5 w-24 mb-2' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                </div>
                <Skeleton className='h-6 w-16' />
              </div>

              {/* 완료된 작업 스켈레톤 */}
              <div className='mb-4'>
                <Skeleton className='h-4 w-32 mb-2' />
                <div className='space-y-2'>
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className='h-16 w-full rounded-lg' />
                  ))}
                </div>
              </div>

              {/* 진행 중인 작업 스켈레톤 */}
              <div>
                <Skeleton className='h-4 w-32 mb-2' />
                <div className='space-y-2'>
                  {[1, 2].map((j) => (
                    <Skeleton key={j} className='h-20 w-full rounded-lg' />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
