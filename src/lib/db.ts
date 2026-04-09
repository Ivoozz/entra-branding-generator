import Dexie, { type EntityTable } from 'dexie';
import { BrandingColors } from './types';

export interface Project {
  id: string;
  name: string;
  logoSource?: string; // Data URL
  colors: BrandingColors;
  logoPadding: number;
  bgMode: 'solid' | 'gradient' | 'procedural';
  logoVariant: 'original' | 'white' | 'black';
  updatedAt: number;
}

const db = new Dexie('BrandingOS') as Dexie & {
  projects: EntityTable<Project, 'id'>;
};

db.version(1).stores({
  projects: 'id, name, updatedAt'
});

export { db };
