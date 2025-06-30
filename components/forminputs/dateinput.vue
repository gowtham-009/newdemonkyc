<template>
  <div class="date-input-container">
    <label class="input-label">Date of Birth as per PAN</label>
    <div 
      class="date-input-wrapper"
      @click="focusInput"
    >
      <div class="date-segments">
        <div 
          class="date-segment" 
          :class="{ 'empty': !day }" 
          @click="setActiveSegment(0)"
        >
          <span>{{ day || 'DD' }}</span>
        </div>
        <div class="separator">/</div>
        <div 
          class="date-segment" 
          :class="{ 'empty': !month }" 
          @click="setActiveSegment(1)"
        >
          <span>{{ month || 'MM' }}</span>
        </div>
        <div class="separator">/</div>
        <div 
          class="date-segment" 
          :class="{ 'empty': !year }" 
          @click="setActiveSegment(2)"
        >
          <span>{{ year || 'YYYY' }}</span>
        </div>
      </div>
      <button 
        class="date-picker-button"
        @click.stop="openDatePicker"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>
      <input
        ref="dateInput"
        v-model="rawInput"
        type="text"
        class="hidden-input"
        maxlength="8"
        inputmode="numeric"
        pattern="[0-9]*"
        @input="handleInput"
        @blur="validateDate"
        @keydown="handleKeyDown"
        @paste="handlePaste"
      />
    </div>
    
    <!-- Date Picker Modal -->
    <div v-if="showDatePicker" class="date-picker-modal">
      <div class="date-picker-overlay" @click="closeDatePicker"></div>
      <div class="date-picker-content">
        <div class="date-picker-header">
          <button @click="prevMonth">&lt;</button>
          <div class="month-year-selector">
            <select v-model="currentMonth" class="month-select">
              <option v-for="(month, index) in months" :value="index" :key="month">
                {{ month }}
              </option>
            </select>
            <select v-model="currentYear" class="year-select">
              <option v-for="year in years" :value="year" :key="year">
                {{ year }}
              </option>
            </select>
          </div>
          <button @click="nextMonth">&gt;</button>
        </div>
        <div class="date-picker-grid">
          <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day" class="day-header">
            {{ day }}
          </div>
          <div 
            v-for="(date, index) in calendarDates" 
            :key="index"
            :class="{
              'date-cell': true,
              'current-month': date.month === currentMonth,
              'selected': isSelectedDate(date),
              'today': isToday(date),
              'disabled': isDateDisabled(date)
            }"
            @click="selectDate(date)"
          >
            {{ date.day }}
          </div>
        </div>
        <div class="date-picker-actions">
          <button @click="closeDatePicker" class="cancel-btn">Cancel</button>
          <button @click="confirmDate" class="confirm-btn">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: String,
  validate: {
    type: Boolean,
    default: true
  },
  minDate: Date,
  maxDate: Date
});

const emit = defineEmits(['update:modelValue', 'valid', 'invalid']);

const dateInput = ref(null);
const rawInput = ref('');
const activeSegment = ref(0);
const hasInteracted = ref(false);
const showDatePicker = ref(false);
const selectedDate = ref(null);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

// Months for the dropdown
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years for the dropdown (100 years range)
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 100; i--) {
    years.push(i);
  }
  return years;
});

const day = computed(() => props.modelValue?.split('/')[0]?.replace(/\D/g, '') || '');
const month = computed(() => props.modelValue?.split('/')[1]?.replace(/\D/g, '') || '');
const year = computed(() => props.modelValue?.split('/')[2]?.replace(/\D/g, '') || '');

const calendarDates = computed(() => {
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Previous month's dates to show
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
  const prevMonthDates = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDates.push({
      day: prevMonthLastDay - i,
      month: currentMonth.value - 1,
      year: currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
    });
  }
  
  // Current month's dates
  const currentMonthDates = [];
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    currentMonthDates.push({
      day: i,
      month: currentMonth.value,
      year: currentYear.value
    });
  }
  
  // Next month's dates to show (to fill the grid)
  const daysInGrid = 42; // 6 rows x 7 days
  const daysToShowFromNextMonth = daysInGrid - (prevMonthDates.length + currentMonthDates.length);
  const nextMonthDates = [];
  for (let i = 1; i <= daysToShowFromNextMonth; i++) {
    nextMonthDates.push({
      day: i,
      month: currentMonth.value + 1,
      year: currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
    });
  }
  
  return [...prevMonthDates, ...currentMonthDates, ...nextMonthDates];
});

watch(() => props.modelValue, (val) => {
  if (!val) {
    rawInput.value = '';
    activeSegment.value = 0;
    selectedDate.value = null;
  } else {
    const [d, m, y] = val.split('/');
    rawInput.value = `${d || ''}${m || ''}${y || ''}`.replace(/\D/g, '').slice(0, 8);
    
    if (d && m && y) {
      selectedDate.value = new Date(`${y}-${m}-${d}`);
      currentMonth.value = parseInt(m, 10) - 1;
      currentYear.value = parseInt(y, 10);
    }
  }
});

const focusInput = () => {
  dateInput.value?.focus();
};

const setActiveSegment = (segment) => {
  activeSegment.value = segment;
  focusInput();
  
  nextTick(() => {
    if (segment === 0) {
      dateInput.value.setSelectionRange(0, Math.min(2, rawInput.value.length));
    } else if (segment === 1) {
      dateInput.value.setSelectionRange(2, Math.min(4, rawInput.value.length));
    } else {
      dateInput.value.setSelectionRange(4, Math.min(8, rawInput.value.length));
    }
  });
};

const handleInput = (e) => {
  hasInteracted.value = true;
  let value = e.target.value.replace(/\D/g, '');
  value = value.slice(0, 8);
  rawInput.value = value;
  
  if (value.length <= 2) {
    activeSegment.value = 0;
  } else if (value.length <= 4) {
    activeSegment.value = 1;
  } else {
    activeSegment.value = 2;
  }
  
  formatAndEmit(value);
  
  nextTick(() => {
    dateInput.value.setSelectionRange(value.length, value.length);
  });
};

const formatAndEmit = (digits) => {
  let formattedDate = '';
  
  if (digits.length <= 2) {
    formattedDate = digits.padEnd(2, '_') + '//';
  } else if (digits.length <= 4) {
    formattedDate = digits.slice(0, 2) + '/' + digits.slice(2).padEnd(2, '_') + '/';
  } else {
    formattedDate = 
      digits.slice(0, 2) + '/' + 
      digits.slice(2, 4) + '/' + 
      digits.slice(4).padEnd(4, '_');
  }
  
  emit('update:modelValue', formattedDate.replace(/_/g, ''));
  
  if (digits.length === 8) {
    validateDate();
  }
};

const validateDate = () => {
  if (!props.validate || !hasInteracted.value) return;
  
  if (rawInput.value.length < 8) return;
  
  const dayVal = parseInt(day.value, 10);
  const monthVal = parseInt(month.value, 10);
  const yearVal = parseInt(year.value, 10);
  
  if (dayVal < 1 || dayVal > 31) {
    emit('invalid', 'invalid-day');
    return;
  }
  
  if (monthVal < 1 || monthVal > 12) {
    emit('invalid', 'invalid-month');
    return;
  }
  
  const daysInMonth = new Date(yearVal, monthVal, 0).getDate();
  if (dayVal > daysInMonth) {
    emit('invalid', 'invalid-day-for-month');
    return;
  }
  
  const currentYear = new Date().getFullYear();
  if (yearVal < 1900 || yearVal > currentYear) {
    emit('invalid', 'invalid-year');
    return;
  }
  
  const enteredDate = new Date(yearVal, monthVal - 1, dayVal);
  if (props.minDate && enteredDate < props.minDate) {
    emit('invalid', 'before-min-date');
    return;
  }
  
  if (props.maxDate && enteredDate > props.maxDate) {
    emit('invalid', 'after-max-date');
    return;
  }
  
  emit('valid', `${day.value.padStart(2, '0')}/${month.value.padStart(2, '0')}/${year.value}`);
};

const handleKeyDown = (e) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (activeSegment.value > 0) {
      activeSegment.value -= 1;
      setActiveSegment(activeSegment.value);
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (activeSegment.value < 2) {
      activeSegment.value += 1;
      setActiveSegment(activeSegment.value);
    }
  } else if (e.key === 'Backspace') {
    const selectionStart = dateInput.value.selectionStart;
    const selectionEnd = dateInput.value.selectionEnd;
    
    if (selectionStart === selectionEnd) {
      if (selectionStart > 0) {
        const newValue = 
          rawInput.value.slice(0, selectionStart - 1) + 
          rawInput.value.slice(selectionStart);
        rawInput.value = newValue;
        formatAndEmit(newValue);
        
        nextTick(() => {
          dateInput.value.setSelectionRange(selectionStart - 1, selectionStart - 1);
        });
      }
    } else {
      const newValue = 
        rawInput.value.slice(0, selectionStart) + 
        rawInput.value.slice(selectionEnd);
      rawInput.value = newValue;
      formatAndEmit(newValue);
      
      nextTick(() => {
        dateInput.value.setSelectionRange(selectionStart, selectionStart);
      });
    }
    e.preventDefault();
  } else if (e.key === 'Delete') {
    const selectionStart = dateInput.value.selectionStart;
    const selectionEnd = dateInput.value.selectionEnd;
    
    if (selectionStart === selectionEnd) {
      if (selectionStart < rawInput.value.length) {
        const newValue = 
          rawInput.value.slice(0, selectionStart) + 
          rawInput.value.slice(selectionStart + 1);
        rawInput.value = newValue;
        formatAndEmit(newValue);
        
        nextTick(() => {
          dateInput.value.setSelectionRange(selectionStart, selectionStart);
        });
      }
    } else {
      const newValue = 
        rawInput.value.slice(0, selectionStart) + 
        rawInput.value.slice(selectionEnd);
      rawInput.value = newValue;
      formatAndEmit(newValue);
      
      nextTick(() => {
        dateInput.value.setSelectionRange(selectionStart, selectionStart);
      });
    }
    e.preventDefault();
  } else if (e.key === 'Tab') {
    if (activeSegment.value < 2) {
      e.preventDefault();
      activeSegment.value += 1;
      setActiveSegment(activeSegment.value);
    }
  }
};

const handlePaste = (e) => {
  e.preventDefault();
  const pasteData = e.clipboardData.getData('text');
  const digits = pasteData.replace(/\D/g, '').slice(0, 8);
  
  if (digits.length > 0) {
    const selectionStart = dateInput.value.selectionStart;
    const selectionEnd = dateInput.value.selectionEnd;
    
    const newValue = 
      rawInput.value.slice(0, selectionStart) + 
      digits + 
      rawInput.value.slice(selectionEnd);
    
    rawInput.value = newValue.slice(0, 8);
    formatAndEmit(rawInput.value);
    
    const newCursorPos = Math.min(selectionStart + digits.length, 8);
    nextTick(() => {
      dateInput.value.setSelectionRange(newCursorPos, newCursorPos);
    });
  }
};

// Date Picker Methods
const openDatePicker = () => {
  if (selectedDate.value) {
    currentMonth.value = selectedDate.value.getMonth();
    currentYear.value = selectedDate.value.getFullYear();
  } else {
    const today = new Date();
    currentMonth.value = today.getMonth();
    currentYear.value = today.getFullYear();
  }
  showDatePicker.value = true;
};

const closeDatePicker = () => {
  showDatePicker.value = false;
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const selectDate = (date) => {
  if (date.month !== currentMonth.value || isDateDisabled(date)) return;
  
  selectedDate.value = new Date(date.year, date.month, date.day);
};

const confirmDate = () => {
  if (selectedDate.value) {
    const day = selectedDate.value.getDate().toString().padStart(2, '0');
    const month = (selectedDate.value.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.value.getFullYear().toString();
    
    rawInput.value = day + month + year;
    formatAndEmit(rawInput.value);
    validateDate();
  }
  closeDatePicker();
};

const isSelectedDate = (date) => {
  if (!selectedDate.value) return false;
  return (
    date.day === selectedDate.value.getDate() &&
    date.month === selectedDate.value.getMonth() &&
    date.year === selectedDate.value.getFullYear()
  );
};

const isToday = (date) => {
  const today = new Date();
  return (
    date.day === today.getDate() &&
    date.month === today.getMonth() &&
    date.year === today.getFullYear()
  );
};

const isDateDisabled = (date) => {
  const selected = new Date(date.year, date.month, date.day);
  
  if (props.minDate && selected < props.minDate) return true;
  if (props.maxDate && selected > props.maxDate) return true;
  
  return false;
};
</script>

<style scoped>
.date-input-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
}

.input-label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 6px;
  color: #374151;
}

.date-input-wrapper {
  position: relative;
  width: 100%;
  height: 44px;
  background: white;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  padding: 0 12px;
  transition: all 0.2s ease;
}

.date-input-wrapper:hover {
  border-color: #9ca3af;
}

.date-segments {
  display: flex;
  align-items: center;
  flex-grow: 1;
  height: 100%;
  margin-right: 8px;
}

.date-segment {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  min-width: 24px;
  padding: 0 4px;
}

.date-segment.empty {
  color: #9ca3af;
}

.date-segment span {
  white-space: nowrap;
}

.separator {
  padding: 0 2px;
  font-size: 14px;
  color: #111827;
}

.date-picker-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: color 0.2s ease;
  margin-left: auto;
}

.date-picker-button:hover {
  color: #4b5563;
}

.date-picker-button svg {
  width: 18px;
  height: 18px;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

/* Date Picker Modal Styles */
.date-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.date-picker-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.date-picker-content {
  position: relative;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  width: 300px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.date-picker-header button {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  color: #4b5563;
  font-weight: bold;
}

.month-year-selector {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.month-select, .year-select {
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 13px;
  background-color: white;
  cursor: pointer;
  outline: none;
}

.year-select {
  width: 70px;
}

.date-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 12px;
}

.day-header {
  text-align: center;
  font-weight: 600;
  font-size: 11px;
  color: #4b5563;
  padding: 4px 0;
}

.date-cell {
  text-align: center;
  padding: 6px 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-cell:hover:not(.disabled) {
  background-color: #f3f4f6;
}

.date-cell.current-month {
  color: #111827;
  font-weight: 500;
}

.date-cell:not(.current-month) {
  color: #9ca3af;
  font-weight: 400;
}

.date-cell.selected {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
}

.date-cell.today {
  position: relative;
  font-weight: 600;
}

.date-cell.today:not(.selected):after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #3b82f6;
}

.date-cell.disabled {
  color: #d1d5db;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.date-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background-color: white;
  color: #4b5563;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #f3f4f6;
}

.confirm-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background-color: #3b82f6;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background-color: #2563eb;
}

@media (max-width: 480px) {
  .date-picker-content {
    width: 280px;
    padding: 12px;
  }
  
  .month-select, .year-select {
    padding: 4px;
    font-size: 12px;
  }
  
  .year-select {
    width: 60px;
  }
  
  .date-cell {
    font-size: 12px;
    height: 24px;
  }
}
</style>