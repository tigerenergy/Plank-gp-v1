import { useEffect } from 'react'

type KeyHandler = () => void

interface KeyMap {
  Enter?: KeyHandler
  Escape?: KeyHandler
  [key: string]: KeyHandler | undefined
}

/**
 * 키보드 단축키 훅
 */
export function useKeyboard(keyMap: KeyMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = keyMap[e.key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [keyMap, enabled])
}

/**
 * ESC 키로 닫기 훅
 */
export function useEscapeClose(onClose: () => void, enabled = true) {
  useKeyboard({ Escape: onClose }, enabled)
}
