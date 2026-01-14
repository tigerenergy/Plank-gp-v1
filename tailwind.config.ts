import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 컬럼 그라데이션 색상
        column: {
          pink: {
            start: '#f9a8d4',
            end: '#fce7f3',
            accent: '#ec4899',
          },
          blue: {
            start: '#60a5fa',
            end: '#dbeafe',
            accent: '#3b82f6',
          },
          cyan: {
            start: '#22d3ee',
            end: '#cffafe',
            accent: '#06b6d4',
          },
          green: {
            start: '#4ade80',
            end: '#dcfce7',
            accent: '#22c55e',
          },
          violet: {
            start: '#c4b5fd',
            end: '#ede9fe',
            accent: '#8b5cf6',
          },
        },
        // 다크 모드 배경
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
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Pretendard', 'Noto Sans KR', 'sans-serif'],
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-pink': 'linear-gradient(180deg, #f9a8d4 0%, #fce7f3 100%)',
        'gradient-blue': 'linear-gradient(180deg, #60a5fa 0%, #dbeafe 100%)',
        'gradient-cyan': 'linear-gradient(180deg, #22d3ee 0%, #cffafe 100%)',
        'gradient-green': 'linear-gradient(180deg, #4ade80 0%, #dcfce7 100%)',
        'gradient-violet': 'linear-gradient(180deg, #c4b5fd 0%, #ede9fe 100%)',
        'board-pattern': 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 20px rgba(0, 0, 0, 0.15)',
        'column': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
