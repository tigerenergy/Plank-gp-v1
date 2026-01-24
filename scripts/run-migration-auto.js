/**
 * .env.local 파일에서 정보를 읽어 자동으로 마이그레이션 실행
 * 
 * 사용법:
 *   node scripts/run-migration-auto.js
 * 
 * 또는:
 *   npm run migrate
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 자동 마이그레이션 실행\n')

// .env.local 파일 읽기
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

if (!SUPABASE_URL) {
  console.error('❌ .env.local에 SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL이 없습니다.')
  process.exit(1)
}

// URL에서 프로젝트 REF 추출
// https://abcdefghijklmnop.supabase.co -> abcdefghijklmnop
const urlMatch = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)
if (!urlMatch) {
  console.error('❌ Supabase URL 형식이 올바르지 않습니다.')
  console.error(`   URL: ${SUPABASE_URL}`)
  process.exit(1)
}

const projectRef = urlMatch[1]
console.log(`📋 프로젝트 REF: ${projectRef}\n`)

// Supabase CLI 확인 (npx로 실행하므로 설치 불필요)
console.log('✅ npx를 통해 Supabase CLI를 사용합니다.\n')

// 마이그레이션 파일 확인
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
if (!fs.existsSync(migrationsDir)) {
  console.error(`❌ 마이그레이션 디렉토리를 찾을 수 없습니다: ${migrationsDir}`)
  process.exit(1)
}

const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort()

if (migrationFiles.length === 0) {
  console.error('❌ 마이그레이션 파일이 없습니다.')
  process.exit(1)
}

console.log(`📄 발견된 마이그레이션 파일: ${migrationFiles.length}개`)
migrationFiles.forEach(file => {
  console.log(`   - ${file}`)
})
console.log()

// Supabase 로그인 확인 및 자동 로그인 시도
try {
  execSync('npx supabase projects list', { encoding: 'utf-8', stdio: 'pipe' })
  console.log('✅ Supabase에 로그인되어 있습니다.\n')
} catch (error) {
  console.log('⚠️  Supabase에 로그인되어 있지 않습니다.')
  console.log('📝 로그인을 진행합니다...\n')
  try {
    execSync('npx supabase login', { stdio: 'inherit' })
    console.log('\n✅ 로그인 완료\n')
  } catch (loginError) {
    console.error('\n❌ 로그인 실패')
    console.error('수동 로그인: npm run migrate:login')
    process.exit(1)
  }
}

// 프로젝트 연결 확인 및 자동 연결
const supabaseConfigPath = path.join(__dirname, '..', '.supabase', 'config.toml')
let isLinked = false

if (fs.existsSync(supabaseConfigPath)) {
  try {
    const configContent = fs.readFileSync(supabaseConfigPath, 'utf-8')
    if (configContent.includes(`project_id = "${projectRef}"`)) {
      isLinked = true
      console.log('✅ 프로젝트가 이미 연결되어 있습니다.\n')
    }
  } catch (error) {
    // config 파일 읽기 실패는 무시
  }
}

if (!isLinked) {
  console.log('🔗 프로젝트 연결 중...\n')
  try {
    execSync(`npx supabase link --project-ref ${projectRef}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    })
    console.log('\n✅ 프로젝트 연결 완료\n')
  } catch (linkError) {
    console.error('\n❌ 프로젝트 연결 실패')
    console.error(`수동 연결: npx supabase link --project-ref ${projectRef}`)
    process.exit(1)
  }
}

// 마이그레이션 실행
try {
  console.log('📤 마이그레이션을 Supabase에 푸시하는 중...\n')
  
  execSync('npx supabase db push', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  })
  
  console.log('\n✅ 마이그레이션이 성공적으로 완료되었습니다!')
  console.log('\n📊 마이그레이션 상태 확인:')
  execSync('npx supabase migration list', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  })
} catch (error) {
  console.error('\n❌ 마이그레이션 실행 중 오류가 발생했습니다.')
  console.error('\n해결 방법:')
  console.error('  1. Supabase Dashboard에서 수동 실행')
  console.error('  2. 또는 다음 명령어로 재시도:')
  console.error(`     npx supabase link --project-ref ${projectRef}`)
  console.error('     npx supabase db push')
  process.exit(1)
}
