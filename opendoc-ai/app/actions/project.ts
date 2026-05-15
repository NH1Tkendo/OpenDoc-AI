'use server'

import { getServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function saveProject(data: {
  repoUrl: string;
  repoName: string;
  description?: string;
}) {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Check if project already exists for this user and repo
  const { data: existingProject } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.id)
    .eq('repo_url', data.repoUrl)
    .single();

  if (existingProject) {
    return existingProject;
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      repo_url: data.repoUrl,
      repo_name: data.repoName,
      description: data.description,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard');
  return project;
}

export async function saveDocument(data: {
  projectId: string;
  content: string;
  status: 'draft' | 'completed';
}) {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify ownership through project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', data.projectId)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    throw new Error('Project not found or unauthorized');
  }

  // Check if document exists for this project
  const { data: existingDoc } = await supabase
    .from('documents')
    .select('id')
    .eq('project_id', data.projectId)
    .single();

  let result;
  if (existingDoc) {
    result = await supabase
      .from('documents')
      .update({
        content: data.content,
        status: data.status,
      })
      .eq('id', existingDoc.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('documents')
      .insert({
        project_id: data.projectId,
        content: data.content,
        status: data.status,
      })
      .select()
      .single();
  }

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function getDocumentByProjectId(projectId: string) {
  const supabase = await getServerClient();
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is code for 'no rows returned'
    throw new Error(error.message);
  }

  return document;
}
