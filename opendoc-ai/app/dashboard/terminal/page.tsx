import { getSettings } from "@/app/actions/settings";
import { Terminal } from "@/components/terminal";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function TerminalPage() {
  const settings = await getSettings();

  if (!settings?.vps_ssh_host || !settings?.vps_ssh_user || !settings?.vps_ssh_key) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-10">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                <span>/</span>
                <span>Terminal</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Linux CLI</h1>
            </div>
          </header>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <div className="mb-4 rounded-full bg-yellow-500/10 p-4 text-yellow-500">
              <Icons.Settings className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold">Cấu hình SSH chưa sẵn sàng</h2>
            <p className="mb-8 mt-2 max-w-sm text-muted-foreground">
              Vui lòng hoàn tất cấu hình VPS trong phần cài đặt trước khi sử dụng Terminal.
            </p>
            <Link href="/dashboard/settings">
              <Button size="lg">Đi tới Cài đặt</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sshConfig = {
    host: settings.vps_ssh_host,
    username: settings.vps_ssh_user,
    privateKey: settings.vps_ssh_key,
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span>/</span>
              <span>Terminal</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Linux CLI
            </h1>
            <p className="text-muted-foreground">
              Quản trị trực tiếp VPS thông qua SSH
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <Icons.ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </header>

        <Terminal sshConfig={sshConfig} />
      </div>
    </div>
  );
}
