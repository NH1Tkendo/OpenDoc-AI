import { getServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { WorkspaceEditor } from "@/components/workspace-editor";

interface WorkspacePageProps {
  params: {
    id: string;
  };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id } = await params;
  const supabase = await getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) {
    console.error("Error fetching project:", error);
    redirect("/dashboard");
  }

  // Fetch document content if exists
  const { data: document } = await supabase
    .from("documents")
    .select("content")
    .eq("project_id", id)
    .single();

  return (
    <WorkspaceEditor
      initialContent={document?.content}
      projectName={project.repo_name}
    />
  );
}
