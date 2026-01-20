'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function BoardLoading() {
  return (
    <div className='h-[100dvh] flex flex-col bg-[rgb(var(--background))]'>
      {/* 헤더 스켈레톤 */}
      <div className='h-14 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse' />
          <div className='w-32 h-5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse' />
        </div>
        <div className='w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse' />
      </div>

      {/* 콘텐츠 로딩 */}
      <div className='flex-1 flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
          <div className='flex gap-1'>
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
      </div>
    </div>
  )
}
