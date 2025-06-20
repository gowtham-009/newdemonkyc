<!-- IdSelector.vue -->
<template>
    <div class="flex  gap-2">
      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="CDSL" name="id" value="CDSL" @change="emitSelection" />
        <label for="CDSL" class="text-gray-500">CDSL</label>
      </div>
      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="NSDL" name="id" value="NSDL" @change="emitSelection" />
        <label for="NSDL" class="text-gray-500">NSDL</label>
      </div>

      <div class="flex items-center gap-2">
        <RadioButton v-model="selected" inputId="NO DP" name="id" value="NO DP" @change="emitSelection" />
        <label for="NO DP" class="text-gray-500">NO DP</label>
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
  