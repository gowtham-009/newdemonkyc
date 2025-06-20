<template>
  <div class="w-full">
    <div class="input-wrapper dark:!bg-gray-800">
      <Textarea class="w-full prime-input dark:!bg-gray-800" v-model="address" variant="filled" rows="2" cols="10"
        @input="onInput" />
      <span class="bottom-border"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Textarea from 'primevue/textarea'; // Make sure this is imported if not globally registered

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const address = ref(format(props.modelValue || ''));

// Sync from parent to local
watch(() => props.modelValue, (newVal) => {
  const formatted = format(newVal || '');
  if (formatted !== address.value) {
    address.value = formatted;
  }
});

// Emit to parent on change
watch(address, (newVal) => {
  emit('update:modelValue', newVal);
});

// Input formatting
const onInput = (e) => {
  address.value = format(e.target.value);
};

// Format logic: UPPERCASE, allow alphanumeric, `/`, `.`, space, max 100 chars
function format(val) {
  return val
    .toUpperCase()
    .replace(/[^A-Z0-9./\s]/g, '')
    .slice(0, 100);
}
</script>

<style scoped>
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #e0e0e0;
  border-radius: 10px;
  padding: 0 10px;
  overflow: hidden;
}

.prime-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  flex: 1;
  padding: 10px 0;
  z-index: 1;
  box-shadow: none !important;
  resize: none;
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
