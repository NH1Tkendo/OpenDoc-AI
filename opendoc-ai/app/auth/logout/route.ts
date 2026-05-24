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

  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // Đổi sang mã 303 hoặc 307 để trình duyệt xử lý redirect sau POST mượt mà hơn, không bị kẹt cache
  return NextResponse.redirect(`${origin}/login`, {
    status: 303,
  });
}