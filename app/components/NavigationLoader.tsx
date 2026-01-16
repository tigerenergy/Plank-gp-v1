'use client'

import { useEffect } from 'react'
import Image from 'next/image'
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
            {/* Plank 로고 */}
            <Image
              src='/blackLogo.png'
              alt='Plank'
              width={120}
              height={40}
              className='h-10 w-auto dark:hidden'
              priority
            />
            <Image
              src='/whiteLogo.png'
              alt='Plank'
              width={120}
              height={40}
              className='h-10 w-auto hidden dark:block'
              priority
            />

            {/* 스피너 */}
            <div className='flex gap-1.5'>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className='w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full'
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
