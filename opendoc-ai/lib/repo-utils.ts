import { GitHubTreeItem } from './github';

const IGNORED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'out',
  'vendor',
  'bower_components',
];

const IGNORED_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'composer.lock',
  '.DS_Store',
  'favicon.ico',
];

const BINARY_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.webp',
  '.mp4', '.webm', '.ogg', '.mp3', '.wav',
  '.pdf', '.zip', '.gz', '.tar', '.7z',
  '.exe', '.dll', '.so', '.dylib',
  '.pyc', '.pyo', '.class',
];

export function filterRepoFiles(tree: GitHubTreeItem[]) {
  return tree.filter((item) => {
    // Only process blobs (files)
    if (item.type !== 'blob') return false;

    const path = item.path;
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];

    // Check ignored directories
    if (parts.some((part) => IGNORED_DIRS.includes(part))) return false;

    // Check ignored files
    if (IGNORED_FILES.includes(fileName)) return false;

    // Check binary extensions
    if (BINARY_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext))) {
      return false;
    }

    return true;
  });
}

export function getPriorityFiles(files: GitHubTreeItem[]) {
  const priorityPatterns = [
    /^package\.json$/,
    /^README\.md$/i,
    /^Dockerfile$/,
    /^docker-compose\.ya?ml$/,
    /^\.env\.example$/,
    /^tsconfig\.json$/,
    /^next\.config\.(js|mjs|ts)$/,
    /^(index|main|app)\.(ts|js|py|go|rb|rs)$/,
    /^src\/(index|main|app)\.(ts|js|py|go|rb|rs)$/,
  ];

  return files.filter((file) => {
    const fileName = file.path.split('/').pop() || '';
    return priorityPatterns.some((pattern) => pattern.test(fileName) || pattern.test(file.path));
  });
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  children?: TreeNode[];
}

export function convertToTree(files: { path: string; type: string }[]): TreeNode[] {
  const root: TreeNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      const isLast = index === parts.length - 1;
      let node = currentLevel.find((n) => n.name === part);

      if (!node) {
        node = {
          name: part,
          path: path,
          type: isLast ? (file.type as 'blob' | 'tree') : 'tree',
          children: isLast ? undefined : [],
        };
        currentLevel.push(node);
        
        // Sort: folders first, then alphabetically
        currentLevel.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'tree' ? -1 : 1;
        });
      }

      if (node.children) {
        currentLevel = node.children;
      }
    });
  });

  return root;
}
