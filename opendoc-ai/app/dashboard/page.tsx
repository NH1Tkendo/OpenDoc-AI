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

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dự án của tôi
            </h1>
            <p className="text-muted-foreground">
              Quản lý các tài liệu README.md đã tạo
            </p>
          </div>
          <div className="flex items-center gap-4">
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
