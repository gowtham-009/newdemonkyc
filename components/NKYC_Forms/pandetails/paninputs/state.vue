<template>
    <div class="w-full">
      <span class="text-md text-gray-500">State</span>
      <div class="input-wrapper dark:!bg-gray-800">
      <InputText
        type="text"
        v-model="state"
        variant="filled"
        class=" uppercase prime-input dark:!bg-gray-800"
        @input="formatstate"
        inputmode="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="characters"
      />
      <span class="bottom-border"></span>
    </div>
   
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps(['modelValue']);
  const emit = defineEmits(['update:modelValue']);
  
  const state = ref((props.modelValue || '').toUpperCase());
  
  // Clean and format input on each change
  const formatstate = (event) => {
    const raw = event.target.value;
    const cleaned = raw.toUpperCase().replace(/[^A-Z.\s]/g, '');
    state.value = cleaned;
    event.target.value = cleaned; // ensures proper display on mobile
  };
  
  // Emit value to parent
  watch(state, (newVal) => {
    emit('update:modelValue', newVal);
  });
  </script>
  
  <style scoped>
 

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
  