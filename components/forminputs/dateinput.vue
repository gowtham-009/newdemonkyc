<template>
  <span class="font-semibold text-lg">Date of Birth as per PAN</span>
  <div class="date-wrapper w-full rounded-lg">
    <Calendar
      v-model="internalDate"
      dateFormat="dd/mm/yy"
      placeholder="DD/MM/YYYY"
      class="custom-calendar w-full dark:!bg-gray-800 rounded-lg"
      inputClass="custom-input"
      :manualInput="true"
      :showOnFocus="false"
      showIcon
      @input="handleDateInput"
      @keydown="handleKeyDown"
      @blur="validateDate"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: String, // Expected format: dd/mm/yyyy
});
const emit = defineEmits(['update:modelValue']);

const internalDate = ref(parseDate(props.modelValue));

// Parse date string (dd/mm/yyyy) to Date object
function parseDate(dateString) {
  if (!dateString || dateString.length !== 10) return null;
  const [day, month, year] = dateString.split('/');
  // Return null if any part is invalid
  if (parseInt(day) > 31 || parseInt(month) > 12) return null;
  return new Date(`${year}-${month}-${day}`);
}

// Format Date object to dd/mm/yyyy string
function formatDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newVal) => {
  if (newVal !== formatDate(internalDate.value)) {
    internalDate.value = parseDate(newVal);
  }
});

// Emit updates when internalDate changes
watch(internalDate, (newVal) => {
  const formatted = formatDate(newVal);
  if (formatted !== props.modelValue) {
    emit('update:modelValue', formatted);
  }
});

// Handle keyboard input restrictions
function handleKeyDown(e) {
  // Allow navigation and control keys
  if ([8, 9, 13, 37, 38, 39, 40, 46].includes(e.keyCode) || 
      (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode))) {
    return;
  }
  
  // Allow numbers (0-9) on both main keyboard and numpad
  const isNumber = (e.keyCode >= 48 && e.keyCode <= 57) || 
                   (e.keyCode >= 96 && e.keyCode <= 105);
  
  // Allow slash (191 or 111) and dash (for some mobile keyboards)
  const isSlash = e.keyCode === 191 || e.keyCode === 111 || e.key === '/';
  
  if (!isNumber && !isSlash) {
    e.preventDefault();
  }
}

// Handle date input with auto-formatting
function handleDateInput(e) {
  const input = e.target;
  let value = input.value;
  let cursorPos = input.selectionStart;
  
  // Special handling for mobile autocomplete
  if (value.length === 10 && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    internalDate.value = parseDate(value);
    return;
  }
  
  // Remove any non-digit characters but preserve existing slashes
  const newValue = value.replace(/[^\d/]/g, '');
  
  // Split into components
  const parts = newValue.split('/').filter(Boolean);
  let day = parts[0] || '';
  let month = parts[1] || '';
  let year = parts[2] || '';
  
  // Apply formatting rules
  let formattedValue = '';
  
  // Day (01-31)
  if (day) {
    day = day.slice(0, 2);
    if (day.length === 2 && parseInt(day) > 31) {
      day = '31';
    }
    formattedValue = day;
  }
  
  // Auto-insert slash after day if needed
  if ((day.length === 2 && value.length > day.length && value[day.length] !== '/') ||
      (day.length === 2 && month && !value.includes('/'))) {
    formattedValue += '/';
  }
  
  // Month (01-12)
  if (month || (value.includes('/') && day.length === 2)) {
    if (month) {
      month = month.slice(0, 2);
      if (month.length === 2 && parseInt(month) > 12) {
        month = '12';
      }
    }
    formattedValue += formattedValue.endsWith('/') ? month : `/${month}`;
  }
  
  // Auto-insert slash after month if needed
  if (month && month.length === 2 && value.length > day.length + month.length + 1 && 
      value[day.length + month.length + 1] !== '/') {
    formattedValue += '/';
  }
  
  // Year (1900-2099)
  if (year || (value.split('/').length > 2 && month && month.length === 2)) {
    if (year) {
      year = year.slice(0, 4);
      if (year.length === 4) {
        const yearNum = parseInt(year);
        if (yearNum < 1900) year = '1900';
        if (yearNum > 2099) year = '2099';
      }
    }
    formattedValue += formattedValue.endsWith('/') ? year : `/${year}`;
  }
  
  // Update input value
  input.value = formattedValue;
  
  // Adjust cursor position
  nextTick(() => {
    // Special handling for mobile autocomplete
    if (formattedValue.length === 10) {
      internalDate.value = parseDate(formattedValue);
      return;
    }
    
    // Calculate new cursor position
    let newCursorPos = cursorPos;
    
    // If we added a slash automatically
    if (formattedValue.length > value.length) {
      if (cursorPos === 2 && formattedValue[2] === '/') {
        newCursorPos = 3;
      } 
      else if (cursorPos === 5 && formattedValue[5] === '/') {
        newCursorPos = 6;
      }
    }
    
    // Ensure cursor stays within bounds
    newCursorPos = Math.min(newCursorPos, formattedValue.length);
    input.setSelectionRange(newCursorPos, newCursorPos);
  });
}

// Final validation on blur
function validateDate(e) {
  const input = e.target;
  const value = input.value;
  
  if (value.length === 10) {
    const [day, month, year] = value.split('/');
    if (parseInt(day) > 31 || parseInt(month) > 12 || parseInt(year) < 1900 || parseInt(year) > 2099) {
      input.value = '';
      internalDate.value = null;
    }
  } else if (value.length > 0) {
    input.value = '';
    internalDate.value = null;
  }
}
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
  width: 100%;
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .custom-input {
    font-size: 1.2rem;
    height: 50px;
    padding: 10px 14px;
  }
}
</style>