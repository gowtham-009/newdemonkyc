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
  let value = input.value;
  const prevValue = input._prevValue || '';
  const cursorPos = input.selectionStart;
  input._prevValue = value;

  // Get the change (what was added or removed)
  let change = '';
  if (value.length > prevValue.length) {
    // Character added
    const addedPos = value.split('').findIndex((c, i) => prevValue[i] !== c);
    change = value[addedPos];
  } else if (value.length < prevValue.length) {
    // Character deleted (handled by isDeleting flag)
  }

  // Process the value
  let rawValue = value.replace(/\D/g, '');
  let formatted = '';
  let newCursorPos = cursorPos;

  // Format as user types
  if (rawValue.length > 0) {
    const dd = rawValue.slice(0, 2);
    const mm = rawValue.slice(2, 4);
    const yyyy = rawValue.slice(4, 8);

    // Build formatted string with slashes
    if (rawValue.length <= 2) {
      formatted = dd;
    } else if (rawValue.length <= 4) {
      formatted = `${dd}/${mm}`;
    } else {
      formatted = `${dd}/${mm}/${yyyy}`;
    }

    // Adjust cursor position for mobile typing
    if (change === '/') {
      // User manually typed a slash - move cursor forward
      newCursorPos = cursorPos;
    } else if (!isDeleting && change.match(/\d/)) {
      // Digit was added - handle auto-slash positioning
      if (rawValue.length === 2 && prevValue.length <= 2) {
        newCursorPos = 3; // Jump past first slash
      } else if (rawValue.length === 4 && prevValue.length <= 4) {
        newCursorPos = 6; // Jump past second slash
      } else {
        newCursorPos = cursorPos + (formatted.length - value.length);
      }
    }
  }

  // Apply the formatted value
  input.value = formatted;

  // Set the cursor position after formatting
  nextTick(() => {
    input.setSelectionRange(newCursorPos, newCursorPos);
    isFormatting = false;

    // Validate complete date
    if (formatted.length === 10) {
      const [dd, mm, yyyy] = formatted.split('/');
      if (dd && mm && yyyy) {
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
