'use client'

import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  return (
    <div className='min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-900'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='w-full max-w-sm mx-4'
      >
        <div className='bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm'>
          {/* 로고 & 타이틀 */}
          <div className='text-center mb-8'>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className='flex justify-center mb-4'
            >
              {/* 라이트 모드 로고 */}
              <Image
                src='/blackLogo.png'
                alt='Plank'
                width={140}
                height={48}
                className='h-12 w-auto dark:hidden'
                priority
              />
              {/* 다크 모드 로고 */}
              <Image
                src='/whiteLogo.png'
                alt='Plank'
                width={140}
                height={48}
                className='h-12 w-auto hidden dark:block'
                priority
              />
            </motion.div>
            <p className='text-slate-500 dark:text-slate-400 text-sm tracking-wide'>
              팀과 함께 성장하는 협업 공간
            </p>
          </div>

          {/* Google 로그인 버튼 */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            className='w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white text-sm font-medium tracking-wide rounded-xl border border-slate-200 dark:border-slate-600 transition-colors shadow-sm'
          >
            <svg className='w-5 h-5' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Google로 계속하기
          </motion.button>

          {/* 안내 문구 */}
          <p className='mt-6 text-center text-[11px] text-slate-400 leading-relaxed tracking-wide'>
            로그인하면{' '}
            <span className='text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer underline underline-offset-2'>
              서비스 이용약관
            </span>
            과{' '}
            <span className='text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer underline underline-offset-2'>
              개인정보 처리방침
            </span>
            에 동의하게 됩니다.
          </p>
        </div>

        {/* 하단 */}
        <p className='mt-6 text-center text-[11px] text-slate-400 tracking-wide'>© 2026 Plank</p>
      </motion.div>
    </div>
  )
}
