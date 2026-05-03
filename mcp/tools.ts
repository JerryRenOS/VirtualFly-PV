import { readdirSync, readFileSync, type Dirent } from 'node:fs';
import { join } from 'node:path';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { LOCATIONS, TEXTURE_URLS } from '../constants.js';
import { ALLOWED_SOURCE_FILES, readAllowedSourceFile } from './allowed-files.js';
import { haversineKm } from './geo.js';
import { REPO_ROOT } from './repo-root.js';
import { registerYoloTools } from './yolo-tools.js';

const LOCATION_IDS = LOCATIONS.map((l) => l.id) as [string, ...string[]];
const LocationIdSchema = z.enum(LOCATION_IDS);

function readPackageJson(): { name?: string; version?: string; description?: string } {
  const raw = readFileSync(join(REPO_ROOT, 'package.json'), 'utf8');
  return JSON.parse(raw) as { name?: string; version?: string; description?: string };
}

function collectFiles(dirRel: string, maxDepth: number, depth = 0): string[] {
  if (depth > maxDepth) return [];
  const full = join(REPO_ROOT, dirRel);
  let out: string[] = [];
  let entries: Dirent[];
  try {
    entries = readdirSync(full, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const ent of entries) {
    const rel = join(dirRel, ent.name).replace(/\\/g, '/');
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.git') continue;
      out.push(`${rel}/`);
      out = out.concat(collectFiles(rel, maxDepth, depth + 1));
    } else {
      out.push(rel);
    }
  }
  return out;
}

const readOnly = { readOnlyHint: true as const };

const allowedPathEnum = z.enum(ALLOWED_SOURCE_FILES as unknown as [string, ...string[]]);

export function registerTools(server: McpServer): void {
  server.registerTool(
    'list_tour_locations',
    {
      title: 'List tour locations',
      description: 'All globe tour stops: id, name, lat/lng, description, hero image URL.',
      annotations: readOnly,
    },
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(LOCATIONS, null, 2) }],
    }),
  );

  server.registerTool(
    'get_tour_location',
    {
      title: 'Get tour location by id',
      description: 'Returns one tour location JSON.',
      inputSchema: { id: LocationIdSchema.describe('Tour id') },
      annotations: readOnly,
    },
    async ({ id }) => ({
      content: [{ type: 'text', text: JSON.stringify(LOCATIONS.find((l) => l.id === id), null, 2) }],
    }),
  );

  server.registerTool(
    'list_earth_texture_urls',
    {
      title: 'Earth texture URLs',
      description: 'Three.js earth textures used by the globe (day, night, clouds, stars).',
      annotations: readOnly,
    },
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(TEXTURE_URLS, null, 2) }],
    }),
  );

  server.registerTool(
    'get_workspace_meta',
    {
      title: 'Workspace metadata',
      description: 'package.json name, version, description.',
      annotations: readOnly,
    },
    async () => {
      const pkg = readPackageJson();
      const body = { name: pkg.name ?? null, version: pkg.version ?? null, description: pkg.description ?? null };
      return { content: [{ type: 'text', text: JSON.stringify(body, null, 2) }] };
    },
  );

  server.registerTool(
    'get_ai_studio_metadata',
    {
      title: 'AI Studio metadata.json',
      description: 'App title, description, and requestFramePermissions for AI Studio.',
      annotations: readOnly,
    },
    async () => {
      const raw = readFileSync(join(REPO_ROOT, 'metadata.json'), 'utf8');
      return { content: [{ type: 'text', text: raw }] };
    },
  );

  server.registerTool(
    'describe_gemini_integration',
    {
      title: 'Gemini tour narration integration',
      description:
        'Summarizes services/geminiService.ts: model id, env var, and behavior (no API call).',
      annotations: readOnly,
    },
    async () => {
      const src = readFileSync(join(REPO_ROOT, 'services/geminiService.ts'), 'utf8');
      const usesKey = src.includes('process.env.API_KEY');
      const modelMatch = src.match(/model:\s*['"]([^'"]+)['"]/);
      const summary = {
        file: 'services/geminiService.ts',
        model: modelMatch?.[1] ?? null,
        apiKeySource: usesKey ? 'process.env.API_KEY (Gemini / AI Studio injects in browser)' : null,
        exports: ['getTourNarration'],
        notes: 'Used for poetic tour voiceovers; failures fall back to a static welcome string.',
      };
      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    },
  );

  server.registerTool(
    'haversine_between_locations',
    {
      title: 'Great-circle distance (km)',
      description: 'Distance in kilometers along the Earth between two tour stops.',
      inputSchema: {
        fromId: LocationIdSchema,
        toId: LocationIdSchema,
      },
      outputSchema: {
        km: z.number(),
        fromId: z.string(),
        toId: z.string(),
      },
      annotations: readOnly,
    },
    async ({ fromId, toId }) => {
      const a = LOCATIONS.find((l) => l.id === fromId)!;
      const b = LOCATIONS.find((l) => l.id === toId)!;
      const km = haversineKm(
        { lat: a.coords[0], lng: a.coords[1] },
        { lat: b.coords[0], lng: b.coords[1] },
      );
      const output = { km: Math.round(km * 100) / 100, fromId, toId };
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  );

  server.registerTool(
    'list_project_source_tree',
    {
      title: 'Project source tree (shallow)',
      description: 'Lists files under components/, services/, and mcp/ up to depth 3 (excludes node_modules).',
      annotations: readOnly,
    },
    async () => {
      const parts = ['components', 'services', 'mcp'].flatMap((root) => collectFiles(root, 3));
      return { content: [{ type: 'text', text: parts.sort().join('\n') }] };
    },
  );

  server.registerTool(
    'read_allowed_source_file',
    {
      title: 'Read curated source file',
      description:
        'Reads a small allowlisted project file as UTF-8 text. Use before editing Globe, TourPanel, or geminiService.',
      inputSchema: {
        path: allowedPathEnum.describe('Relative path from repo root'),
      },
      annotations: readOnly,
    },
    async ({ path }) => {
      try {
        const { path: p, content } = readAllowedSourceFile(path);
        const header = `--- ${p} ---\n`;
        return { content: [{ type: 'text', text: header + content }] };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { content: [{ type: 'text', text: msg }], isError: true };
      }
    },
  );

  server.registerTool(
    'get_view_domain_summary',
    {
      title: 'View / state domain summary',
      description:
        'Summarizes enums and key types from types.ts for PilotState, PlanetState, ViewMode, TourLocation.',
      annotations: readOnly,
    },
    async () => {
      const body = {
        TourLocation: ['id', 'name', 'coords [lat,lng]', 'description', 'imageUrl'],
        PilotState: ['elevation', 'rotationX', 'rotationY', 'speed', 'isSpinning', 'isBouncing'],
        PlanetState: ['NORMAL', 'FIRE', 'FREEZE', 'NIGHT', 'GOLDEN'],
        ViewMode: ['TOUR', 'PILOT', 'SPACE'],
        appDefaults: {
          pilot: { elevation: 4, rotationX: 0, rotationY: 0, speed: 1, isSpinning: true, isBouncing: false },
          viewMode: 'PILOT',
          planetState: 'NORMAL',
        },
      };
      return { content: [{ type: 'text', text: JSON.stringify(body, null, 2) }] };
    },
  );

  registerYoloTools(server);
}
