'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '@/store/useNavigationStore'
import type { ComponentProps } from 'react'

type NavLinkProps = ComponentProps<typeof Link>

export function NavLink({ href, onClick, children, ...props }: NavLinkProps) {
  const pathname = usePathname()
  const setNavigating = useNavigationStore((s) => s.setNavigating)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 같은 페이지면 로딩 안 띄움
    const targetPath = typeof href === 'string' ? href : href.pathname
    if (targetPath !== pathname) {
      setNavigating(true)
    }
    onClick?.(e)
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
