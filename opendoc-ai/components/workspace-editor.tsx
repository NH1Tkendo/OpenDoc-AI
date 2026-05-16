'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { TreeNode, convertToTree } from '@/lib/repo-utils'
import { saveDocument } from '@/app/actions/project'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

const MDPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
)

interface WorkspaceEditorProps {
  projectId?: string
  initialContent?: string
  projectName?: string
  repoUrl?: string
}

interface RepoData {
  owner: string;
  repo: string;
  fullName: string;
  tree: { path: string; type: string }[];
  priorityFiles: { path: string; content: string }[];
}

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

// ... (inside the component)

export function WorkspaceEditor({ 
  projectId,
  initialContent = '# Chào mừng bạn đến với OpenDoc AI\n\nBắt đầu viết tài liệu của bạn ở đây...', 
  projectName = 'Dự án không tên',
  repoUrl
}: WorkspaceEditorProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [content, setContent] = useState(initialContent)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [tree, setTree] = useState<TreeNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [repoData, setRepoData] = useState<RepoData | null>(null)

  const analyzeRepo = async (url: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to analyze repository')
      }

      const data = await response.json() as RepoData
      setRepoData(data)
      const nestedTree = convertToTree(data.tree)
      setTree(nestedTree)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message)
      console.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const generateDocs = async () => {
    if (!repoData) return

    setIsGenerating(true)
    setError(null)
    setContent('') // Clear content to start fresh

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoInfo: {
            owner: repoData.owner,
            repo: repoData.repo,
            fullName: repoData.fullName,
          },
          tree: repoData.tree,
          priorityFiles: repoData.priorityFiles,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate documentation')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setContent((prev) => prev + chunk)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message)
      console.error('Generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async (status: 'draft' | 'completed') => {
    if (!projectId) return

    setIsSaving(true)
    setError(null)
    try {
      await saveDocument({
        projectId,
        content,
        status,
      })
      
      if (status === 'completed') {
        router.push('/dashboard')
      } else {
        alert('Đã lưu nháp!')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save document';
      setError(message)
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      alert('Đã sao chép vào bộ nhớ tạm!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (repoUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      analyzeRepo(repoUrl)
    }
  }, [repoUrl])


  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Navbar */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8"
          >
            <Icons.Layout className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Icons.Folder className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{projectName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={generateDocs}
            disabled={!repoData || isGenerating || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isGenerating ? (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.Code className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Đang tạo...' : 'Tạo với AI'}
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSave('draft')}
            disabled={!projectId || isSaving}
          >
            {isSaving ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Save className="mr-2 h-4 w-4" />}
            Lưu nháp
          </Button>
          <Button 
            size="sm"
            onClick={() => handleSave('completed')}
            disabled={!projectId || isSaving}
          >
            {isSaving ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Check className="mr-2 h-4 w-4" />}
            Hoàn thành
          </Button>
        </div>
      </header>


      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 flex-shrink-0 border-r border-border bg-muted/30 p-4 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cấu trúc dự án
              </span>
              {isLoading && <Icons.Spinner className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>
            
            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-0.5">
              {tree.length > 0 ? (
                tree.map((node) => <FileTreeItem key={node.path} node={node} level={0} />)
              ) : !isLoading && (
                <div className="text-center py-4">
                  <span className="text-xs text-muted-foreground italic">Không có dữ liệu</span>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Editor Area */}
        <main className="flex flex-1 overflow-hidden">
          <div className="grid w-full grid-cols-2 divide-x divide-border">
            {/* Editor Column */}
            <div className="flex flex-col overflow-hidden" data-color-mode={theme === 'light' ? 'light' : 'dark'}>
              <div className="flex h-10 items-center justify-between border-b border-border bg-muted/20 px-4">
                <div className="flex items-center text-xs font-medium text-muted-foreground">
                  <Icons.Edit className="mr-2 h-3 w-3" />
                  EDITOR
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy Markdown">
                    <Icons.Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownload} title="Download README.md">
                    <Icons.Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  preview="edit"
                  height="100%"
                  className="!border-none !shadow-none"
                  visibleDragbar={false}
                />
              </div>
            </div>

            {/* Preview Column */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex h-10 items-center justify-between border-b border-border bg-muted/20 px-4">
                <div className="flex items-center text-xs font-medium text-muted-foreground">
                  <Icons.Preview className="mr-2 h-3 w-3" />
                  PREVIEW
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy Markdown">
                    <Icons.Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-8 prose prose-sm dark:prose-invert max-w-none">
                <MDPreview source={content} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


function FileTreeItem({ node, level }: { node: TreeNode; level: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const isFolder = node.type === 'tree'

  return (
    <div>
      <div
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-foreground hover:bg-muted cursor-pointer transition-colors"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <Icons.ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Icons.ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
            <Icons.Folder className="h-3.5 w-3.5 text-primary/70" />
          </>
        ) : (
          <>
            <div className="w-3" />
            {node.name.endsWith('.md') ? (
              <Icons.FileText className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Icons.Code className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
