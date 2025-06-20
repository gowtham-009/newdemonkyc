<template>
  <div class="flex gap-3">
    <Password v-model="digipin" @input="validateInput" toggleMask :feedback="false" size="large"
      placeholder="6 digit security PIN*" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const digipin = ref(props.modelValue || '');

watch(digipin, (newValue) => {
  emit('update:modelValue', newValue);
});

const validateInput = (event) => {
  let value = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
  if (value.length > 12) {
    value = value.slice(0, 6); // Limit to 12 digits
  }
  digipin.value = value;
};
</script>

<style>
.p-password {
  width: 100%;
}

.p-inputtext {
  width: 100%;
}
</style>