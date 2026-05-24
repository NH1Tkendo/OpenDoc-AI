import { getSettings } from "@/app/actions/settings";
import { SettingsForm } from "@/components/settings-form";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span>/</span>
              <span>Cấu hình</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Cấu hình hệ thống
            </h1>
            <p className="text-muted-foreground">
              Quản lý API Keys và thông tin kết nối máy chủ
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <Icons.ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        </header>

        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
