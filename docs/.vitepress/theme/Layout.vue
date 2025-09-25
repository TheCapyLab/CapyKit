<template>
  <Layout>
    <template #nav-bar-content-before>
      <VersionSwitcher v-if="!isHomePage" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import VersionSwitcher from "./components/VersionSwitcher.vue";

const { Layout } = DefaultTheme;
const { page } = useData();

// Check if current page is the homepage
const isHomePage = computed(() => {
  return page.value.relativePath === 'index.md';
});
</script>
