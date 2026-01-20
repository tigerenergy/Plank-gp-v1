import { z } from 'zod'

// 카드 생성 스키마
export const createCardSchema = z.object({
  list_id: z.string().uuid({ message: '유효하지 않은 리스트 ID입니다.' }),
  title: z
    .string()
    .min(1, { message: '제목을 입력해주세요.' })
    .max(200, { message: '제목은 200자 이내로 입력해주세요.' }),
  description: z
    .string()
    .max(2000, { message: '설명은 2000자 이내로 입력해주세요.' })
    .optional(),
  due_date: z.string().optional(),
})

// 카드 수정 스키마
export const updateCardSchema = z.object({
  id: z.string().uuid({ message: '유효하지 않은 카드 ID입니다.' }),
  title: z
    .string()
    .min(1, { message: '제목을 입력해주세요.' })
    .max(200, { message: '제목은 200자 이내로 입력해주세요.' })
    .optional(),
  description: z
    .string()
    .max(2000, { message: '설명은 2000자 이내로 입력해주세요.' })
    .nullable()
    .optional(),
  start_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
})

// 카드 이동 스키마
export const moveCardSchema = z.object({
  cardId: z.string().uuid({ message: '유효하지 않은 카드 ID입니다.' }),
  targetListId: z.string().uuid({ message: '유효하지 않은 리스트 ID입니다.' }),
  newPosition: z.number({ message: '순서는 숫자여야 합니다.' }),
})

// 리스트 생성 스키마
export const createListSchema = z.object({
  board_id: z.string().uuid({ message: '유효하지 않은 보드 ID입니다.' }),
  title: z
    .string()
    .min(1, { message: '리스트 제목을 입력해주세요.' })
    .max(50, { message: '리스트 제목은 50자 이내로 입력해주세요.' }),
})

// 리스트 수정 스키마
export const updateListSchema = z.object({
  id: z.string().uuid({ message: '유효하지 않은 리스트 ID입니다.' }),
  title: z
    .string()
    .min(1, { message: '리스트 제목을 입력해주세요.' })
    .max(50, { message: '리스트 제목은 50자 이내로 입력해주세요.' })
    .optional(),
})

// 보드 생성 스키마
export const createBoardSchema = z.object({
  title: z
    .string()
    .min(1, { message: '보드 이름을 입력해주세요.' })
    .max(100, { message: '보드 이름은 100자 이내로 입력해주세요.' }),
  emoji: z.string().optional(),
  start_date: z
    .string()
    .min(1, { message: '시작일을 입력해주세요.' }),
  due_date: z
    .string()
    .min(1, { message: '마감일을 입력해주세요.' }),
})

// 스키마 타입 추론
export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type MoveCardInput = z.infer<typeof moveCardSchema>
export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type CreateBoardInput = z.infer<typeof createBoardSchema>
