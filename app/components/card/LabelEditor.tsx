'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Tag } from 'lucide-react'
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
          const colorInfo = LABEL_COLORS.find((c) => c.color === label.color) || LABEL_COLORS[5]
          return (
            <motion.span
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colorInfo.bg} ${colorInfo.text}`}
            >
              {label.name}
              <button
                type='button'
                onClick={() => handleRemoveLabel(idx)}
                className='hover:opacity-70'
              >
                <X className='w-3 h-3' />
              </button>
            </motion.span>
          )
        })}

        {/* 라벨 추가 버튼 */}
        {!isAdding && (
          <button
            type='button'
            onClick={() => setIsAdding(true)}
            className='inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                     bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400
                     hover:bg-gray-200 dark:hover:bg-white/20 transition-colors'
          >
            <Plus className='w-3 h-3' />
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
            className='space-y-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg'
          >
            <input
              type='text'
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='라벨 이름...'
              className='w-full px-3 py-1.5 bg-white dark:bg-[#252542] border border-gray-300 dark:border-white/10 
                       rounded text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400
                       focus:outline-none focus:border-violet-500'
              autoFocus
            />

            {/* 색상 선택 */}
            <div className='flex flex-wrap gap-1.5'>
              {LABEL_COLORS.map((colorOption) => (
                <button
                  key={colorOption.color}
                  type='button'
                  onClick={() => setSelectedColor(colorOption.color)}
                  className={`w-6 h-6 rounded ${colorOption.bg} ${
                    selectedColor === colorOption.color
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-white/50 dark:ring-offset-gray-800'
                      : ''
                  }`}
                  title={colorOption.name}
                />
              ))}
            </div>

            {/* 버튼 */}
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={handleAddLabel}
                disabled={!newLabelName.trim()}
                className='px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded
                         disabled:opacity-50 disabled:cursor-not-allowed'
              >
                추가
              </button>
              <button
                type='button'
                onClick={() => {
                  setIsAdding(false)
                  setNewLabelName('')
                }}
                className='px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs'
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
