'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

// 기본 스켈레톤 블록
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-white/10 rounded ${className}`}
    />
  )
}

// 카드 스켈레톤
export function CardSkeleton() {
  return (
    <motion.div
      className='p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a45] border border-gray-200 dark:border-white/10'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Labels */}
      <div className='flex gap-1 mb-2'>
        <Skeleton className='h-4 w-12' />
        <Skeleton className='h-4 w-16' />
      </div>
      {/* Title */}
      <Skeleton className='h-4 w-full mb-2' />
      <Skeleton className='h-4 w-3/4 mb-3' />
      {/* Bottom */}
      <div className='flex justify-between'>
        <Skeleton className='h-5 w-16' />
        <Skeleton className='h-5 w-5 rounded-full' />
      </div>
    </motion.div>
  )
}

// 컬럼 스켈레톤
export function ColumnSkeleton() {
  return (
    <motion.div
      className='w-full sm:w-72 sm:min-w-[288px] flex-shrink-0 rounded-xl 
                 bg-gray-100 dark:bg-[#1e1e38] border border-gray-200 dark:border-white/10'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className='px-4 py-3 border-b border-gray-200 dark:border-white/5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Skeleton className='w-2 h-2 rounded-full' />
            <Skeleton className='w-2 h-2 rounded-full' />
            <Skeleton className='h-5 w-24' />
            <Skeleton className='h-5 w-6 rounded-md' />
          </div>
          <Skeleton className='h-6 w-6 rounded' />
        </div>
      </div>

      {/* Cards */}
      <div className='p-2 space-y-2'>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Add button */}
      <div className='p-2 pt-0'>
        <Skeleton className='h-9 w-full rounded-lg' />
      </div>
    </motion.div>
  )
}

// 보드 스켈레톤 (전체 로딩)
export function BoardSkeleton() {
  return (
    <div className='min-h-[100dvh] flex flex-col bg-gray-50 dark:bg-[#0f0f1a]'>
      {/* Header */}
      <div className='flex-shrink-0 sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5'>
        <div className='px-4 sm:px-6 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='w-9 h-9 rounded-lg' />
              <Skeleton className='h-6 w-32' />
            </div>
            <div className='flex items-center gap-3'>
              <Skeleton className='w-9 h-9 rounded-lg' />
              <Skeleton className='w-9 h-9 rounded-lg' />
              <Skeleton className='w-8 h-8 rounded-full' />
            </div>
          </div>
        </div>
      </div>

      {/* Board Area */}
      <div className='flex-1 p-4 sm:p-6 overflow-auto'>
        <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start'>
          <ColumnSkeleton />
          <ColumnSkeleton />
          <ColumnSkeleton />
          {/* Add column button skeleton */}
          <div className='w-full sm:w-72 sm:min-w-[288px] flex-shrink-0'>
            <Skeleton className='h-12 w-full rounded-xl' />
          </div>
        </div>
      </div>
    </div>
  )
}

// 보드 카드 스켈레톤 (홈 페이지)
export function BoardCardSkeleton() {
  return (
    <motion.div
      className='rounded-xl p-5 h-36 bg-gray-100 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Skeleton className='h-6 w-3/4 mb-3' />
      <Skeleton className='h-4 w-1/2' />
    </motion.div>
  )
}

// 홈 페이지 스켈레톤
export function HomeSkeleton() {
  return (
    <div className='min-h-[100dvh] bg-gray-50 dark:bg-[#0f0f1a]'>
      {/* Header */}
      <div className='sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Skeleton className='w-8 h-8 rounded-lg' />
            <Skeleton className='h-6 w-20' />
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='w-9 h-9 rounded-lg' />
            <Skeleton className='w-8 h-8 rounded-full' />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 py-8'>
        <div className='mb-8'>
          <Skeleton className='h-7 w-24 mb-2' />
          <Skeleton className='h-5 w-48' />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          <BoardCardSkeleton />
          <BoardCardSkeleton />
          <BoardCardSkeleton />
          <BoardCardSkeleton />
        </div>
      </main>
    </div>
  )
}
