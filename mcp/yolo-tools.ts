import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { LOCATIONS } from '../constants.js';

const LOCATION_IDS = LOCATIONS.map((l) => l.id) as [string, ...string[]];
const LocationIdSchema = z.enum(LOCATION_IDS);

const readOnly = { readOnlyHint: true as const };

/** Tiny deterministic hash → [0, n) */
function seedToIndex(seed: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % n;
}

const ORACLE_LINES = [
  'The jet stream whispers: ship the weird prototype first.',
  'Tower clears you for landing on the branch named "maybe".',
  'Your bundle size is light; your ambition may exceed escape velocity.',
  'Stars align when you rename the variable you were afraid to touch.',
  'The compass points to `constants.ts` — wisdom lives in boring files.',
  'A rubber duck in the cockpit is still a copilot.',
  'Merge conflicts are just the universe asking for a duet.',
  'Today’s tailwind is imaginary; write the test anyway.',
  'The globe spins whether your commit message is poetic or not (but poetic helps).',
  'If the shader breaks, blame the atmosphere — then fix the uniforms.',
] as const;

const VIBES = ['neon noir', 'synthwave sunrise', 'paper-airplane punk', 'museum-grade chill', 'low-poly thunder'] as const;

const COSMIC_CONDITIONS = [
  'Ionized optimism with a 40% chance of refactor',
  'Gentle aurora of “it works on my machine”',
  'High-altitude clarity; low-altitude TODOs',
  'Scattered lint warnings, clearing by evening deploy',
  'Vector winds from the land of undefined is not a function',
  'Patchy impostor syndrome; sunny breaks of shipping',
] as const;

const CALLSIGN_PREFIXES = ['SKY', 'VOID', 'NIMB', 'ORBIT', 'ZEPH', 'LUMN', 'ECHO', 'AERO'] as const;
const CALLSIGN_SUFFIXES = ['7', '42', 'X', '9', 'Ω', '∞', 'π', 'Δ'] as const;

function boardingPassFor(locationId: string, passengerSeed: string): string {
  const loc = LOCATIONS.find((l) => l.id === locationId)!;
  const flight = `${locationId.toUpperCase()}${seedToIndex(passengerSeed, 900) + 100}`;
  const gate = String.fromCharCode(65 + seedToIndex(passengerSeed + 'g', 20)) + (seedToIndex(passengerSeed + 'n', 89) + 10);
  const seat = `${seedToIndex(passengerSeed + 'r', 28) + 1}${String.fromCharCode(65 + seedToIndex(passengerSeed + 'c', 5))}`;
  const barcode = '▮'.repeat(12 + seedToIndex(passengerSeed, 8));

  return [
    '╔══════════════════════════════════════╗',
    '║  ✈  VIRTUAL FLY — BOARDING PASS      ║',
    '╠══════════════════════════════════════╣',
    `║ PASSENGER: ${passengerSeed.slice(0, 18).padEnd(18)} ║`,
    `║ TO: ${loc.name.slice(0, 22).padEnd(22)} ║`,
    `║ FLIGHT: ${flight.padEnd(7)}  GATE: ${gate.padEnd(4)}  SEAT: ${seat.padEnd(4)} ║`,
    `║ LAT/LNG: ${String(loc.coords[0]).slice(0, 8)}, ${String(loc.coords[1]).slice(0, 8)}`.padEnd(39) + '║',
    '╠══════════════════════════════════════╣',
    `║ ${barcode} ║`,
    '║  “Boarding is a state of mind.”      ║',
    '╚══════════════════════════════════════╝',
  ].join('\n');
}

export function registerYoloTools(server: McpServer): void {
  server.registerTool(
    'flight_oracle',
    {
      title: 'Flight oracle',
      description: 'Deterministic dev fortune from a mood string. Pure vibes, zero telemetry.',
      inputSchema: {
        mood: z.string().describe('How you feel about the codebase right now'),
      },
      annotations: readOnly,
    },
    async ({ mood }) => {
      const line = ORACLE_LINES[seedToIndex(mood.trim() || 'sky', ORACLE_LINES.length)];
      const vibe = VIBES[seedToIndex(mood + 'vibe', VIBES.length)];
      const text = [`Mood seed: “${mood.slice(0, 80)}${mood.length > 80 ? '…' : ''}”`, `Vibe channel: ${vibe}`, '', line].join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'boarding_pass_ascii',
    {
      title: 'ASCII boarding pass',
      description: 'Generates a fake terminal-era boarding pass for a tour stop.',
      inputSchema: {
        locationId: LocationIdSchema,
        passengerName: z.string().optional().describe('Name on the faux ticket'),
      },
      annotations: readOnly,
    },
    async ({ locationId, passengerName }) => ({
      content: [{ type: 'text', text: boardingPassFor(locationId, passengerName ?? 'Anonymous Aviator') }],
    }),
  );

  server.registerTool(
    'cosmic_weather_at_location',
    {
      title: 'Cosmic weather report',
      description: '100% fictional “weather” at a tour coordinate. Not a meteorology API.',
      inputSchema: { locationId: LocationIdSchema },
      annotations: readOnly,
    },
    async ({ locationId }) => {
      const loc = LOCATIONS.find((l) => l.id === locationId)!;
      const cond = COSMIC_CONDITIONS[seedToIndex(locationId + 'wx', COSMIC_CONDITIONS.length)];
      const wind = 3 + seedToIndex(locationId + 'w', 40);
      const uv = ['Low', 'Moderate', 'Nuclear ambition'][seedToIndex(locationId + 'uv', 3)];
      const text = [
        `📡 COSMIC WX — ${loc.name}`,
        `Coords: ${loc.coords[0]}, ${loc.coords[1]}`,
        `Condition: ${cond}`,
        `Imaginary wind: ${wind} kts at ${seedToIndex(locationId + 'd', 360)}°`,
        `UV index (for code): ${uv}`,
        '',
        'Disclaimer: For morale only. Do not file flight plans with this output.',
      ].join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'pilot_callsign_generator',
    {
      title: 'Pilot callsign',
      description: 'Invents a callsign from any seed string (deterministic).',
      inputSchema: { seed: z.string().describe('Your name, GitHub handle, or favorite cloud') },
      annotations: readOnly,
    },
    async ({ seed }) => {
      const pre = CALLSIGN_PREFIXES[seedToIndex(seed + 'p', CALLSIGN_PREFIXES.length)];
      const suf = CALLSIGN_SUFFIXES[seedToIndex(seed + 's', CALLSIGN_SUFFIXES.length)];
      const num = seedToIndex(seed + 'n', 99) + 1;
      const callsign = `${pre}-${num}${suf}`;
      const motto = ORACLE_LINES[seedToIndex(seed + 'm', ORACLE_LINES.length)];
      const text = [`Callsign: ${callsign}`, '', 'Cleared phraseology:', `"${motto}"`].join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );

  server.registerTool(
    'chaos_shuffle_tour',
    {
      title: 'Chaos shuffle tour order',
      description: 'Returns a shuffled itinerary + vibe label from a seed (Fisher-Yates with deterministic RNG).',
      inputSchema: {
        seed: z.string().optional().describe('Shuffle seed'),
      },
      outputSchema: {
        order: z.array(z.string()),
        vibe: z.string(),
        rallyCry: z.string(),
      },
      annotations: readOnly,
    },
    async ({ seed }) => {
      const key = seed?.trim() || 'yolo';
      const order = [...LOCATIONS.map((l) => l.id)];
      let s = seedToIndex(key, 1_000_000);
      const rand = () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
      };
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j]!, order[i]!];
      }
      const vibe = VIBES[seedToIndex(key + 'v', VIBES.length)];
      const rallyCry = ORACLE_LINES[seedToIndex(key + 'r', ORACLE_LINES.length)];
      const output = { order, vibe, rallyCry };
      return {
        content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    },
  );

  server.registerTool(
    'commit_to_the_bit',
    {
      title: 'Commit to the bit',
      description: 'One absurdly sincere rally line for demos, PR descriptions, or rubber ducks.',
      inputSchema: {
        intensity: z.enum(['mild', 'medium', 'maximum']).optional(),
      },
      annotations: readOnly,
    },
    async ({ intensity }) => {
      const level = intensity ?? 'medium';
      const bits = {
        mild: 'We are not “building a globe”. We are negotiating with gravity in CSS space.',
        medium: 'If the user feels altitude, the polygon count was worth it.',
        maximum: 'Full send: treat every frame like a love letter to the atmosphere shader.',
      } as const;
      const text = [bits[level], '', ORACLE_LINES[seedToIndex(level, ORACLE_LINES.length)]].join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );
}
