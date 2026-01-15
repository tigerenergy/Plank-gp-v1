import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 갱신
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 보호된 라우트 체크
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isProtectedRoute =
    !isAuthRoute &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.includes('.')

  // 로그인 페이지에서 이미 로그인한 경우 홈으로 리다이렉트
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 보호된 라우트에서 비로그인 상태인 경우 로그인 페이지로 리다이렉트
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
