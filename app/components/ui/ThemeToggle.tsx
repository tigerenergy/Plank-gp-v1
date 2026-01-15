'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className='w-10 h-10 rounded-xl bg-[rgb(var(--secondary))]' />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='w-10 h-10 rounded-xl flex items-center justify-center btn-ghost border border-[rgb(var(--border))]'
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? (
        <Sun className='w-4 h-4 text-amber-400' />
      ) : (
        <Moon className='w-4 h-4 text-slate-500' />
      )}
    </button>
  )
}
