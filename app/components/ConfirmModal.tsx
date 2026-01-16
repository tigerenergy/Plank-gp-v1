'use client'

import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '계속하기',
  cancelText = '돌아가기',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    default: {
      icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
      button: 'btn-primary',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150'
      onClick={onCancel}
    >
      <div
        className='w-full max-w-md bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150'
        style={{ boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className='flex items-start gap-4 p-5'>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
            <AlertTriangle className='w-6 h-6' />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='text-base font-bold text-[rgb(var(--foreground))]'>{title}</h3>
            <p className='mt-2 text-sm text-[rgb(var(--muted-foreground))] leading-relaxed'>
              {message}
            </p>
          </div>
          <button onClick={onCancel} className='p-1.5 rounded-lg btn-ghost flex-shrink-0'>
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* 버튼 */}
        <div className='flex justify-end gap-2 px-5 py-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/50'>
          <button onClick={onCancel} className='btn-secondary px-4 py-2.5 text-sm'>
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${styles.button}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
