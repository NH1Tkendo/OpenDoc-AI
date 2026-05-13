import { NextRequest, NextResponse } from 'next/server';
import { getRepoTree, getFileContent } from '@/lib/github';
import { filterRepoFiles, getPriorityFiles } from '@/lib/repo-utils';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    // GitHub URL Regex: https://github.com/owner/repo
    const githubRegex = /github\.com\/([^/]+)\/([^/.]+)(\.git)?\/?$/;
    const match = url.match(githubRegex);

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' },
        { status: 400 }
      );
    }

    const owner = match[1];
    const repo = match[2];

    // 1. Fetch the full repository tree
    const treeData = await getRepoTree(owner, repo);
    
    // 2. Filter the tree to remove noise
    const filteredFiles = filterRepoFiles(treeData.tree);
    
    // 3. Identify priority files for AI context
    const priorityFiles = getPriorityFiles(filteredFiles);
    
    // 4. Fetch contents of priority files
    const filesWithContent = await Promise.all(
      priorityFiles.map(async (file) => {
        try {
          const content = await getFileContent(owner, repo, file.path);
          return {
            path: file.path,
            content,
          };
        } catch (error) {
          console.error(`Failed to fetch content for ${file.path}:`, error);
          return {
            path: file.path,
            content: '',
            error: 'Failed to fetch content',
          };
        }
      })
    );

    return NextResponse.json({
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      tree: filteredFiles.map(f => ({ path: f.path, type: f.type })),
      priorityFiles: filesWithContent,
    });
  } catch (error: any) {
    console.error('Error analyzing repo:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
