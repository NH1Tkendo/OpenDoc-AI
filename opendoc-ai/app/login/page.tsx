'use client'

import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error logging in with GitHub:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            OpenDoc AI
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tự động hóa tài liệu README.md của bạn
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full py-6 text-lg font-medium transition-all hover:scale-[1.02]"
            variant="default"
          >
            {loading ? (
              <Icons.Spinner className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Icons.Github className="mr-2 h-5 w-5" />
                Đăng nhập bằng GitHub
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
        </p>
      </div>
    </div>
  )
}
