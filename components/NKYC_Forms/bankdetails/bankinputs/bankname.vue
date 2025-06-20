<template>
  <div class="flex gap-3">
    <div class="input-wrapper w-full dark:!bg-gray-800">
      <InputText class="w-full font-normal prime-input" v-model="bankname" inputmode="text" type="text"
        @input="validateInput" />
      <span class="bottom-border"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const bankname = ref(props.modelValue || '');

// Keep local ref in sync with prop
watch(() => props.modelValue, (newVal) => {
  if (newVal !== bankname.value) {
    bankname.value = newVal;
  }
});

// Emit updates when bankname changes
watch(bankname, (newVal) => {
  emit('update:modelValue', newVal);
});

// Allow only alphabets and convert to uppercase
const validateInput = (e) => {
  let value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  bankname.value = value;
};
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
