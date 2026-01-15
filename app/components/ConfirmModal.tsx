'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEscapeClose } from '@/hooks'
import { fadeIn, zoomIn, easeTransition } from '@/lib/animations'

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
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEscapeClose(onCancel, isOpen)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel()
  }

  const variantStyles = {
    danger: 'bg-red-900/20 border-red-500/30',
    warning: 'bg-amber-900/20 border-amber-500/30',
    default: 'bg-bg-secondary border-white/10',
  }

  const confirmButtonStyles = {
    danger: 'bg-red-600 hover:bg-red-500',
    warning: 'bg-amber-600 hover:bg-amber-500',
    default: 'bg-violet-600 hover:bg-violet-500',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm'
          onClick={handleBackdropClick}
          variants={fadeIn}
          initial='initial'
          animate='animate'
          exit='exit'
          transition={easeTransition}
        >
          <motion.div
            ref={modalRef}
            className={`w-full max-w-sm rounded-xl p-6 shadow-2xl border ${variantStyles[variant]}`}
            variants={zoomIn}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={easeTransition}
          >
            <h3
              className={`text-lg font-bold mb-3 ${variant === 'danger' ? 'text-red-400' : 'text-text-primary'}`}
            >
              {title}
            </h3>
            <p className='text-sm text-text-tertiary mb-6'>{message}</p>
            <div className='flex gap-3 justify-end'>
              <motion.button
                onClick={onCancel}
                className='px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-text-secondary hover:bg-white/10 transition-colors'
                whileTap={{ scale: 0.95 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${confirmButtonStyles[variant]}`}
                whileTap={{ scale: 0.95 }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
