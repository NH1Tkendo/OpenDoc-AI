import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json({
      owner,
      repo,
      fullName: `${owner}/${repo}`,
    });
  } catch (error) {
    console.error('Error analyzing repo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
