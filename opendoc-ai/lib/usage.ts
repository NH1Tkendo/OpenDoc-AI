import { getServerClient } from "./supabase-server";

export async function checkRateLimit() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get current usage
  const { data: usage, error: fetchError } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const limit = parseInt(process.env.GEMINI_RATE_LIMIT || "10", 10);
  const now = new Date();

  if (fetchError && fetchError.code === "PGRST116") {
    // No usage record yet, create one
    await supabase.from("user_usage").insert({
      user_id: user.id,
      usage_count: 0,
      last_reset: now.toISOString(),
    });
    return { allowed: true, remaining: limit };
  }

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const lastReset = new Date(usage.last_reset);
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

  // Reset every 24 hours
  if (hoursSinceReset >= 24) {
    await supabase
      .from("user_usage")
      .update({
        usage_count: 0,
        last_reset: now.toISOString(),
      })
      .eq("user_id", user.id);
    return { allowed: true, remaining: limit };
  }

  if (usage.usage_count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - usage.usage_count };
}

export async function incrementUsage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Sử dụng RPC để tăng usage một cách atomic (khuyên dùng)
  const { error: rpcError } = await supabase
    .rpc("increment_usage_count", { target_user_id: user.id });

  if (rpcError) {
    console.warn("RPC increment_usage_count failed, falling back to manual update:", rpcError.message);
    
    // Fallback: Lấy giá trị hiện tại rồi mới cộng (cẩn thận lỗi null)
    const { data: usage } = await supabase
      .from("user_usage")
      .select("usage_count")
      .eq("user_id", user.id)
      .single();

    if (usage) {
      await supabase
        .from("user_usage")
        .update({ usage_count: (usage.usage_count || 0) + 1 })
        .eq("user_id", user.id);
    } else {
      // Nếu chưa có bản ghi thì tạo mới
      await supabase.from("user_usage").insert({
        user_id: user.id,
        usage_count: 1,
        last_reset: new Date().toISOString(),
      });
    }
  }
}
