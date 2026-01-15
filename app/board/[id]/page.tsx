import { getUser } from '@/app/actions/auth'
import BoardClient from './BoardClient'

export default async function BoardPage() {
  const user = await getUser()
  return <BoardClient user={user} />
}
