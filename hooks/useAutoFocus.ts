import { useEffect, RefObject } from 'react'

/**
 * 자동 포커스 훅
 */
export function useAutoFocus<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled = true,
  selectAll = false
) {
  useEffect(() => {
    if (!enabled || !ref.current) return

    ref.current.focus()

    if (selectAll && ref.current instanceof HTMLInputElement) {
      ref.current.select()
    }
  }, [ref, enabled, selectAll])
}
