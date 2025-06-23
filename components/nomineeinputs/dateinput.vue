<template>
  <span class="text-md text-gray-500">DOB*</span>
  <div class="date-wrapper w-full rounded-lg">
    <Calendar
      v-model="internalDate"
        :maxDate="maxDate"
      dateFormat="dd/mm/yy"
      placeholder="DD / MM / YYYY"
      class="custom-calendar w-full dark:!bg-gray-800 rounded-lg"
      inputClass="custom-input"
      :manualInput="true"
      :showOnFocus="false"
      showIcon
      @input="handleInput"
      @keydown="handleKeyDown"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
const maxDate = new Date(); //
const props = defineProps({
  modelValue: String, // format: dd/mm/yyyy
});
const emit = defineEmits(['update:modelValue']);

// Parse and format utilities
const parseDate = (str) => {
  if (!str || str.length !== 10) return null;
  const [dd, mm, yyyy] = str.split('/');
  return new Date(`${yyyy}-${mm}-${dd}`);
};
const formatDate = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

const internalDate = ref(parseDate(props.modelValue));
watch(() => props.modelValue, (val) => {
  internalDate.value = parseDate(val);
});
watch(internalDate, (val) => {
  emit('update:modelValue', formatDate(val));
});

let isFormatting = false;

const handleKeyDown = (e) => {
  // do nothing specific here for now
};

const handleInput = (e) => {
  if (isFormatting) return;
  isFormatting = true;

  const input = e.target;
  let raw = input.value;

  // Allow user to enter slashes manually and ignore extra characters
  raw = raw.replace(/[^0-9/]/g, '');

  // Remove all slashes for reformatting
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  let formatted = '';

  if (digits.length <= 2) {
    formatted = digits;
  } else if (digits.length <= 4) {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  // If user manually added slashes in right place, preserve them
  if (raw.length >= formatted.length) {
    formatted = raw;
  }

  input.value = formatted;

  nextTick(() => {
    const pos = input.value.length;
    input.setSelectionRange(pos, pos);
    isFormatting = false;
  });

  // Final validation
  if (formatted.length === 10) {
    internalDate.value = parseDate(formatted);
  }
};

onMounted(() => {
  nextTick(() => {
    const input = document.querySelector('.custom-input');
    if (input) {
      input.setAttribute('maxlength', '10');
      input.setAttribute('inputmode', 'text'); // ✅ allows slash
      input.setAttribute('pattern', '[0-9/]*'); // ✅ digits and slash
      input.setAttribute('autocomplete', 'off');
    }
  });
});
</script>

<style scoped>
.date-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.custom-input {
  font-size: 1.4rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  text-align: center;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 60px;
  box-sizing: border-box;
  background-color: white;
}
</style>
