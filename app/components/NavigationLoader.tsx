'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigationStore } from '@/store/useNavigationStore'

export function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isNavigating, setNavigating } = useNavigationStore()

  // 라우트 변경 감지 → 로딩 종료
  useEffect(() => {
    setNavigating(false)
  }, [pathname, searchParams, setNavigating])

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className='fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='flex flex-col items-center gap-4'
          >
            {/* 로고 */}
            <div className='w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg'>
              <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2'
                />
              </svg>
            </div>

            {/* 스피너 */}
            <div className='flex gap-1.5'>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className='w-2 h-2 bg-violet-500 rounded-full'
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
