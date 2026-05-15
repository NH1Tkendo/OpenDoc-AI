import { describe, it, expect } from 'vitest';
import { filterRepoFiles, getPriorityFiles } from './repo-utils';
import { GitHubTreeItem } from './github';

describe('repo-utils', () => {
  const mockTree: GitHubTreeItem[] = [
    { path: 'package.json', type: 'blob', mode: '100644', sha: '1', url: '' },
    { path: 'node_modules/lodash/index.js', type: 'blob', mode: '100644', sha: '2', url: '' },
    { path: 'src/main.ts', type: 'blob', mode: '100644', sha: '3', url: '' },
    { path: 'dist/bundle.js', type: 'blob', mode: '100644', sha: '4', url: '' },
    { path: 'README.md', type: 'blob', mode: '100644', sha: '5', url: '' },
    { path: 'image.png', type: 'blob', mode: '100644', sha: '6', url: '' },
  ];

  it('filterRepoFiles should filter out ignored directories and binary files', () => {
    const filtered = filterRepoFiles(mockTree);
    const paths = filtered.map(f => f.path);
    
    expect(paths).toContain('package.json');
    expect(paths).toContain('src/main.ts');
    expect(paths).toContain('README.md');
    
    expect(paths).not.toContain('node_modules/lodash/index.js');
    expect(paths).not.toContain('dist/bundle.js');
    expect(paths).not.toContain('image.png');
  });

  it('getPriorityFiles should identify core project files', () => {
    const filtered = filterRepoFiles(mockTree);
    const priority = getPriorityFiles(filtered);
    const paths = priority.map(f => f.path);
    
    expect(paths).toContain('package.json');
    expect(paths).toContain('README.md');
    expect(paths).toContain('src/main.ts');
  });
});
