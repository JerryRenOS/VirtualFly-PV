
import { TourLocation } from './types';

export const LOCATIONS: TourLocation[] = [
  {
    id: 'nyc',
    name: 'New York City',
    coords: [40.7128, -74.0060],
    description: 'The city that never sleeps, featuring the Empire State Building and Central Park.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'paris',
    name: 'Paris',
    coords: [48.8566, 2.3522],
    description: 'The City of Light, home to the Eiffel Tower and the Louvre Museum.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    coords: [35.6762, 139.6503],
    description: 'A neon-lit metropolis blending futuristic technology with ancient traditions.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'rio',
    name: 'Rio de Janeiro',
    coords: [-22.9068, -43.1729],
    description: 'Famous for its carnival, Copacabana beach, and Christ the Redeemer.',
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'giza',
    name: 'Pyramids of Giza',
    coords: [29.9792, 31.1342],
    description: 'Ancient architectural marvels standing as a testament to Egyptian history.',
    imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80'
  }
];

/** Double-click the main HUD title in App to cycle these (easter egg). */
export const SKY_WHISPERS: string[] = [
  'YOLO clearance granted — fly weird, ship weirder.',
  'Tower says: your next commit is poetry if you mean it.',
  'Ionized optimism detected. Proceed visually.',
  'The globe remembers every spin you almost didn’t ship.',
  'MCP server says hi from the stratosphere.',
];

export const TEXTURE_URLS = {
  day: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  night: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  stars: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/galaxy_starfield.png'
};
