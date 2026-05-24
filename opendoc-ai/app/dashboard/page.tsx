import { getServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";

export default async function DashboardPage() {
  const supabase = await getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Kiểm tra quyền Admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  const isAdmin = profile?.is_admin || false;

  // Tăng số lượt truy cập (Analytics)
  if (isAdmin) {
    await supabase.rpc("increment_visit_count");
  }

  // Lấy dữ liệu Analytics (Chỉ cho Admin)
  let analytics = null;
  if (isAdmin) {
    const { data } = await supabase
      .from("analytics")
      .select("*")
      .single();
    analytics = data;
  }

  // Lấy dự án: Admin thấy tất cả, User chỉ thấy của mình
  let query = supabase.from("projects").select("*");
  if (!isAdmin) {
    query = query.eq("user_id", session.user.id);
  }
  
  const { data: projects, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isAdmin ? "Dashboard Quản trị" : "Dự án của tôi"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Quản lý hệ thống và thống kê hiệu quả" 
                : "Quản lý các repository và tài liệu của bạn"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <Link href="/dashboard/terminal">
                  <Button variant="outline">
                    <Icons.Terminal className="mr-2 h-4 w-4" />
                    Terminal
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="outline">
                    <Icons.Settings className="mr-2 h-4 w-4" />
                    Cấu hình
                  </Button>
                </Link>
              </>
            )}
            <Link href="/workspace/new">
              <Button>
                <Icons.Plus className="mr-2 h-4 w-4" />
                Dự án mới
              </Button>
            </Link>
            <form action="/auth/logout" method="post">
              <Button variant="outline" type="submit">
                Đăng xuất
              </Button>
            </form>
          </div>
        </header>

        {/* Thống kê Analytics (Chỉ hiển thị cho Admin) */}
        {isAdmin && (
          <div className="mb-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
                  <Icons.User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng lượt truy cập</p>
                  <h3 className="text-2xl font-bold">{analytics?.visit_count || 0}</h3>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-3 text-green-500">
                  <Icons.FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">README đã tạo (AI)</p>
                  <h3 className="text-2xl font-bold">{analytics?.ai_generation_count || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isAdmin ? "Dự án gần đây" : "Danh sách dự án"}
          </h2>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
              <Icons.Plus className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Chưa có dự án nào
            </h2>
            <p className="mb-8 mt-2 max-w-sm text-muted-foreground">
              Bắt đầu bằng cách tạo dự án mới từ một repository GitHub.
            </p>
            <Link href="/workspace/new">
              <Button size="lg">Tạo dự án đầu tiên</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
