import { create } from 'zustand';
import type { Project } from '../types';
import { db } from '../services/db';

interface ProjectState {
  projects: Project[];
  selectedIds: Set<string>;
  searchQuery: string;
  loading: boolean;
  setSearchQuery: (q: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  loadProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProjects: (ids: string[]) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedIds: new Set(),
  searchQuery: '',
  loading: false,

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  selectAll: () =>
    set((state) => ({
      selectedIds: new Set(state.projects.map((p) => p.id)),
    })),

  clearSelection: () => set({ selectedIds: new Set() }),

  loadProjects: async () => {
    set({ loading: true });
    const projects = await db.projects.orderBy('updatedAt').reverse().toArray();
    set({ projects, loading: false });
  },

  addProject: async (data) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const project: Project = { ...data, id, createdAt: now, updatedAt: now };
    await db.projects.add(project);
    await get().loadProjects();
    return id;
  },

  updateProject: async (id, data) => {
    await db.projects.update(id, { ...data, updatedAt: Date.now() });
    await get().loadProjects();
  },

  deleteProjects: async (ids) => {
    await db.projects.bulkDelete(ids);
    set({ selectedIds: new Set() });
    await get().loadProjects();
  },
}));
