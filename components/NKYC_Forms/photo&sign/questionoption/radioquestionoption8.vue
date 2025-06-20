<!-- IdSelector.vue -->
<template>
    <div class="flex  gap-2">
      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="Once i Quarter" name="id" value="Once in Quarter" @change="emitSelection" />
        <label for="Once in Quarter" class="text-gray-500">Once in Quarter</label>
      </div>
      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="Once in Month" name="id" value="Once in Month" @change="emitSelection" />
        <label for="Once in Month" class="text-gray-500">Once in Month</label>
      </div>

     
    </div>
  </template>
  
  <script setup>
 import { computed } from 'vue'
import RadioButton from 'primevue/radiobutton'

const props = defineProps({
  selected: String
})

const emit = defineEmits(['update:selected'])

const selected = computed({
  get: () => props.selected,
  set: (val) => emit('update:selected', val)
})

  </script>
  