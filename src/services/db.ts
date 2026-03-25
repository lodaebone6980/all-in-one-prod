import Dexie, { type EntityTable } from 'dexie';
import type { Project } from '../types';

const db = new Dexie('ai-storyboard-v2') as Dexie & {
  projects: EntityTable<Project, 'id'>;
};

db.version(1).stores({
  projects: 'id, name, createdAt, updatedAt',
});

export { db };
