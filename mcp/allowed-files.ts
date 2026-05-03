import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { REPO_ROOT } from './repo-root.js';

/** Curated project files the MCP may read (no traversal, no secrets). */
export const ALLOWED_SOURCE_FILES = [
  'App.tsx',
  'index.tsx',
  'constants.ts',
  'types.ts',
  'vite.config.ts',
  'metadata.json',
  'index.html',
  'README.md',
  'services/geminiService.ts',
  'components/Globe.tsx',
  'components/PilotControls.tsx',
  'components/TourPanel.tsx',
  'mcp/server.ts',
  'mcp/yolo-tools.ts',
] as const;

export type AllowedSourceFile = (typeof ALLOWED_SOURCE_FILES)[number];

const allowedSet = new Set<string>(ALLOWED_SOURCE_FILES);

export function readAllowedSourceFile(rel: string): { path: string; content: string } {
  if (!allowedSet.has(rel)) {
    throw new Error(`Path not allowed: ${rel}`);
  }
  const abs = resolve(REPO_ROOT, rel);
  if (!abs.startsWith(REPO_ROOT)) {
    throw new Error('Invalid path resolution');
  }
  const content = readFileSync(abs, 'utf8');
  return { path: rel, content };
}
