import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { LOCATIONS } from '../constants.js';

const LOCATION_IDS = LOCATIONS.map((l) => l.id) as [string, ...string[]];

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'plan-tour-feature',
    {
      title: 'Plan a tour / globe feature',
      description: 'Structured brief for changing tours, textures, or narration.',
      argsSchema: {
        goal: z.string().describe('What the user wants to change or add'),
        locationId: z.enum(LOCATION_IDS).optional().describe('Tour stop id if relevant'),
      },
    },
    async ({ goal, locationId }) => {
      const locHint = locationId
        ? `Focus location: ${locationId} (${LOCATIONS.find((l) => l.id === locationId)?.name ?? ''}).`
        : '';
      const text = [
        'You are working on the Pura Vida Virtual Fly Vite + React + Three.js app.',
        `Goal: ${goal}`,
        locHint,
        '',
        'Checklist:',
        '1. read_allowed_source_file on constants.ts if tour data changes; keep image URLs valid.',
        '2. read_allowed_source_file on components/Globe.tsx or TourPanel.tsx for 3D / UI wiring.',
        '3. If copy or voice changes: services/geminiService.ts + describe_gemini_integration.',
        '4. Run list_tour_locations or resources/read virtualfly://data/locations.json to verify data.',
        '5. After edits, npm run dev and sanity-check TOUR vs PILOT modes in App.tsx state.',
      ].join('\n');
      return {
        description: 'VirtualFly feature planning',
        messages: [{ role: 'user', content: { type: 'text', text } }],
      };
    },
  );

  server.registerPrompt(
    'review-ui-state',
    {
      title: 'Review UI / state alignment',
      description: 'Prompt template before refactoring PilotState, ViewMode, or PlanetState.',
      argsSchema: {
        area: z.enum(['pilot-hud', 'tour-panel', 'globe-shaders', 'boot-screen']).describe('UI area'),
      },
    },
    async ({ area }) => ({
      description: 'VirtualFly UI/state review',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Review area: ${area}.`,
              '',
              'Use get_view_domain_summary, then read_allowed_source_file for App.tsx and the relevant component.',
              'Preserve default pilot state unless the user asked otherwise; keep ViewMode and PlanetState enums consistent with types.ts.',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    'narration-copy-pass',
    {
      title: 'Narration / copy pass',
      description: 'For Gemini narration tone and TourPanel strings.',
      argsSchema: {
        locationId: z.enum(LOCATION_IDS).describe('Tour id to narrate'),
      },
    },
    async ({ locationId }) => {
      const loc = LOCATIONS.find((l) => l.id === locationId)!;
      return {
        description: 'Tour narration pass',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                `Location: ${loc.name} (${locationId})`,
                `Context: ${loc.description}`,
                '',
                'Improve getTourNarration prompts or TourPanel copy. Do not hardcode API keys; use env injection.',
                'Optional: call describe_gemini_integration for current model id.',
              ].join('\n'),
            },
          },
        ],
      };
    },
  );
}
