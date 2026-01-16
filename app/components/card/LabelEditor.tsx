'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check } from 'lucide-react'
import type { Label, LabelColor } from '@/types'
import { LABEL_COLORS } from '@/types'

interface LabelEditorProps {
  labels: Label[]
  onChange: (labels: Label[]) => void
}

export function LabelEditor({ labels, onChange }: LabelEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [selectedColor, setSelectedColor] = useState<LabelColor>('blue')

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return
    
    const newLabel: Label = {
      name: newLabelName.trim(),
      color: selectedColor,
    }
    
    onChange([...labels, newLabel])
    setNewLabelName('')
    setIsAdding(false)
  }

  const handleRemoveLabel = (index: number) => {
    onChange(labels.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddLabel()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewLabelName('')
    }
  }

  return (
    <div className='space-y-3'>
      {/* 현재 라벨 목록 */}
      <div className='flex flex-wrap gap-2'>
        {labels.map((label, idx) => {
          const colorInfo = LABEL_COLORS.find((c) => c.color === label.color) || LABEL_COLORS[4]
          const isLightColor = label.color === 'yellow'
          return (
            <motion.span
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ backgroundColor: colorInfo.hex }}
              className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${isLightColor ? 'text-yellow-900' : 'text-white'}`}
            >
              {label.name}
              <button
                type='button'
                onClick={() => handleRemoveLabel(idx)}
                className='opacity-70 hover:opacity-100 transition-opacity'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            </motion.span>
          )
        })}

        {/* 라벨 추가 버튼 */}
        {!isAdding && (
          <button
            type='button'
            onClick={() => setIsAdding(true)}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]
                     hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors'
          >
            <Plus className='w-3.5 h-3.5' />
            라벨 추가
          </button>
        )}
      </div>

      {/* 라벨 추가 폼 */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='space-y-3 p-4 bg-[rgb(var(--secondary))] rounded-xl'
          >
            <input
              type='text'
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='라벨 이름...'
              className='w-full px-4 py-2.5 rounded-xl input text-sm'
              autoFocus
            />

            {/* 색상 선택 */}
            <div className='flex gap-2'>
              {LABEL_COLORS.map((colorOption) => (
                <button
                  key={colorOption.color}
                  type='button'
                  onClick={() => setSelectedColor(colorOption.color)}
                  style={{ backgroundColor: colorOption.hex }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    selectedColor === colorOption.color
                      ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-[rgb(var(--secondary))]'
                      : 'hover:scale-110'
                  }`}
                  title={colorOption.name}
                >
                  {selectedColor === colorOption.color && (
                    <Check className='w-4 h-4 text-white' />
                  )}
                </button>
              ))}
            </div>

            {/* 버튼 */}
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={handleAddLabel}
                disabled={!newLabelName.trim()}
                className='btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
              >
                추가
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsAdding(false)
                  setNewLabelName('')
                }}
                className='btn-secondary px-4 py-2 text-sm'
              >
                취소
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
