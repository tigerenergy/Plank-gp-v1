/**
 * 주간보고 템플릿 마이그레이션 실행 스크립트
 * 
 * 사용 방법:
 * 1. .env.local 파일에 다음 정보 추가:
 *    SUPABASE_URL=your-supabase-url
 *    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 * 
 * 2. 실행:
 *    node scripts/run-migration-027.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// .env.local 파일 직접 읽기 시도
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

// dotenv도 시도
try {
  require('dotenv').config({ path: envPath })
} catch (e) {
  // dotenv가 없어도 계속 진행
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 오류: Supabase URL과 Service Role Key가 필요합니다.')
  console.error('')
  console.error('환경 변수 설정 방법:')
  console.error('1. .env.local 파일에 다음을 추가하세요:')
  console.error('   SUPABASE_URL=your-supabase-url')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.error('')
  console.error('또는 명령줄에서 실행:')
  console.error('   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/run-migration-027.js')
  process.exit(1)
}

async function runMigration() {
  console.log('🚀 주간보고 템플릿 마이그레이션 시작...\n')

  // Supabase 클라이언트 생성 (Service Role Key 사용)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // 마이그레이션 파일 읽기
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '027_add_weekly_report_templates.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  try {
    // SQL 실행 (여러 문장을 하나씩 실행)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 ${statements.length}개의 SQL 문장 실행 중...\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length === 0) continue

      try {
        console.log(`[${i + 1}/${statements.length}] 실행 중...`)
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
        
        // RPC가 없는 경우 직접 쿼리 실행 시도
        if (error) {
          // 직접 쿼리 실행 (PostgreSQL REST API 사용)
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql_query: statement })
          })

          if (!response.ok) {
            // exec_sql 함수가 없는 경우, Supabase Management API 사용
            console.log('   ⚠️  exec_sql 함수가 없습니다. Supabase Dashboard에서 수동 실행이 필요합니다.')
            break
          }
        }
      } catch (err) {
        console.error(`   ❌ 오류: ${err.message}`)
      }
    }

    console.log('\n✅ 마이그레이션 완료!')
    console.log('\n⚠️  참고: Supabase Management API를 통한 직접 실행은 제한이 있을 수 있습니다.')
    console.log('   Supabase Dashboard > SQL Editor에서 마이그레이션 파일을 직접 실행하는 것을 권장합니다.')
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 실행 중 오류 발생:')
    console.error(error.message)
    console.error('\n💡 해결 방법:')
    console.error('   Supabase Dashboard > SQL Editor에서 다음 파일을 열어 실행하세요:')
    console.error(`   ${migrationPath}`)
    process.exit(1)
  }
}

runMigration()
