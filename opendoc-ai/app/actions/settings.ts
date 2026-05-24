"use server";

import { getServerClient } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

export async function saveSettings(data: {
  gemini_api_key?: string;
  vps_ssh_host?: string;
  vps_ssh_user?: string;
  vps_ssh_key?: string;
}) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // KIỂM TRA QUYỀN ADMIN: Chỉ admin mới được lưu cấu hình
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error(
      "Chỉ quản trị viên mới có quyền thay đổi cấu hình hệ thống.",
    );
  }

  // Lưu vào bảng user_configs với một ID cố định (ví dụ: 'system_global')
  // hoặc dùng chính user_id của admin nếu bạn muốn quản lý theo người dùng.
  // Ở đây chúng ta dùng upsert dựa trên user_id của chính Admin này.
  const { error } = await supabase.from("user_configs").upsert(
    {
      user_id: user.id,
      ...data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getSettings() {
  const supabase = await getServerClient();

  // Lấy bản ghi cấu hình đầu tiên (Global)
  const { data: dbSettings, error } = await supabase
    .from("user_configs")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching settings:", error.message);
  }

  // Hàm helper để ưu tiên DB -> .env (với nhiều alias) -> mặc định
  const getVal = (dbVal: string | undefined, envKeys: string[]) => {
    // Nếu trong DB có giá trị thực (không phải null/undefined/chuỗi rỗng)
    if (dbVal && dbVal.trim() !== "") return dbVal;

    // Nếu không, tìm trong các biến môi trường
    for (const key of envKeys) {
      if (process.env[key]) return process.env[key];
    }

    return "";
  };

  return {
    gemini_api_key: getVal(dbSettings?.gemini_api_key, ["GEMINI_API_KEY"]),
    vps_ssh_host: getVal(dbSettings?.vps_ssh_host, [
      "VPS_SSH_HOST",
      "SSH_HOST",
      "NEXT_PUBLIC_SSH_HOST",
    ]),
    vps_ssh_user: getVal(dbSettings?.vps_ssh_user, [
      "VPS_SSH_USER",
      "SSH_USER",
    ]),
    vps_ssh_key: getVal(dbSettings?.vps_ssh_key, [
      "VPS_SSH_KEY",
      "SSH_PRIVATE_KEY",
      "SSH_KEY",
    ]),
  };
}

export async function checkGeminiConnection(apiKey: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Attempt a very simple prompt to verify the key
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    const text = response.text();

    if (text) {
      return { success: true };
    }
    return { success: false, error: "Không nhận được phản hồi từ AI" };
  } catch (error: any) {
    console.error("Gemini connection check failed:", error);
    return { success: false, error: error.message || "Kết nối thất bại" };
  }
}
