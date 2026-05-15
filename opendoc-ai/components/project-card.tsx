"use client";

import Link from "next/link";
import { Icons } from "@/components/icons";

interface ProjectCardProps {
  project: {
    id: string;
    repo_name: string;
    description?: string;
    repo_url: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(project.repo_url, "_blank", "noopener noreferrer");
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md">
      <Link
        href={`/workspace/${project.id}`}
        className="absolute inset-0 rounded-xl"
      />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icons.Folder className="h-6 w-6" />
          </div>
          <button
            onClick={handleExternalLinkClick}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Open repository in new tab"
          >
            <Icons.ExternalLink className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {project.repo_name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description || "Không có mô tả"}
        </p>
      </div>
      <div className="relative z-10 mt-6 flex items-center text-xs text-muted-foreground">
        <span className="flex items-center">
          <Icons.Github className="mr-1 h-3 w-3" />
          {project.repo_url.split("/").slice(-2).join("/")}
        </span>
      </div>
    </div>
  );
}
