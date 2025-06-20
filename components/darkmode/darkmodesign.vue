<template>
  <div>
    <button @click="toggleDarkMode"
      class="p-3 bg-gray-300 dark:bg-black dark:text-gray-500 rounded-full flex items-center gap-2">
      <i :class="isDark ? 'pi pi-moon text-gray-500' : 'pi pi-sun'"></i>

    </button>
  </div>
</template>

<script setup>
import { useDarkMode } from '@/composables/useDarkMode';
import 'primeicons/primeicons.css'

const { isDark, toggleDarkMode } = useDarkMode();
</script>

<style></style>