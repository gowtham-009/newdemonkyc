<template>
  <div class="w-full">
    <span class="font-semibold text-lg block">Client Name</span>
    
    <InputText
      type="text"
      v-model="name"
      variant="filled"
      class="w-full py-2 uppercase dark:!bg-gray-800"
      @input="formatName"
      inputmode="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="characters"
 
    />
    
    </div>
  
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const name = ref((props.modelValue || '').toUpperCase());

// Clean and format input on each change
const formatName = (event) => {
  const raw = event.target.value;
  const cleaned = raw.toUpperCase().replace(/[^A-Z.\s]/g, '');
  name.value = cleaned;
  event.target.value = cleaned; // ensures proper display on mobile
};

// Emit value to parent
watch(name, (newVal) => {
  emit('update:modelValue', newVal);
});
</script>

<style scoped>

  </style>
  
