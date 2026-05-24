"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { saveSettings, checkGeminiConnection } from "@/app/actions/settings";

interface SettingsFormProps {
  initialSettings?: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    gemini_api_key: initialSettings?.gemini_api_key || "",
    vps_ssh_host: initialSettings?.vps_ssh_host || "",
    vps_ssh_user: initialSettings?.vps_ssh_user || "",
    vps_ssh_key: initialSettings?.vps_ssh_key || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await saveSettings(formData);
      setMessage({ type: "success", text: "Đã lưu cài đặt thành công!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    if (!formData.gemini_api_key) {
      setMessage({ type: "error", text: "Vui lòng nhập Gemini API Key trước khi kiểm tra." });
      return;
    }
    setChecking(true);
    setMessage(null);
    try {
      const result = await checkGeminiConnection(formData.gemini_api_key);
      if (result.success) {
        setMessage({ type: "success", text: "Kết nối Gemini AI thành công!" });
      } else {
        setMessage({ type: "error", text: result.error || "Kết nối thất bại." });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Cấu hình Gemini AI</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.gemini_api_key}
                onChange={(e) => setFormData({ ...formData, gemini_api_key: e.target.value })}
                placeholder="Nhập API Key của bạn..."
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCheckConnection}
                disabled={checking}
              >
                {checking ? <Icons.Loader className="mr-2 h-4 w-4 animate-spin" /> : "Kiểm tra"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Lấy API Key tại <a href="https://aistudio.google.com/apikey" target="_blank" className="text-primary underline">Google AI Studio</a>.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Cấu hình VPS DigitalOcean (SSH)</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">IP Address / Host</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.vps_ssh_host}
                onChange={(e) => setFormData({ ...formData, vps_ssh_host: e.target.value })}
                placeholder="1.2.3.4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.vps_ssh_user}
                onChange={(e) => setFormData({ ...formData, vps_ssh_user: e.target.value })}
                placeholder="root"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Private Key (OpenSSH)</label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
              value={formData.vps_ssh_key}
              onChange={(e) => setFormData({ ...formData, vps_ssh_key: e.target.value })}
              placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
            />
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading && <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />}
          Lưu tất cả thay đổi
        </Button>
      </div>
    </form>
  );
}
