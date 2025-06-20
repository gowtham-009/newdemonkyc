<template>
    <div class="w-full">
      <label for="pan_label" class="text-gray-500 text-md font-normal leading-3">Address* </label>
      <div class="input-wrapper dark:!bg-gray-800">
      <Textarea v-model="address" rows="2" class="w-full prime-input" cols="10"  />
      <span class="bottom-border"></span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps(['modelValue']);
  const emit = defineEmits(['update:modelValue']);
  
  const address = ref(props.modelValue || '');
  
  // Allow only A-Z, a-z, 0-9, ., /, and space
  const allowCustomCharacters = (event) => {
    const char = event.key;
    const regex = /^[a-zA-Z0-9./\s]$/;
    if (!regex.test(char)) {
      event.preventDefault();
    }
  };
  
  // Format input: convert to uppercase, allow only valid characters, and max 12 length
  const formatInput = () => {
    address.value = address.value
      .toUpperCase()
      .replace(/[^A-Z0-9./\s]/g, '')
      .slice(0, 100);
  };
  
  watch(address, (newValue) => {
    emit('update:modelValue', newValue);
  });
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
  padding: 0 10px;
  overflow: hidden;
}

.country-code {
  font-size: 16px;
  color: #333;
  padding-right: 8px;
  white-space: nowrap;
  user-select: none;
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