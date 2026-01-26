'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function WeeklyReportNewLoading() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='flex flex-col items-center gap-4'
      >
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
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        <p className='text-sm text-slate-500 dark:text-slate-400 mt-2'>
          주간보고 불러오는 중...
        </p>
      </motion.div>
    </div>
  )
}
