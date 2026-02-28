import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerPrompts } from './prompts.js';
import { registerResources } from './resources.js';
import { registerTools } from './tools.js';

const server = new McpServer(
  { name: 'virtualfly-mcp', version: '2.0.0' },
  {
    instructions: [
      'VirtualFly (Pura Vida) MCP — full project context for the Vite + React + Three.js globe app.',
      'Prefer resources for large/static payloads: virtualfly://data/locations.json, virtualfly://source/types.ts, virtualfly://location/{id} (list + completions).',
      'Tools: list_tour_locations, get_tour_location, list_earth_texture_urls, haversine_between_locations, list_project_source_tree, read_allowed_source_file, describe_gemini_integration, get_view_domain_summary, get_workspace_meta, get_ai_studio_metadata.',
      'Prompts: plan-tour-feature, review-ui-state, narration-copy-pass.',
      'Workflow: list resources or list_tour_locations → read_allowed_source_file on the component you will edit → implement → run dev.',
    ].join(' '),
  },
);

registerTools(server);
registerResources(server);
registerPrompts(server);

const transport = new StdioServerTransport();
await server.connect(transport);

try {
  await server.sendLoggingMessage({
    level: 'info',
    logger: 'virtualfly-mcp',
    data: 'VirtualFly MCP v2 connected (tools, resources, prompts).',
  });
} catch {
  /* client may not subscribe to logging */
}
