<template>
  <div class="version-switcher">
    <select @change="onChange" v-model="currentVersion" class="version-select">
      <option v-for="version in versions" :key="version.value" :value="version.value">
        {{ version.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useData } from "vitepress";

interface Version {
  label: string;
  value: string;
}

// Define available versions
const versions: Version[] = [
  { label: "v0.2", value: "/v0.2/" },
  { label: "v0.1.0", value: "/v0.1.0/" },
  { label: "latest", value: "/latest/" },
  { label: "beta-release", value: "/beta-release/" },
];

const { page, site } = useData();
const currentVersion = ref("");

// Detect current version from URL - now reactive
const detectCurrentVersion = () => {
  const path = page.value.relativePath;
  
  // Try to match direct version path first (after rewrite): [version]/[file]
  let versionMatch = path.match(/^([^\/]+)\//);
  
  // If no match, try the original versions/[name]/ pattern
  if (!versionMatch) {
    versionMatch = path.match(/^versions\/([^\/]+)\//);
  }
  
  if (versionMatch) {
    // The URL value is /[name]/
    const detectedVersion = `/${versionMatch[1]}/`;
    
    const version = versions.find(v => v.value === detectedVersion);
    if (version) {
      currentVersion.value = version.value;
      return;
    }
  }
  
  // Default to first version if no match found
  if (versions.length > 0) {
    currentVersion.value = versions[0].value;
  }
};

const onChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const selectedVersion = target.value;
  
  // Build the new path with base URL - just go to version root
  const baseUrl = site.value.base || '/';
  
  // Ensure we don't double up the base path
  const fullUrl = baseUrl === '/' ? selectedVersion : baseUrl + selectedVersion.substring(1);
  
  window.location.href = fullUrl;
};

// Watch for route changes to update current version
watch(() => page.value.relativePath, () => {
  detectCurrentVersion();
}, { immediate: true });

onMounted(() => {
  detectCurrentVersion();
});
</script>

<style scoped>
.version-switcher {
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 16px;
  margin-left: 16px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  order: -1;
}

.version-select {
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  font-weight: inherit;
  cursor: pointer;
  outline: none;
  appearance: none;
  padding-right: 20px;
  min-width: 80px;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 4px center;
  background-repeat: no-repeat;
  background-size: 14px;
}

.version-select:hover {
  color: var(--vp-c-brand-1);
}

.version-select:focus {
  color: var(--vp-c-brand-1);
}

.version-select option {
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  padding: 8px 12px;
}

.version-switcher:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-1);
}

/* Dark mode adjustments */
.dark .version-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}
</style>