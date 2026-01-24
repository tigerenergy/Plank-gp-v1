/**
 * Supabase CLI를 사용한 마이그레이션 실행
 * 
 * 사용법:
 *   node scripts/run-migration-supabase-cli.js
 * 
 * 또는 package.json에 추가:
 *   "migrate": "node scripts/run-migration-supabase-cli.js"
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 Supabase CLI를 통한 마이그레이션 실행\n')

// Supabase CLI 설치 확인
try {
  execSync('supabase --version', { stdio: 'ignore' })
  console.log('✅ Supabase CLI가 설치되어 있습니다.\n')
} catch (error) {
  console.error('❌ Supabase CLI가 설치되어 있지 않습니다.')
  console.error('\n설치 방법:')
  console.error('  npm install -g supabase')
  console.error('  또는')
  console.error('  npx supabase --version')
  process.exit(1)
}

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

console.log(`📄 발견된 마이그레이션 파일: ${migrationFiles.length}개\n`)

// Supabase 프로젝트 연결 확인
try {
  const linkCheck = execSync('supabase projects list', { encoding: 'utf-8', stdio: 'pipe' })
  console.log('✅ Supabase에 로그인되어 있습니다.\n')
} catch (error) {
  console.error('❌ Supabase에 로그인되어 있지 않습니다.')
  console.error('\n로그인 방법:')
  console.error('  supabase login')
  process.exit(1)
}

// 마이그레이션 실행
try {
  console.log('📤 마이그레이션을 Supabase에 푸시하는 중...\n')
  
  // supabase db push 실행
  execSync('supabase db push', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  })
  
  console.log('\n✅ 마이그레이션이 성공적으로 완료되었습니다!')
} catch (error) {
  console.error('\n❌ 마이그레이션 실행 중 오류가 발생했습니다.')
  console.error('\n해결 방법:')
  console.error('  1. supabase login - Supabase에 로그인')
  console.error('  2. supabase link --project-ref YOUR_PROJECT_REF - 프로젝트 연결')
  console.error('  3. supabase db push - 마이그레이션 실행')
  process.exit(1)
}
