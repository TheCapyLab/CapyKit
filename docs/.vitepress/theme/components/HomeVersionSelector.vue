<template>
  <div class="home-version-selector">
    <h2>Choose Your Version</h2>
    <div class="version-controls">
      <select @change="onVersionChange" v-model="selectedVersion" class="version-dropdown">
        <option value="" disabled>Select a version</option>
        <option v-for="version in versions" :key="version.value" :value="version.value">
          {{ version.label }}
        </option>
      </select>
      <button @click="goToLatest" class="latest-button">
        Latest
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useData } from "vitepress";

interface Version {
  label: string;
  value: string;
}

// Define available versions (will be auto-updated by build script)
const versions: Version[] = [
  { label: "v0.2", value: "/v0.2/" },
  { label: "v0.1.0", value: "/v0.1.0/" },
  { label: "latest", value: "/latest/" },
  { label: "beta-release", value: "/beta-release/" },
];

const { site } = useData();
const selectedVersion = ref("");

const onVersionChange = () => {
  if (!selectedVersion.value) return;
  
  const baseUrl = site.value.base || '/';
  const fullUrl = baseUrl === '/' ? selectedVersion.value : baseUrl + selectedVersion.value.substring(1);
  
  window.location.href = fullUrl;
};

const goToLatest = () => {
  if (versions.length === 0) return;
  
  // The first version in the array is the latest (sorted by build script)
  const latestVersion = versions[0].value;
  const baseUrl = site.value.base || '/';
  const fullUrl = baseUrl === '/' ? latestVersion : baseUrl + latestVersion.substring(1);
  
  window.location.href = fullUrl;
};

onMounted(() => {
  // Don't set a default selection - let user choose
  selectedVersion.value = "";
});
</script>

<style scoped>
.home-version-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.home-version-selector h2 {
  font-size: 32px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 32px;
  line-height: 1.2;
}

.version-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 100%;
  max-width: 400px;
}

.version-dropdown {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
  transition: all 0.25s;
}

.version-dropdown:hover,
.version-dropdown:focus {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg);
}

.version-dropdown option {
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  padding: 12px;
}

.latest-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
  outline: none;
  min-width: 120px;
  background: var(--vp-c-green-1);
  color: var(--vp-c-white);
}

.latest-button:hover {
  background: var(--vp-c-green-2);
}

@media (min-width: 640px) {
  .version-controls {
    flex-direction: row;
    gap: 12px;
    justify-content: center;
  }
  
  .version-dropdown {
    max-width: 200px;
  }
}

/* Dark mode adjustments */
.dark .version-dropdown {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}
</style>