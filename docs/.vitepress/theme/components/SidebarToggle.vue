<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

let observer: MutationObserver | null = null;
let toggleElement: HTMLElement | null = null;

const createToggle = () => {
  // Remove any existing toggles first
  document.querySelectorAll('.expand-toggle-container, .expand-toggle').forEach(el => el.remove());
  
  // Find Component Library section title
  const componentLibraryLink = Array.from(document.querySelectorAll('.VPSidebarItem .text'))
    .find(el => el.textContent?.trim() === 'Component Library');
  
  if (!componentLibraryLink) return;
  
  const sidebarItem = componentLibraryLink.closest('.VPSidebarItem');
  if (!sidebarItem) return;
  
  // Create toggle container with label
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'expand-toggle-container';
  toggleContainer.innerHTML = `
    <span class="expand-toggle-label">Expand all sections</span>
    <label class="expand-toggle">
      <input type="checkbox" class="expand-toggle-input">
      <span class="expand-toggle-slider"></span>
    </label>
  `;
  
  // Style the toggle
  const styles = `
    .expand-toggle-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      margin-bottom: 8px;
      font-size: 13px;
    }
    
    .expand-toggle-label {
      color: var(--vp-c-text-2);
      font-weight: 500;
    }
    
    .expand-toggle {
      position: relative;
      display: inline-block;
      width: 28px;
      height: 16px;
      cursor: pointer;
      margin-left: 8px;
    }
    
    .expand-toggle-input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .expand-toggle-slider {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--vp-c-bg-alt);
      border: 1px solid var(--vp-c-border);
      border-radius: 16px;
      transition: all 0.25s ease;
    }
    
    .expand-toggle-slider:before {
      position: absolute;
      content: "";
      height: 12px;
      width: 12px;
      left: 1px;
      top: 1px;
      background-color: var(--vp-c-text-2);
      border-radius: 50%;
      transition: all 0.25s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .expand-toggle-input:checked + .expand-toggle-slider {
      background-color: var(--vp-c-brand-1);
      border-color: var(--vp-c-brand-1);
    }
    
    .expand-toggle-input:checked + .expand-toggle-slider:before {
      transform: translateX(12px);
      background-color: white;
    }
    
    .expand-toggle:hover .expand-toggle-slider {
      box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
    }
  `;
  
  // Add styles if not already added
  if (!document.querySelector('#expand-toggle-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'expand-toggle-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
  
  // Insert toggle container above Component Library section
  sidebarItem.parentNode?.insertBefore(toggleContainer, sidebarItem);
  
  // Add functionality
  const checkbox = toggleContainer.querySelector('.expand-toggle-input') as HTMLInputElement;
  if (checkbox) {
    checkbox.addEventListener('change', handleToggle);
    
    // Set initial state
    updateToggleState(checkbox);
  }
  
  toggleElement = toggleContainer;
};

const handleToggle = (event: Event) => {
  const checkbox = event.target as HTMLInputElement;
  const isExpanded = checkbox.checked;
  
  console.log('Toggle clicked, isExpanded:', isExpanded);
  
  // Find Component Library section
  const componentLibraryLink = Array.from(document.querySelectorAll('.VPSidebarItem .text'))
    .find(el => el.textContent?.trim() === 'Component Library');
  
  if (!componentLibraryLink) {
    console.log('Component Library not found');
    return;
  }
  
  const sidebarItem = componentLibraryLink.closest('.VPSidebarItem');
  if (!sidebarItem) {
    console.log('Sidebar item not found');
    return;
  }
  
  console.log('Found Component Library section');
  console.log('Component Library HTML:', sidebarItem.outerHTML.substring(0, 500));
  
  // Look for nested items within the Component Library section
  const nestedItems = sidebarItem.querySelector('.items');
  if (!nestedItems) {
    console.log('No nested items found');
    return;
  }
  
  // Find all collapsible subsections within the nested items
  const subsections = nestedItems.querySelectorAll('.VPSidebarItem');
  console.log('Found subsections:', subsections.length);
  
  subsections.forEach((section, index) => {
    console.log(`Section ${index}:`, section.className);
    console.log(`Section ${index} HTML:`, section.outerHTML.substring(0, 200));
    
    const button = section.querySelector('button') as HTMLButtonElement;
    if (!button) {
      console.log(`  No button found in section ${index}`);
      return;
    }
    
    const isCurrentlyCollapsed = section.classList.contains('collapsed');
    const ariaExpanded = button.getAttribute('aria-expanded');
    console.log(`  Is collapsed class: ${isCurrentlyCollapsed}`);
    console.log(`  Aria expanded: ${ariaExpanded}`);
    
    // Use aria-expanded as the primary indicator
    const isCurrentlyOpen = ariaExpanded === 'true';
    
    if (isExpanded && !isCurrentlyOpen) {
      console.log(`  Clicking to expand section ${index}`);
      button.click();
    } else if (!isExpanded && isCurrentlyOpen) {
      console.log(`  Clicking to collapse section ${index}`);
      button.click();
    }
  });
};

const updateToggleState = (checkbox?: HTMLInputElement) => {
  if (!checkbox) {
    checkbox = document.querySelector('.expand-toggle-input') as HTMLInputElement;
  }
  if (!checkbox) return;
  
  // Find Component Library section
  const componentLibraryLink = Array.from(document.querySelectorAll('.VPSidebarItem .text'))
    .find(el => el.textContent?.trim() === 'Component Library');
  
  if (!componentLibraryLink) return;
  
  const sidebarItem = componentLibraryLink.closest('.VPSidebarItem');
  if (!sidebarItem) return;
  
  // Look for nested items within the Component Library section
  const nestedItems = sidebarItem.querySelector('.items');
  if (!nestedItems) return;
  
  // Count expanded subsections using aria-expanded
  const subsections = nestedItems.querySelectorAll('.VPSidebarItem');
  const expandedCount = Array.from(subsections).filter(section => {
    const button = section.querySelector('button') as HTMLButtonElement;
    return button && button.getAttribute('aria-expanded') === 'true';
  }).length;
  
  // Update checkbox state based on majority
  checkbox.checked = expandedCount > subsections.length / 2;
};

const setupObserver = () => {
  const sidebar = document.querySelector('.VPSidebar');
  if (!sidebar) return;
  
  observer = new MutationObserver((mutations) => {
    let shouldCreateToggle = false;
    let shouldUpdateState = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        shouldCreateToggle = true;
      } else if (mutation.type === 'attributes' && 
                 (mutation.attributeName === 'class' || mutation.attributeName === 'aria-expanded')) {
        shouldUpdateState = true;
      }
    });
    
    if (shouldCreateToggle) {
      setTimeout(createToggle, 50);
    }
    if (shouldUpdateState) {
      setTimeout(() => updateToggleState(), 50);
    }
  });
  
  observer.observe(sidebar, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-expanded']
  });
};

onMounted(() => {
  // Clean up any existing toggles first
  document.querySelectorAll('.expand-toggle-container, .expand-toggle').forEach(el => el.remove());
  
  // Initial setup
  setTimeout(() => {
    createToggle();
    setupObserver();
  }, 100);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  if (toggleElement) {
    const checkbox = toggleElement.querySelector('.expand-toggle-input');
    if (checkbox) {
      checkbox.removeEventListener('change', handleToggle);
    }
  }
  // Clean up any remaining toggle elements
  document.querySelectorAll('.expand-toggle-container, .expand-toggle').forEach(el => el.remove());
});
</script>

<template>
  <!-- This component works by injecting the toggle via JavaScript -->
</template>