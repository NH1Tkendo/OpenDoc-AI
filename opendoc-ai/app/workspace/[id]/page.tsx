import { getServerClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import { WorkspaceEditor } from "@/components/workspace-editor";

interface WorkspacePageProps {
  params: {
    id: string;
  };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id } = await params;
  const supabase = await getServerClient();
  
  // Use getUser() for secure server-side session validation
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Filter by both id and user_id to ensure ownership
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !project) {
    if (error) {
      console.error("Error fetching project:", error.message);
    }
    // If project not found or doesn't belong to user, show 404
    notFound();
  }

  // Fetch document content if exists
  const { data: document } = await supabase
    .from("documents")
    .select("content")
    .eq("project_id", id)
    .single();

  return (
    <WorkspaceEditor
      projectId={id}
      initialContent={document?.content}
      projectName={project.repo_name}
      repoUrl={project.repo_url}
    />
  );
}
