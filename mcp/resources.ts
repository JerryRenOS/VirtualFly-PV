import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ResourceTemplate, type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { LOCATIONS, TEXTURE_URLS } from '../constants.js';
import { REPO_ROOT } from './repo-root.js';

function textResource(uri: URL, mimeType: string, text: string) {
  return {
    contents: [{ uri: uri.href, mimeType, text }],
  };
}

export function registerResources(server: McpServer): void {
  server.registerResource(
    'virtualfly-locations-json',
    'virtualfly://data/locations.json',
    {
      title: 'Tour locations',
      description: 'JSON array of all tour stops',
      mimeType: 'application/json',
    },
    async (uri) => textResource(uri, 'application/json', JSON.stringify(LOCATIONS, null, 2)),
  );

  server.registerResource(
    'virtualfly-textures-json',
    'virtualfly://data/earth-textures.json',
    {
      title: 'Earth texture URLs',
      description: 'Keys: day, night, clouds, stars',
      mimeType: 'application/json',
    },
    async (uri) => textResource(uri, 'application/json', JSON.stringify(TEXTURE_URLS, null, 2)),
  );

  server.registerResource(
    'virtualfly-types-ts',
    'virtualfly://source/types.ts',
    {
      title: 'types.ts',
      description: 'Shared TypeScript types for the app',
      mimeType: 'text/typescript',
    },
    async (uri) => {
      const text = readFileSync(join(REPO_ROOT, 'types.ts'), 'utf8');
      return textResource(uri, 'text/typescript', text);
    },
  );

  server.registerResource(
    'virtualfly-constants-ts',
    'virtualfly://source/constants.ts',
    {
      title: 'constants.ts',
      description: 'LOCATIONS and TEXTURE_URLS',
      mimeType: 'text/typescript',
    },
    async (uri) => {
      const text = readFileSync(join(REPO_ROOT, 'constants.ts'), 'utf8');
      return textResource(uri, 'text/typescript', text);
    },
  );

  const locationTemplate = new ResourceTemplate('virtualfly://location/{id}', {
    list: async () => ({
      resources: LOCATIONS.map((l) => ({
        uri: `virtualfly://location/${encodeURIComponent(l.id)}`,
        name: l.name,
        description: l.description,
        mimeType: 'application/json',
      })),
    }),
    complete: {
      id: async () => LOCATIONS.map((l) => l.id),
    },
  });

  server.registerResource(
    'virtualfly-location-by-id',
    locationTemplate,
    {
      title: 'Tour location (by id)',
      description: 'Single location as JSON; use list or completions for id.',
      mimeType: 'application/json',
    },
    async (uri, variables) => {
      const raw = variables.id;
      const id = Array.isArray(raw) ? raw[0] : raw;
      if (!id) {
        throw new McpError(ErrorCode.InvalidParams, 'Missing template variable id');
      }
      const loc = LOCATIONS.find((l) => l.id === id);
      if (!loc) {
        throw new McpError(ErrorCode.InvalidParams, `Unknown location id: ${id}`);
      }
      return textResource(uri, 'application/json', JSON.stringify(loc, null, 2));
    },
  );
}
