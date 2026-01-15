import type { Tag, Member, ListWithCards } from '@/types'

// Mock tags
export const mockTags: Tag[] = [
  { id: 'tag-1', name: 'Design', color: 'blue' },
  { id: 'tag-2', name: 'Development', color: 'green' },
  { id: 'tag-3', name: 'Bug', color: 'red' },
  { id: 'tag-4', name: 'Feature', color: 'purple' },
  { id: 'tag-5', name: 'Testing', color: 'yellow' },
  { id: 'tag-6', name: 'Documentation', color: 'orange' },
  { id: 'tag-7', name: 'Review', color: 'pink' },
]

// Mock members (using pravatar.cc for avatars)
export const mockMembers: Member[] = [
  { id: 'member-1', name: 'Alice Kim', avatar: 'https://i.pravatar.cc/150?u=alice' },
  { id: 'member-2', name: 'Bob Lee', avatar: 'https://i.pravatar.cc/150?u=bob' },
  { id: 'member-3', name: 'Charlie Park', avatar: 'https://i.pravatar.cc/150?u=charlie' },
  { id: 'member-4', name: 'Diana Choi', avatar: 'https://i.pravatar.cc/150?u=diana' },
  { id: 'member-5', name: 'Ethan Jung', avatar: 'https://i.pravatar.cc/150?u=ethan' },
]

// Sample cover images (from picsum.photos)
export const sampleCoverImages = [
  'https://picsum.photos/seed/card1/400/160',
  'https://picsum.photos/seed/card2/400/160',
  'https://picsum.photos/seed/card3/400/160',
  'https://picsum.photos/seed/card4/400/160',
  'https://picsum.photos/seed/card5/400/160',
]

// Helper to get random items from array
export function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Helper to get random number in range
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper to get random boolean with probability
function randomBoolean(probability: number): boolean {
  return Math.random() < probability
}

/**
 * 카드에 데모용 목업 데이터 추가
 */
export function enrichCardsWithMockData(lists: ListWithCards[]): ListWithCards[] {
  return lists.map((list) => ({
    ...list,
    cards: list.cards.map((card, index) => {
      // 랜덤 태그 (0-3개)
      const tagCount = randomInt(0, 3)
      const tags = tagCount > 0 ? getRandomItems(mockTags, tagCount) : undefined

      // 랜덤 멤버 (0-3명)
      const memberCount = randomInt(0, 3)
      const members = memberCount > 0 ? getRandomItems(mockMembers, memberCount) : undefined

      // 커버 이미지 (30% 확률)
      const cover_image = randomBoolean(0.3)
        ? sampleCoverImages[index % sampleCoverImages.length]
        : undefined

      // 메트릭스
      const hasComments = randomBoolean(0.5)
      const hasAttachments = randomBoolean(0.4)
      const hasChecklist = randomBoolean(0.4)

      return {
        ...card,
        tags,
        members,
        cover_image,
        comments_count: hasComments ? randomInt(1, 8) : undefined,
        attachments_count: hasAttachments ? randomInt(1, 4) : undefined,
        checklist_completed: hasChecklist ? randomInt(0, 5) : undefined,
        checklist_total: hasChecklist ? randomInt(3, 8) : undefined,
      }
    }),
  }))
}
