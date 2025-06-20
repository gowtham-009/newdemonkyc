<template>
  <div class="input-wrapper dark:!bg-gray-800">
    <span class="country-code">{{ countryphonenocode }}</span>
    <InputText class="prime-input " v-model="localPhoneNo" inputmode="numeric" type="text"
      placeholder="Your Mobile Number" @input="validateInput" maxlength="10" autocomplete="off" />
    <span class="bottom-border"></span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const countryphonenocode = ref('+91');
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const localPhoneNo = ref(props.modelValue || '');

const validateInput = (e) => {
  let value = e.target.value.replace(/\D/g, '').slice(0, 10);
  localPhoneNo.value = value;
  e.target.value = value;
};

watch(localPhoneNo, (newValue) => {
  emit('update:modelValue', newValue);
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
