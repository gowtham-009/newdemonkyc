<template>
  <div class="w-full">

    <div class="pan-input-wrapper input-wrapper w-full dark:!bg-gray-800">
     
      <InputText
        v-model="displayPan"
        @input="handleInput"
        @keydown="handleKeyDown"
        @paste="handlePaste"
     
        maxlength="10"
        class="pan-input prime-input dark:!text-gray-100"
        autocapitalize="characters"
        autocomplete="off"
        spellcheck="false"
        ref="panInput"
      />
        <span class="bottom-border"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])

const rawPan = ref(props.modelValue?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || '')
const displayPan = ref('')
const panInput = ref(null)

function formatPan(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
}

function handleInput(e) {
  const input = e.target.value
  // Format and limit to 10 characters
  const formatted = formatPan(input)
  rawPan.value = formatted
  displayPan.value = formatted
  
  // Prevent exceeding 10 characters (mobile keyboards sometimes ignore maxlength)
  if (input.length > 10) {
    displayPan.value = displayPan.value.slice(0, 10)
    // Move cursor to end
    setTimeout(() => {
      panInput.value.setSelectionRange(10, 10)
    }, 0)
  }
}

function handleKeyDown(e) {
  // Allow backspace, delete, tab, arrow keys, etc.
  if ([8, 9, 37, 38, 39, 40, 46].includes(e.keyCode)) {
    return
  }
  
  // Prevent input if already 10 characters and not replacing selected text
  const selectionLength = e.target.selectionEnd - e.target.selectionStart
  if (e.target.value.length >= 10 && selectionLength === 0) {
    e.preventDefault()
  }
  
  // Only allow alphanumeric characters
  if (!/[0-9A-Za-z]/.test(e.key)) {
    e.preventDefault()
  }
}

function handlePaste(e) {
  e.preventDefault()
  const pasteData = e.clipboardData.getData('text/plain')
  const formatted = formatPan(pasteData).slice(0, 10)
  
  // Get current selection
  const start = e.target.selectionStart
  const end = e.target.selectionEnd
  
  // Insert pasted text at cursor position
  const before = displayPan.value.substring(0, start)
  const after = displayPan.value.substring(end, displayPan.value.length)
  const newValue = (before + formatted + after).slice(0, 10)
  
  rawPan.value = formatPan(newValue)
  displayPan.value = rawPan.value
  
  // Set cursor position after pasted text
  setTimeout(() => {
    const newCursorPos = Math.min(start + formatted.length, 10)
    panInput.value.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

// Emit value to parent
watch(rawPan, (val) => {
  emit('update:modelValue', val)
})

// Watch prop changes
watch(() => props.modelValue, (newVal) => {
  const cleaned = newVal?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || ''
  if (cleaned !== rawPan.value) {
    rawPan.value = cleaned
    displayPan.value = formatPan(cleaned)
  }
})

// Init display value
onMounted(() => {
  displayPan.value = formatPan(rawPan.value)
})
</script>

<style scoped>
.pan-input-wrapper {
  display: flex;
  align-items: center;
 
  padding: 5px 5px;
  border-radius: 8px;
  background-color: white;
  width: 100%;
}

.pan-icon {
  font-size: 1.2rem;
  color: #5b140c;
  margin-right: 10px;
}

.pan-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.2rem;
  letter-spacing: 0.15em;
  width: 100%;
  color: inherit;
}
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