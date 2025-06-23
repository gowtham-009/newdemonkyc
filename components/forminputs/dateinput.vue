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
      type="text" 
  inputmode="numeric" 
  pattern="[0-9/]*"
  maxlength="10"
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
const handleInput = (e) => {
  if (isFormatting) return;
  isFormatting = true;

  const input = e.target;
  let value = input.value;
  const cursorPos = input.selectionStart;
  const prevCursorPos = input._prevCursorPos || 0;
  input._prevCursorPos = cursorPos;

  // Track if user is trying to type a slash
  const isTypingSlash = !isDeleting && 
                        value.length > 0 && 
                        value[cursorPos - 1] === '/';

  // Process the input
  let digits = value.replace(/\D/g, '');
  let formatted = '';
  let newCursorPos = cursorPos;

  // Format based on digit count
  if (digits.length > 0) {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);

    if (digits.length <= 2) {
      formatted = dd;
    } else if (digits.length <= 4) {
      formatted = `${dd}/${mm}`;
    } else {
      formatted = `${dd}/${mm}/${yyyy}`;
    }

    // Handle cursor position for manual slash typing
    if (isTypingSlash) {
      if (cursorPos === 3) { // After day
        newCursorPos = 3;
      } else if (cursorPos === 6) { // After month
        newCursorPos = 6;
      }
    } else if (!isDeleting) {
      // Auto-advance cursor past slashes
      if (digits.length === 2 && prevCursorPos <= 2) {
        newCursorPos = 3; // Jump past first slash
      } else if (digits.length === 4 && prevCursorPos <= 5) {
        newCursorPos = 6; // Jump past second slash
      }
    }
  }

  // Apply the formatted value
  input.value = formatted;

  // Set cursor position after formatting
  nextTick(() => {
    // Ensure cursor stays in valid positions (not in the middle of slashes)
    if (newCursorPos === 2 || newCursorPos === 5) {
      newCursorPos += 1; // Push past slash positions
    }
    
    input.setSelectionRange(newCursorPos, newCursorPos);
    isFormatting = false;

    // Validate complete date
    if (formatted.length === 10) {
      const [dd, mm, yyyy] = formatted.split('/');
      if (+dd > 0 && +dd <= 31 && +mm > 0 && +mm <= 12 && yyyy.length === 4) {
        internalDate.value = parseDate(formatted);
      }
    }
  });
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
