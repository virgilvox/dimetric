import { ref } from 'vue';

export interface RecentProject {
  name: string;
  timestamp: number;
  /** localStorage key or identifier */
  key: string;
}

const STORAGE_KEY = 'dimetric:recent-projects';
const MAX_RECENT = 10;

export function useRecentProjects() {
  const projects = ref<RecentProject[]>(loadProjects());

  function loadProjects(): RecentProject[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value));
  }

  function addProject(name: string, key: string) {
    // Remove existing entry with same key
    projects.value = projects.value.filter(p => p.key !== key);
    // Add to front
    projects.value.unshift({ name, timestamp: Date.now(), key });
    // Trim
    if (projects.value.length > MAX_RECENT) {
      projects.value = projects.value.slice(0, MAX_RECENT);
    }
    save();
  }

  function removeProject(key: string) {
    projects.value = projects.value.filter(p => p.key !== key);
    save();
  }

  function refresh() {
    projects.value = loadProjects();
  }

  return { projects, addProject, removeProject, refresh };
}
