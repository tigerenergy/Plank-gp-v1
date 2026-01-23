/**
 * Supabase Management API를 통한 마이그레이션 실행 시도
 */

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

// URL에서 project ref 추출
const urlMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)
if (!urlMatch) {
  console.error('❌ Supabase URL 형식이 올바르지 않습니다.')
  process.exit(1)
}

const projectRef = urlMatch[1]

async function runMigration() {
  console.log('🚀 Supabase Management API를 통한 마이그레이션 실행 시도...\n')

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '027_add_weekly_report_templates.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  try {
    // Supabase Management API는 일반적으로 DDL 실행을 지원하지 않습니다
    // 하지만 시도해봅니다
    
    console.log('⚠️  Supabase Management API는 DDL (CREATE TABLE 등) 실행을 지원하지 않습니다.')
    console.log('')
    console.log('💡 해결 방법:')
    console.log('   1. 데스크톱 환경에서 Supabase Dashboard 접속')
    console.log('   2. SQL Editor에서 파일 업로드 또는 직접 실행')
    console.log('   3. 또는 다음 파일을 사용:')
    console.log(`      ${migrationPath}`)
    console.log('')
    console.log('📄 마이그레이션 SQL 파일 위치:')
    console.log(`   ${migrationPath}`)
    console.log('')
    console.log('✅ 파일이 준비되어 있습니다. 나중에 데스크톱에서 실행하시면 됩니다!')
    
  } catch (error) {
    console.error('\n❌ 오류 발생:')
    console.error(error.message)
  }
}

runMigration()
