<template>
  <span class="font-semibold text-lg">Date of Birth as per PAN</span>
  <div class="date-wrapper w-full rounded-lg">
    <Calendar
      v-model="internalDate"
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

// Flags
let isDeleting = false;
let isFormatting = false;

const handleKeyDown = (e) => {
  isDeleting = e.key === 'Backspace' || e.key === 'Delete';
};

// 💡 INPUT FORMATTER: dd/mm/yyyy with auto-slash & mobile-compatible
const handleInput = (e) => {
  if (isFormatting) return;
  isFormatting = true;

  const input = e.target;
  let rawDigits = input.value.replace(/\D/g, '').slice(0, 8); // Only 8 digits
  let formatted = '';

  const dd = rawDigits.slice(0, 2);
  const mm = rawDigits.slice(2, 4);
  const yyyy = rawDigits.slice(4, 8);

  // Validation
  const validDay = +dd >= 1 && +dd <= 31;
  const validMonth = +mm >= 1 && +mm <= 12;
  const validYear = yyyy.length < 4 || /^(19|20)/.test(yyyy); // partial OK

  if (rawDigits.length <= 2) {
    formatted = dd;
  } else if (rawDigits.length <= 4) {
    formatted = `${dd}/${mm}`;
  } else {
    formatted = `${dd}/${mm}/${yyyy}`;
  }

  input.value = formatted;

  // Restore cursor after slash insertions
  let newCursor = formatted.length;
  nextTick(() => {
    input.setSelectionRange(newCursor, newCursor);
    isFormatting = false;
  });

  if (formatted.length === 10 && validDay && validMonth && validYear) {
    internalDate.value = parseDate(formatted);
  }
};

onMounted(() => {
  nextTick(() => {
    const input = document.querySelector('.custom-input');
    if (input) {
      input.setAttribute('maxlength', '10');
      input.setAttribute('inputmode', 'numeric'); // forces number pad on mobile
      input.setAttribute('pattern', '\\d{2}/\\d{2}/\\d{4}');
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
