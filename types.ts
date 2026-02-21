
export enum PlanetState {
  NORMAL = 'NORMAL',
  FIRE = 'FIRE',
  FREEZE = 'FREEZE',
  NIGHT = 'NIGHT',
  GOLDEN = 'GOLDEN'
}

export enum ViewMode {
  TOUR = 'TOUR',
  PILOT = 'PILOT',
  SPACE = 'SPACE'
}

export interface TourLocation {
  id: string;
  name: string;
  coords: [number, number]; // Lat, Lng
  description: string;
  imageUrl: string;
}

export interface PilotState {
  elevation: number;
  rotationX: number;
  rotationY: number;
  speed: number;
  isSpinning: boolean;
  isBouncing: boolean;
}
