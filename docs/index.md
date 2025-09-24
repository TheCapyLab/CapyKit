---
layout: home
hero:
  name: CapyKit
  text: Vue Component Library
  tagline: An opinionated Vue Component Library by TheCapyLab
  actions:
    - theme: brand
      text: Get Started
      link: /v0.2/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/TheCapyLab/CapyKit

features:
  - title: 🚀 Modern Vue Components
    details: Built with Vue 3 and TypeScript for modern web development
  - title: 📚 Comprehensive Documentation
    details: Detailed documentation with examples for every component
  - title: 🎨 Customizable Design
    details: Flexible theming system to match your brand
---

<script setup>
import HomeVersionSelector from './.vitepress/theme/components/HomeVersionSelector.vue'
</script>

<HomeVersionSelector />
