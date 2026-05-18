"use client";

import Link from "next/link";
import { Icons } from "@/components/icons";
import { DeleteProjectButton } from "./delete-project-button";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: {
    id: string;
    repo_name: string;
    description?: string;
    repo_url: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(project.repo_url, "_blank", "noopener noreferrer");
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
      <Link
        href={`/workspace/${project.id}`}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`View workspace for ${project.repo_name}`}
      />
      <div className="relative z-10 pointer-events-none">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <Icons.Folder className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleExternalLinkClick}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Open repository in new tab"
            >
              <Icons.ExternalLink className="h-4 w-4" />
            </button>
            <DeleteProjectButton
              projectId={project.id}
              projectName={project.repo_name}
              onSuccess={() => router.refresh()}
            />
          </div>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
          {project.repo_name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description || "Không có mô tả"}
        </p>
      </div>
      <div className="relative z-10 mt-6 flex items-center text-xs text-muted-foreground pointer-events-none">
        <span className="flex items-center">
          <Icons.Github className="mr-1 h-3 w-3" />
          {project.repo_url.split("/").slice(-2).join("/")}
        </span>
      </div>
    </div>
  );
}
