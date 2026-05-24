import { getServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Chuyển hướng tất cả người dùng đã đăng nhập vào Dashboard
  redirect("/dashboard");
}
