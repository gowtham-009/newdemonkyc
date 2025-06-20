<template>
  <div class="flex gap-3">
    <div class="input-wrapper w-full dark:!bg-gray-800">
      <InputText class="w-full font-normal prime-input" :value="micr" type="text" @input="validateInput"
        maxlength="17" />
      <span class="bottom-border"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const micr = ref(props.modelValue || '');

// Sync micr with modelValue in case it changes from parent
watch(() => props.modelValue, (newVal) => {
  if (newVal !== micr.value) {
    micr.value = newVal || '';
  }
});

// Allow only alphanumeric, convert to uppercase, and emit cleaned value
const validateInput = (e) => {
  let value = e.target.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 17);

  micr.value = value;
  emit('update:modelValue', value);
};
</script>

<style scoped>
.uppercase {
  text-transform: uppercase;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #e0e0e0;
  border-radius: 10px;
  padding: 0 8px;
  overflow: hidden;
}

.prime-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  flex: 1;
  padding: 8px 0;
  z-index: 1;
  box-shadow: none !important;
}

.prime-input::placeholder {
  color: #87909b;
}

.bottom-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 3px;
  width: 0;
  background-color: #007bff;
  border-radius: 10px;
  transition: width 0.4s ease-out, height 0.3s ease-in;
  z-index: 0;
}

.input-wrapper:focus-within .bottom-border {
  width: 100%;
  height: 4px;
}
</style>
