'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function NewProjectForm() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Analyze the repo first
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!analyzeRes.ok) {
        const data = await analyzeRes.json()
        throw new Error(data.error || 'Failed to analyze repository')
      }

      const repoData = await analyzeRes.json()

      // 2. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      // 3. Save to Supabase
      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          repo_url: url,
          repo_name: repoData.repo,
          description: `Repository analyzed from ${repoData.fullName}`,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 4. Redirect to the new project workspace
      router.push(`/workspace/${project.id}`)
    } catch (err: any) {
      setError(err.message)
      console.error('New project error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Tạo dự án mới</h1>
        <p className="text-muted-foreground">Nhập URL của repository GitHub để bắt đầu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">GitHub Repository URL</label>
          <input
            id="url"
            type="url"
            placeholder="https://github.com/owner/repo"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
            <Icons.Alert className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
              Đang phân tích...
            </>
          ) : (
            'Bắt đầu phân tích'
          )}
        </Button>
      </form>

      <div className="pt-4 text-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          Quay lại Dashboard
        </Button>
      </div>
    </div>
  )
}
