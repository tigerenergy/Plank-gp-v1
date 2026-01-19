'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

// 🚀 React.cache(): 동일 요청 내에서 중복 호출 방지 (per-request deduplication)
export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
})
