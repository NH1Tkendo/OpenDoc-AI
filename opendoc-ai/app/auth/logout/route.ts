import { getServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await getServerClient();

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  // Ép sử dụng biến môi trường chứa tên miền thật làm gốc điều hướng
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://opendoc.ngobatai.dev';

  // Đổi sang mã 303 hoặc 307 để trình duyệt xử lý redirect sau POST mượt mà hơn, không bị kẹt cache
  return NextResponse.redirect(`${siteUrl}/login`, {
    status: 303,
  });
}