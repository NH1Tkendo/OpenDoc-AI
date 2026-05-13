const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export async function getRepoTree(owner: string, repo: string, branch: string = 'main') {
  const token = process.env.GITHUB_PAT;
  
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: token ? `Bearer ${token}` : '',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    // If main fails, try master
    if (branch === 'main' && response.status === 404) {
      return getRepoTree(owner, repo, 'master');
    }
    
    const errorData = await response.json();
    throw new Error(errorData.message || `GitHub API error: ${response.status}`);
  }

  return (await response.json()) as GitHubTreeResponse;
}

export async function getFileContent(owner: string, repo: string, path: string) {
  const token = process.env.GITHUB_PAT;
  
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Accept: 'application/vnd.github.raw',
        Authorization: token ? `Bearer ${token}` : '',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch file content: ${response.status}`);
  }

  return await response.text();
}
