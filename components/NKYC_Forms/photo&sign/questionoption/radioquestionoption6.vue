<!-- IdSelector.vue -->
<template>
    <div class="flex  gap-2">
      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="Yes" name="id" value="Yes" @change="emitSelection" />
        <label for="Yes" class="text-gray-500">Yes</label>
      </div>
      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="No" name="id" value="No" @change="emitSelection" />
        <label for="No" class="text-gray-500">No</label>
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
  