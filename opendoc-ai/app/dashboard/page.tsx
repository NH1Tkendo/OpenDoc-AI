import { getServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
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
              <Link
                key={project.id}
                href={`/workspace/${project.id}`}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icons.Folder className="h-6 w-6" />
                    </div>
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icons.ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.repo_name}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description || 'Không có mô tả'}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Icons.Github className="mr-1 h-3 w-3" />
                    {project.repo_url.split('/').slice(-2).join('/')}
                  </span>
                </div>
              </Link>
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
  )
}
