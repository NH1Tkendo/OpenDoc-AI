'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
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
}

export function WorkspaceEditor({ 
  initialContent = '# Chào mừng bạn đến với OpenDoc AI\n\nBắt đầu viết tài liệu của bạn ở đây...', 
  projectName = 'Dự án không tên' 
}: WorkspaceEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
            </div>
            <div className="space-y-1">
              {/* Dummy file tree for now */}
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted cursor-pointer">
                <Icons.Folder className="h-4 w-4 text-primary/70" />
                <span>src</span>
              </div>
              <div className="ml-4 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground bg-primary/10 hover:bg-primary/20 cursor-pointer">
                <Icons.FileText className="h-4 w-4 text-primary" />
                <span>README.md</span>
              </div>
              <div className="ml-4 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted cursor-pointer">
                <Icons.Code className="h-4 w-4 text-muted-foreground" />
                <span>index.ts</span>
              </div>
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
