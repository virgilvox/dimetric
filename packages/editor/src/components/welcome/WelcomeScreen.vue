<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <!-- Logo and title -->
      <div class="welcome-header">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 38,12 20,22 2,12" fill="var(--accent)" opacity="0.8" />
            <polygon points="20,8 38,18 20,28 2,18" fill="var(--accent)" opacity="0.5" />
            <polygon points="20,14 38,24 20,34 2,24" fill="var(--accent)" opacity="0.3" />
          </svg>
        </div>
        <h1>Dimetric</h1>
        <p class="subtitle">Isometric tile map editor</p>
      </div>

      <!-- Action buttons -->
      <div class="welcome-actions">
        <button class="btn btn-primary btn-large" @click="$emit('new-map')">
          <SvgIcon name="plus" :size="18" />
          New Map
        </button>
        <button class="btn btn-large" @click="$emit('open-project')">
          <SvgIcon name="folder-open" :size="18" />
          Open Project
        </button>
        <button class="btn btn-large" @click="$emit('import')">
          <SvgIcon name="upload" :size="18" />
          Import
        </button>
      </div>

      <!-- Recent Projects -->
      <div v-if="recentProjects.projects.value.length > 0" class="section">
        <h2 class="section-title">Recent Projects</h2>
        <div class="recent-list">
          <button
            v-for="project in recentProjects.projects.value"
            :key="project.key"
            class="recent-item"
            @click="$emit('open-project')"
          >
            <SvgIcon name="map" :size="16" />
            <span class="recent-name">{{ project.name }}</span>
            <span class="recent-time">{{ formatRelativeTime(project.timestamp) }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Start Templates -->
      <div class="section">
        <h2 class="section-title">Quick Start</h2>
        <div class="quickstart-cards">
          <button
            v-for="template in templates"
            :key="template.label"
            class="quickstart-card"
            @click="$emit('quick-start', template.config)"
          >
            <svg class="quickstart-preview" width="48" height="36" viewBox="0 0 48 36">
              <template v-if="template.config.orientation === 'isometric'">
                <polygon points="24,2 46,12 24,22 2,12" fill="none" stroke="currentColor" stroke-width="1" />
                <polygon points="24,8 46,18 24,28 2,18" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5" />
                <line x1="24" y1="2" x2="24" y2="8" stroke="currentColor" stroke-width="1" opacity="0.3" />
              </template>
              <template v-else-if="template.config.orientation === 'orthogonal'">
                <rect x="2" y="2" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="16" y="2" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="30" y="2" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="2" y="16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="16" y="16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="30" y="16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1" />
              </template>
              <template v-else-if="template.config.orientation === 'hexagonal'">
                <polygon points="12,2 20,6 20,14 12,18 4,14 4,6" fill="none" stroke="currentColor" stroke-width="1" />
                <polygon points="28,2 36,6 36,14 28,18 20,14 20,6" fill="none" stroke="currentColor" stroke-width="1" />
                <polygon points="20,16 28,20 28,28 20,32 12,28 12,20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6" />
              </template>
            </svg>
            <span class="quickstart-label">{{ template.label }}</span>
            <span class="quickstart-size">{{ template.size }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DmOrientation } from '@dimetric/core';
import { SvgIcon } from '../icons';
import { useRecentProjects } from '../../composables/use-recent-projects';

interface QuickStartConfig {
  name: string;
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  orientation: DmOrientation;
}

defineEmits<{
  'new-map': [];
  'open-project': [];
  'import': [];
  'quick-start': [config: QuickStartConfig];
}>();

const recentProjects = useRecentProjects();

const templates: { label: string; size: string; config: QuickStartConfig }[] = [
  {
    label: 'Isometric',
    size: '20x20 @ 64x32',
    config: {
      name: 'Isometric Map',
      cols: 20,
      rows: 20,
      tileWidth: 64,
      tileHeight: 32,
      orientation: 'isometric',
    },
  },
  {
    label: 'Orthogonal',
    size: '20x20 @ 32x32',
    config: {
      name: 'Orthogonal Map',
      cols: 20,
      rows: 20,
      tileWidth: 32,
      tileHeight: 32,
      orientation: 'orthogonal',
    },
  },
  {
    label: 'Hexagonal',
    size: '20x20 @ 64x64',
    config: {
      name: 'Hexagonal Map',
      cols: 20,
      rows: 20,
      tileWidth: 64,
      tileHeight: 64,
      orientation: 'hexagonal',
    },
  },
];

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
}
</script>

<style scoped>
.welcome-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  overflow-y: auto;
}

.welcome-content {
  max-width: 560px;
  width: 100%;
  padding: 40px 24px;
}

/* Header */
.welcome-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.welcome-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

/* Action buttons */
.welcome-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 36px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: var(--border-radius);
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-hover);
  color: var(--text-primary);
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.btn:hover {
  background: var(--bg-active);
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-large {
  padding: 10px 22px;
  font-size: 14px;
}

/* Sections */
.section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px;
}

/* Recent projects */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: none;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
  width: 100%;
}

.recent-item:hover {
  background: var(--bg-hover);
}

.recent-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-time {
  color: var(--text-muted);
  font-size: 11px;
  flex-shrink: 0;
}

/* Quick start cards */
.quickstart-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.quickstart-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.quickstart-card:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
  color: var(--text-primary);
}

.quickstart-preview {
  flex-shrink: 0;
}

.quickstart-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.quickstart-size {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
</style>
