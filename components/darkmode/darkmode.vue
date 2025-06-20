<template>
  <div>
    <button @click="toggleDarkMode"
      class="p-3 bg-gray-300 dark:bg-black dark:text-gray-500 w-full rounded-lg flex items-center gap-2">
      <i :class="isDark ? 'pi pi-moon text-gray-500' : 'pi pi-sun'"></i>
      <span>{{ isDark ? 'Dark Mode' : 'Light Mode' }}</span>
    </button>
  </div>
</template>

<script setup>
import { useDarkMode } from '@/composables/useDarkMode';
import 'primeicons/primeicons.css'

const { isDark, toggleDarkMode } = useDarkMode();
</script>

<style></style>
