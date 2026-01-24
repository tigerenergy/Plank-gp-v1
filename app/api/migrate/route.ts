/**
 * Vercel Post-Deploy Hook용 마이그레이션 API
 * 
 * 사용법:
 * 1. Vercel Dashboard → Project Settings → Git
 * 2. Post-Deploy Hook에 다음 URL 추가:
 *    https://your-domain.com/api/migrate
 * 3. SUPABASE_SERVICE_ROLE_KEY 환경 변수 설정
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { readdirSync } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// 보안: 특정 토큰으로만 실행 가능하도록
const MIGRATE_SECRET = process.env.MIGRATE_SECRET || 'your-secret-token'

export async function POST(request: Request) {
  try {
    // 보안 검증
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${MIGRATE_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    // Supabase 클라이언트 생성 (Service Role Key 사용)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 마이그레이션 파일 읽기
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort()

    const results = []

    for (const file of migrationFiles) {
      try {
        const sql = readFileSync(join(migrationsDir, file), 'utf-8')
        
        // SQL 실행 (주의: DDL은 직접 실행 불가능할 수 있음)
        // Supabase REST API는 DDL을 지원하지 않으므로
        // 이 방법은 제한적입니다.
        
        // 대신 Supabase Management API나 CLI를 사용해야 합니다.
        console.log(`Processing migration: ${file}`)
        
        results.push({
          file,
          status: 'skipped',
          message: 'DDL execution requires Supabase CLI or Management API',
        })
      } catch (error) {
        results.push({
          file,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration check completed',
      results,
      note: 'For DDL migrations, use Supabase CLI or Management API',
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET 요청으로 상태 확인
export async function GET() {
  return NextResponse.json({
    message: 'Migration API is running',
    note: 'Use POST with Bearer token to trigger migrations',
    migrationsDir: 'supabase/migrations',
  })
}
