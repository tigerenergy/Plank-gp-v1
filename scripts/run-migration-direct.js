/**
 * 주간보고 템플릿 마이그레이션 직접 실행 스크립트
 * PostgreSQL 연결을 통해 직접 실행 시도
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
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase URL과 Service Role Key가 필요합니다.')
  process.exit(1)
}

async function runMigration() {
  console.log('🚀 주간보고 템플릿 마이그레이션 실행 시도...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '027_add_weekly_report_templates.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  try {
    // Supabase Management API를 통한 실행 시도
    // 하지만 일반적으로는 지원하지 않으므로, 사용자에게 안내
    console.log('⚠️  Supabase REST API는 DDL (CREATE TABLE 등) 실행을 지원하지 않습니다.')
    console.log('')
    console.log('💡 해결 방법: Supabase Dashboard에서 직접 실행하세요.')
    console.log('')
    console.log('📋 실행 단계:')
    console.log('   1. https://supabase.com/dashboard 접속')
    console.log('   2. 프로젝트 선택')
    console.log('   3. 좌측 메뉴: SQL Editor 클릭')
    console.log('   4. New query 클릭')
    console.log('   5. 아래 SQL을 복사하여 붙여넣기')
    console.log('   6. Run 버튼 클릭')
    console.log('')
    console.log('📄 마이그레이션 SQL:')
    console.log('─'.repeat(70))
    console.log(sql)
    console.log('─'.repeat(70))
    
  } catch (error) {
    console.error('\n❌ 오류 발생:')
    console.error(error.message)
  }
}

runMigration()
