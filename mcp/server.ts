import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerPrompts } from './prompts.js';
import { registerResources } from './resources.js';
import { registerTools } from './tools.js';

const server = new McpServer(
  { name: 'virtualfly-mcp', version: '2.2.0' },
  {
    instructions: [
      'VirtualFly (Pura Vida) MCP — context for the Vite + React + Three.js globe (tours, pilot HUD, Gemini narration).',
      '',
      'Resources (prefer for bulk/static): virtualfly://data/locations.json; virtualfly://data/earth-textures.json; virtualfly://source/types.ts; virtualfly://source/constants.ts; virtualfly://location/{id} (list + id completions).',
      '',
      'Core tools: list_tour_locations, get_tour_location, list_earth_texture_urls, haversine_between_locations (structured km), list_project_source_tree, read_allowed_source_file, describe_gemini_integration, get_view_domain_summary, get_workspace_meta, get_ai_studio_metadata.',
      '',
      'Playful read-only tools (yolo): flight_oracle, boarding_pass_ascii, cosmic_weather_at_location, pilot_callsign_generator, chaos_shuffle_tour, commit_to_the_bit.',
      '',
      'Prompts: plan-tour-feature, review-ui-state, narration-copy-pass.',
      '',
      'Workflow: resources/read or list_tour_locations → read_allowed_source_file on targets → edit → npm run dev.',
    ].join('\n'),
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
    data: 'VirtualFly MCP v2.2 connected — core + yolo tools, resources, prompts.',
  });
} catch {
  /* client may not subscribe to logging */
}
