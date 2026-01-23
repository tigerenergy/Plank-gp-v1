/**
 * 주간보고 템플릿 마이그레이션 실행 스크립트 (개선 버전)
 * 
 * .env.local 파일에서 환경 변수를 읽어서 Supabase에 직접 SQL을 실행합니다.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// .env.local 파일 직접 파싱
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local 파일을 찾을 수 없습니다.')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    line = line.trim()
    // 주석 제거
    if (line.startsWith('#')) return
    // 빈 줄 제거
    if (!line) return
    
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // 따옴표 제거
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      env[key] = value
    }
  })
  
  return env
}

const env = loadEnvFile()

const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

console.log('📋 환경 변수 확인:')
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}`)
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨' : '❌ 없음'}\n`)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 오류: Supabase URL과 Service Role Key가 필요합니다.')
  console.error('')
  console.error('.env.local 파일에 다음이 포함되어 있는지 확인하세요:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
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
    // 전체 SQL을 한 번에 실행 (Supabase는 여러 문장을 한 번에 실행 가능)
    console.log('📝 SQL 마이그레이션 실행 중...\n')
    
    // Supabase는 직접 SQL 실행을 지원하지 않으므로, 
    // 각 SQL 문장을 개별적으로 실행해야 합니다.
    // 하지만 CREATE TABLE, CREATE INDEX 등은 REST API로 직접 실행할 수 없습니다.
    
    // 대신 Supabase Management API를 사용하거나,
    // 사용자에게 Supabase Dashboard에서 직접 실행하도록 안내해야 합니다.
    
    console.log('⚠️  Supabase REST API는 DDL (CREATE TABLE 등) 실행을 지원하지 않습니다.')
    console.log('')
    console.log('💡 해결 방법:')
    console.log('   1. Supabase Dashboard (https://supabase.com/dashboard) 접속')
    console.log('   2. 프로젝트 선택')
    console.log('   3. 좌측 메뉴에서 "SQL Editor" 클릭')
    console.log('   4. "New query" 클릭')
    console.log('   5. 아래 SQL을 복사하여 붙여넣기 후 "Run" 클릭')
    console.log('')
    console.log('📄 마이그레이션 SQL:')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    
    // 또는 exec_sql 함수가 있다면 시도
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
      if (error) {
        console.log('\n❌ exec_sql 함수가 없거나 실행에 실패했습니다.')
        console.log('   Supabase Dashboard에서 직접 실행해주세요.')
      } else {
        console.log('\n✅ 마이그레이션 완료!')
      }
    } catch (err) {
      console.log('\n❌ exec_sql 함수가 없습니다.')
      console.log('   Supabase Dashboard에서 직접 실행해주세요.')
    }
    
  } catch (error) {
    console.error('\n❌ 마이그레이션 실행 중 오류 발생:')
    console.error(error.message)
    console.error('\n💡 해결 방법:')
    console.error('   Supabase Dashboard > SQL Editor에서 마이그레이션 파일을 직접 실행하세요.')
    process.exit(1)
  }
}

runMigration()
