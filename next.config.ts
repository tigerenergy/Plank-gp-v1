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
  // 개발 환경에서 다른 기기에서 접속 허용
  allowedDevOrigins: ['http://192.168.1.53:3000', 'http://192.168.1.53:3001'],
}

export default nextConfig
