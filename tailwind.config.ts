import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // 색상 시스템
      colors: {
        // CSS 변수 기반 (라이트/다크 모드 지원)
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',

        // 다크 모드 배경 (하위호환)
        bg: {
          primary: '#0f0f1a',
          secondary: '#1a1a2e',
          tertiary: '#252542',
          card: '#2a2a45',
          'card-hover': '#353555',
        },
        // 텍스트 계층 (하위호환)
        text: {
          primary: '#f3f4f6',
          secondary: '#d1d5db',
          tertiary: '#9ca3af',
          muted: '#6b7280',
        },
        // 파스텔 포인트 컬러
        pastel: {
          rose: '#f9a8d4',
          amber: '#fcd34d',
          sky: '#7dd3fc',
          emerald: '#6ee7b7',
          violet: '#c4b5fd',
        },
        // 컬럼 그라데이션 색상
        column: {
          pink: { start: '#f9a8d4', end: '#fce7f3', accent: '#ec4899' },
          blue: { start: '#60a5fa', end: '#dbeafe', accent: '#3b82f6' },
          cyan: { start: '#22d3ee', end: '#cffafe', accent: '#06b6d4' },
          green: { start: '#4ade80', end: '#dcfce7', accent: '#22c55e' },
          violet: { start: '#c4b5fd', end: '#ede9fe', accent: '#8b5cf6' },
        },
        // 보드 색상
        board: {
          dark: '#0f172a',
          darker: '#020617',
          card: '#1e293b',
        },
        // 태그 색상
        tag: {
          red: '#ef4444',
          orange: '#f97316',
          amber: '#f59e0b',
          green: '#22c55e',
          blue: '#3b82f6',
          purple: '#a855f7',
          pink: '#ec4899',
        },
      },

      // 폰트 패밀리
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Pretendard', 'Noto Sans KR', 'sans-serif'],
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
      },

      // 폰트 사이즈 (앱 전체 기준 - 기본보다 약간 크게)
      fontSize: {
        'xs': ['13px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.5' }],
        'xl': ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.35' }],
        '3xl': ['30px', { lineHeight: '1.3' }],
        '4xl': ['36px', { lineHeight: '1.25' }],
        // 커스텀 사이즈
        'title': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'subtitle': ['17px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.6' }],
        'caption': ['13px', { lineHeight: '1.5' }],
        'small': ['12px', { lineHeight: '1.5' }],
      },

      // 배경 그라데이션
      backgroundImage: {
        'gradient-pink': 'linear-gradient(180deg, #f9a8d4 0%, #fce7f3 100%)',
        'gradient-blue': 'linear-gradient(180deg, #60a5fa 0%, #dbeafe 100%)',
        'gradient-cyan': 'linear-gradient(180deg, #22d3ee 0%, #cffafe 100%)',
        'gradient-green': 'linear-gradient(180deg, #4ade80 0%, #dcfce7 100%)',
        'gradient-violet': 'linear-gradient(180deg, #c4b5fd 0%, #ede9fe 100%)',
        'board-pattern': 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
      },

      // 박스 섀도우
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 20px rgba(0, 0, 0, 0.15)',
        column: '0 4px 20px rgba(0, 0, 0, 0.1)',
        'column-dark': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'drag-overlay': '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(139, 92, 246, 0.5)',
        modal: '0 25px 60px rgba(0, 0, 0, 0.5)',
        dropdown: '0 10px 40px rgba(0, 0, 0, 0.3)',
      },

      // 펄스 애니메이션 (날짜 뱃지용 - CSS가 더 효율적)
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-glow-red': 'pulseGlowRed 1.5s ease-in-out infinite',
        // 3D 플로팅 애니메이션
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 4s ease-in-out infinite',
        'float-slower': 'float 5s ease-in-out infinite 0.5s',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'bounce-slower': 'bounceSlow 2.5s ease-in-out infinite 0.3s',
        'spin-slow': 'spin 15s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251, 191, 36, 0)' },
          '50%': { boxShadow: '0 0 8px 2px rgba(251, 191, 36, 0.3)' },
        },
        pulseGlowRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
          '50%': { boxShadow: '0 0 8px 2px rgba(239, 68, 68, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateZ(20px)' },
          '50%': { transform: 'translateY(-8px) translateZ(30px)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(12deg)' },
          '50%': { transform: 'translateY(-6px) rotate(12deg)' },
        },
      },

      // 보더 두께
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, addComponents }) => {
      // 유틸리티 클래스
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(255, 255, 255, 0.2) transparent',
          '-webkit-overflow-scrolling': 'touch',
        },
        '.draggable': {
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        },
      })

      // 컴포넌트 클래스
      addComponents({
        // 글래스 효과
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },

        // 컬럼 스타일
        '.column-dark': {
          background: 'rgba(26, 26, 46, 0.8)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
        },

        // 드래그 오버레이
        '.drag-overlay': {
          transform: 'scale(1.05) rotate(2deg)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(139, 92, 246, 0.5)',
          zIndex: '9999',
        },

        // 드롭 플레이스홀더
        '.drop-placeholder': {
          borderRadius: '0.75rem',
          border: '2px dashed rgba(139, 92, 246, 0.5)',
          background: 'rgba(139, 92, 246, 0.1)',
          minHeight: '60px',
        },

        // 태그 스타일
        '.tag-pill': {
          padding: '0.125rem 0.5rem',
          borderRadius: '0.375rem',
          fontSize: '11px',
          fontWeight: '500',
        },
        '.tag-blue': { background: '#dbeafe', color: '#1d4ed8' },
        '.tag-green': { background: '#dcfce7', color: '#15803d' },
        '.tag-yellow': { background: '#fef3c7', color: '#a16207' },
        '.tag-red': { background: '#fee2e2', color: '#b91c1c' },
        '.tag-purple': { background: '#f3e8ff', color: '#7e22ce' },
        '.tag-pink': { background: '#fce7f3', color: '#be185d' },
        '.tag-orange': { background: '#ffedd5', color: '#c2410c' },

        // 날짜 뱃지
        '.date-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.25rem 0.625rem',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          border: '1px solid transparent',
        },
        '.date-badge-normal': {
          background:
            'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
        },
        '.date-badge-soon': {
          background:
            'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
          borderColor: 'rgba(251, 191, 36, 0.4)',
          color: '#fcd34d',
          animation: 'pulseGlow 2s ease-in-out infinite',
        },
        '.date-badge-overdue': {
          background:
            'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.2) 100%)',
          borderColor: 'rgba(239, 68, 68, 0.5)',
          color: '#fca5a5',
          animation: 'pulseGlowRed 1.5s ease-in-out infinite',
        },

        // 컬럼 그라데이션
        '.column-glass-rose': {
          background:
            'linear-gradient(180deg, rgba(26, 26, 46, 0.9) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderTop: '3px solid #f9a8d4',
        },
        '.column-glass-amber': {
          background:
            'linear-gradient(180deg, rgba(26, 26, 46, 0.9) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderTop: '3px solid #fcd34d',
        },
        '.column-glass-sky': {
          background:
            'linear-gradient(180deg, rgba(26, 26, 46, 0.9) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderTop: '3px solid #7dd3fc',
        },
        '.column-glass-emerald': {
          background:
            'linear-gradient(180deg, rgba(26, 26, 46, 0.9) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderTop: '3px solid #6ee7b7',
        },
        '.column-glass-violet': {
          background:
            'linear-gradient(180deg, rgba(26, 26, 46, 0.9) 0%, rgba(26, 26, 46, 0.95) 100%)',
          borderTop: '3px solid #c4b5fd',
        },

        // 배지 색상
        '.badge-rose': { background: 'rgba(249, 168, 212, 0.2)', color: '#f9a8d4' },
        '.badge-amber': { background: 'rgba(252, 211, 77, 0.2)', color: '#fcd34d' },
        '.badge-sky': { background: 'rgba(125, 211, 252, 0.2)', color: '#7dd3fc' },
        '.badge-emerald': { background: 'rgba(110, 231, 183, 0.2)', color: '#6ee7b7' },
        '.badge-violet': { background: 'rgba(196, 181, 253, 0.2)', color: '#c4b5fd' },
      })
    }),
  ],
}

export default config
