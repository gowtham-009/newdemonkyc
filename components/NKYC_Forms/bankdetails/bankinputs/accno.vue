<template>
  <div class="flex gap-3">

    <div class="input-wrapper w-full dark:!bg-gray-800">
      <InputText class="w-full font-normal prime-input" v-model="accno" inputmode="numeric" type="text"
        @input="validateInput" maxlength="18" />
      <span class="bottom-border"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';


const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const accno = ref(props.modelValue || '');

// Keep only numbers and limit to 10 digits
const validateInput = (e) => {
  let value = e.target.value.replace(/\D/g, '').slice(0, 18);
  accno.value = value;
  e.target.value = value;
};

watch(accno, (newValue) => {
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