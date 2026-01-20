import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoard } from '@/app/actions/board'
import { CompletedPageClient } from './CompletedPageClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CompletedPage({ params }: PageProps) {
  const { id: boardId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const boardResult = await getBoard(boardId)

  if (!boardResult.success || !boardResult.data) {
    redirect('/')
  }

  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full' />
        </div>
      }
    >
      <CompletedPageClient board={boardResult.data} />
    </Suspense>
  )
}
