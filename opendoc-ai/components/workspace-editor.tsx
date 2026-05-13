'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { TreeNode, convertToTree } from '@/lib/repo-utils'
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
  initialContent?: string
  projectName?: string
  repoUrl?: string
}

export function WorkspaceEditor({ 
  initialContent = '# Chào mừng bạn đến với OpenDoc AI\n\nBắt đầu viết tài liệu của bạn ở đây...', 
  projectName = 'Dự án không tên',
  repoUrl
}: WorkspaceEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [tree, setTree] = useState<TreeNode[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (repoUrl) {
      analyzeRepo(repoUrl)
    }
  }, [repoUrl])

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

      const data = await response.json()
      const nestedTree = convertToTree(data.tree)
      setTree(nestedTree)
    } catch (err: any) {
      setError(err.message)
      console.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

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
          <Button variant="outline" size="sm">
            <Icons.Save className="mr-2 h-4 w-4" />
            Lưu nháp
          </Button>
          <Button size="sm">
            <Icons.Check className="mr-2 h-4 w-4" />
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
            <div className="flex flex-col overflow-hidden" data-color-mode="light">
              <div className="flex h-10 items-center border-b border-border bg-muted/20 px-4 text-xs font-medium text-muted-foreground">
                <Icons.Edit className="mr-2 h-3 w-3" />
                EDITOR
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
              <div className="flex h-10 items-center border-b border-border bg-muted/20 px-4 text-xs font-medium text-muted-foreground">
                <Icons.Preview className="mr-2 h-3 w-3" />
                PREVIEW
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
