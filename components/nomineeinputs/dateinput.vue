<template>
  <div class="date-input-container">
    <span class="text-md text-gray-500">DOB*</span>
    <div class="date-wrapper w-full">
     <Calendar
  v-model="internalDate"
  :maxDate="maxDate"
  dateFormat="dd/mm/yy"
  placeholder="DD / MM / YYYY"
  class="custom-calendar w-full dark:!bg-gray-800"
  inputClass="custom-input"
  :manualInput="true"
  :showOnFocus="false"
  showIcon
  @date-select="handleDateSelect"
  @input="handleInput"
  @keydown="handleKeyDown"
/>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
const maxDate = new Date(); // <-- add this line at the top

const props = defineProps({
  modelValue: String, // Expected format: dd/mm/yyyy
});
const emit = defineEmits(['update:modelValue']);

// Parse and format utilities
const parseDate = (str) => {
  if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return null;
  const [dd, mm, yyyy] = str.split('/');
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  return isNaN(date.getTime()) ? null : date;
};

const formatDate = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

// Internal state
const internalDate = ref(parseDate(props.modelValue));
const isDeleting = ref(false);
const isFormatting = ref(false);

// Sync with parent
watch(() => props.modelValue, (newVal) => {
  const parsed = parseDate(newVal);
  if (parsed?.getTime() !== internalDate.value?.getTime()) {
    internalDate.value = parsed;
  }
});

watch(internalDate, (newVal) => {
  const formatted = formatDate(newVal);
  if (formatted !== props.modelValue) {
    emit('update:modelValue', formatted);
  }
});

// Handle date selection from calendar picker
const handleDateSelect = (date) => {
  internalDate.value = date;
};

// Handle keyboard input
const handleKeyDown = (e) => {
  isDeleting.value = e.key === 'Backspace' || e.key === 'Delete';
};

// Format input as user types
const handleInput = (e) => {
  if (isFormatting.value) return;
  isFormatting.value = true;

  const input = e.target;
  let value = input.value.replace(/\D/g, ''); // Remove non-digits
  let formatted = '';

  // Auto-format with slashes
  if (value.length > 0) {
    formatted = value.slice(0, 2);
    if (value.length > 2) {
      formatted += '/' + value.slice(2, 4);
      if (value.length > 4) {
        formatted += '/' + value.slice(4, 8);
      }
    }
  }

  // Validate day and month
  const [dd = '', mm = ''] = formatted.split('/');
  if (dd.length === 2 && (parseInt(dd) < 1 || parseInt(dd) > 31)) {
    formatted = formatted.slice(0, 1); // Keep only first digit if invalid
  }
  if (mm.length === 2 && (parseInt(mm) < 1 || parseInt(mm) > 12)) {
    formatted = formatted.slice(0, 3); // Keep only first month digit if invalid
  }

  // Update input value
  input.value = formatted;

  // Set cursor position
  const cursorPos = formatted.length;
  nextTick(() => {
    input.setSelectionRange(cursorPos, cursorPos);
    isFormatting.value = false;
  });

  // Update model if complete date
  if (formatted.length === 10) {
    const parsed = parseDate(formatted);
    if (parsed) {
      internalDate.value = parsed;
    }
  }
};

// Set up input attributes on mount
onMounted(() => {
  nextTick(() => {
    const input = document.querySelector('.custom-input');
    if (input) {
      input.setAttribute('maxlength', '10');
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', '\\d{2}/\\d{2}/\\d{4}');
      input.setAttribute('autocomplete', 'off');
    }
  });
});
</script>

<style scoped>
.date-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-wrapper {
  position: relative;
}

.custom-calendar {
  width: 100%;
}

.custom-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  transition: border-color 0.2s;
  text-align: center;
  letter-spacing: 0.05em;
}

.custom-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.custom-input::placeholder {
  color: #a0aec0;
  opacity: 1;
}

/* Dark mode styles */
.dark .custom-input {
  background-color: #1a202c;
  border-color: #2d3748;
  color: #e2e8f0;
}

.dark .custom-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 1px #4299e1;
}
</style>