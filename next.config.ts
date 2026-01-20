import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 🚀 Barrel Import 최적화 - 직접 import로 변환하여 번들 크기 감소
  // lucide-react: 1,583 모듈 → 사용하는 아이콘만 로드
  // framer-motion: 무거운 애니메이션 라이브러리 최적화
  // recharts: 차트 라이브러리 최적화
  // @dnd-kit: 드래그앤드롭 라이브러리 최적화
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'date-fns',
      'react-day-picker',
    ],
  },
  // 개발 환경에서 다른 기기에서 접속 허용
  allowedDevOrigins: ['http://192.168.1.53:3000', 'http://192.168.1.53:3001'],
}

export default nextConfig
