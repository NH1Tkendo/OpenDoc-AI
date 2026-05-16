import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url) // Bỏ bóc tách biến origin ở đây
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  // Lấy tên miền Production thật từ biến môi trường của bạn làm gốc điều hướng
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://opendoc.ngobatai.dev'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // SỬA TẠI ĐÂY: Ép nhảy về tên miền thật thay vì ${origin}
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  // SỬA TẠI ĐÂY: Trả về trang lỗi với tên miền thật nếu có sự cố
  return NextResponse.redirect(`${siteUrl}/auth/auth-code-error`)
}