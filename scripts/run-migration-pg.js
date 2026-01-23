/**
 * PostgreSQL 직접 연결을 통한 마이그레이션 실행
 */

const { Client } = require('pg')
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
    if (line.startsWith('#')) return
    if (!line) return
    
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
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

if (!SUPABASE_URL) {
  console.error('❌ Supabase URL이 필요합니다.')
  process.exit(1)
}

// Supabase URL에서 연결 정보 추출
// https://kjzddqqvqxodtokemwnf.supabase.co
const urlMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)
if (!urlMatch) {
  console.error('❌ Supabase URL 형식이 올바르지 않습니다.')
  process.exit(1)
}

const projectRef = urlMatch[1]

async function runMigration() {
  console.log('🚀 PostgreSQL 직접 연결을 통한 마이그레이션 실행 시도...\n')

  // Supabase는 직접 PostgreSQL 연결을 제한하므로,
  // Supabase Dashboard의 SQL Editor를 사용해야 합니다.
  
  console.log('⚠️  Supabase는 보안상의 이유로 직접 PostgreSQL 연결을 제한합니다.')
  console.log('')
  console.log('💡 해결 방법: Supabase Dashboard의 SQL Editor에서 직접 실행하세요.')
  console.log('')
  console.log('📋 실행 단계:')
  console.log('   1. https://supabase.com/dashboard 접속')
  console.log('   2. 프로젝트 선택')
  console.log('   3. 좌측 메뉴: SQL Editor 클릭')
  console.log('   4. New query 클릭')
  console.log('   5. 아래 SQL을 복사하여 붙여넣기')
  console.log('   6. Run 버튼 클릭')
  console.log('')
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '027_add_weekly_report_templates.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log('📄 마이그레이션 SQL (전체 복사):')
  console.log('─'.repeat(70))
  console.log(sql)
  console.log('─'.repeat(70))
  console.log('')
  console.log('✅ 위 SQL을 Supabase Dashboard의 SQL Editor에 붙여넣고 Run을 클릭하세요!')
}

runMigration()
