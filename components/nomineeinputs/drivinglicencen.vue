<template>
  <div class="w-full">

    <div class="lic-input-wrapper input-wrapper w-full dark:!bg-gray-800">
     
      <InputText
  v-model="displaylic"
  @input="handleInput"
  @keydown="handleKeyDown"
  @paste="handlePaste"
  maxlength="16"
  class="lic-input prime-input dark:!text-gray-100"
  autocapitalize="characters"
  autocomplete="off"
  spellcheck="false"
  ref="licInput"
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

const rawLic = ref(props.modelValue?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16) || '')
const displaylic = ref('')
const licInput = ref(null)

function formatPan(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16)
}
function handleInput(e) {
  const input = e.target.value
  const formatted = formatPan(input)
  rawLic.value = formatted
  displaylic.value = formatted
  
  if (input.length > 16) {
    displaylic.value = displaylic.value.slice(0, 16)
    // Move cursor to end using the event target (which is the input element)
    setTimeout(() => {
      e.target.setSelectionRange(16, 16)
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
  if (e.target.value.length >= 16 && selectionLength === 0) {
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
  const formatted = formatPan(pasteData).slice(0, 16)
  
  const start = e.target.selectionStart
  const end = e.target.selectionEnd
  
  const before = displaylic.value.substring(0, start)
  const after = displaylic.value.substring(end, displaylic.value.length)
  const newValue = (before + formatted + after).slice(0, 16)
  
  rawLic.value = formatPan(newValue)
  displaylic.value = rawLic.value
  
  // Use the event target instead of licInput.value
  setTimeout(() => {
    const newCursorPos = Math.min(start + formatted.length, 16)
    e.target.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}
// Emit value to parent
watch(rawLic, (val) => {
  emit('update:modelValue', val)
})

// Watch prop changes
watch(() => props.modelValue, (newVal) => {
  const cleaned = newVal?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16) || ''
  if (cleaned !== rawLic.value) {
    rawLic.value = cleaned
    displaylic.value = formatPan(cleaned)
  }
})

// Init display value
onMounted(() => {
  displaylic.value = formatPan(rawLic.value)
})
</script>

<style scoped>
.lic-input-wrapper {
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

.lic-input {
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