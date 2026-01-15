'use client'

import { motion } from 'framer-motion'

interface EmptyStateProps {
  onCreateClick: () => void
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div
      className='flex flex-col items-center justify-center py-20 px-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 일러스트레이션 */}
      <div className='relative mb-8'>
        {/* 배경 장식 */}
        <div className='absolute -inset-4 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full blur-2xl' />

        {/* 메인 아이콘 */}
        <motion.div
          className='relative w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 
                     flex items-center justify-center shadow-2xl shadow-violet-500/30'
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {/* 칸반 보드 아이콘 */}
          <svg
            className='w-16 h-16 text-white'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2'
            />
          </svg>
        </motion.div>

        {/* 떠다니는 카드들 */}
        <motion.div
          className='absolute -top-2 -right-4 w-8 h-10 rounded-lg bg-amber-400 shadow-lg'
          animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className='absolute -bottom-2 -left-4 w-10 h-8 rounded-lg bg-emerald-400 shadow-lg'
          animate={{ y: [0, 5, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className='absolute top-1/2 -right-6 w-6 h-8 rounded bg-pink-400 shadow-lg'
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* 텍스트 */}
      <motion.div
        className='text-center max-w-md'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
          아직 보드가 없어요
        </h3>
        <p className='text-gray-500 dark:text-gray-400 mb-8 leading-relaxed'>
          보드를 만들어 팀과 함께 프로젝트를 관리해보세요.
          <br />할 일을 정리하고 진행 상황을 한눈에 확인할 수 있어요.
        </p>
      </motion.div>

      {/* CTA 버튼 */}
      <motion.button
        onClick={onCreateClick}
        className='group relative px-8 py-4 rounded-2xl font-semibold text-white
                   bg-gradient-to-r from-violet-600 to-violet-700 
                   hover:from-violet-500 hover:to-violet-600
                   shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40
                   transition-all duration-300'
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className='flex items-center gap-2'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          첫 번째 보드 만들기
        </span>
      </motion.button>

      {/* 하단 팁 */}
      <motion.p
        className='mt-6 text-sm text-gray-400 dark:text-gray-500'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        💡 Tip: 보드를 만들면 기본 리스트가 자동으로 생성됩니다
      </motion.p>
    </motion.div>
  )
}
