<!-- IdSelector.vue -->
<template>
    <div class="flex  gap-2">
      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="Electronic" name="id" value="Electronic" @change="emitSelection" />
        <label for="Electronic" class="text-gray-500">Electronic</label>
      </div>
      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="Physical" name="id" value="Physical" @change="emitSelection" />
        <label for="Physical" class="text-gray-500">Physical</label>
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
  