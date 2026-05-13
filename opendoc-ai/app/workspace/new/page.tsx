import { getServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { NewProjectForm } from "@/components/new-project-form";

export default async function NewProjectPage() {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <NewProjectForm />
    </div>
  );
}
