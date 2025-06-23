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
      @input="handleInput"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])

const parseDate = (str) => {
  // Accept both formats: with slashes (09/05/2000) and without (09052000)
  const dateStr = str.includes('/') ? str : `${str.slice(0,2)}/${str.slice(2,4)}/${str.slice(4)}`
  
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null
  
  const [dd, mm, yyyy] = dateStr.split('/')
  const date = new Date(`${yyyy}-${mm}-${dd}`)
  return isNaN(date.getTime()) ? null : date
}

const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const internalDate = ref(parseDate(props.modelValue))

watch(() => props.modelValue, (val) => {
  internalDate.value = parseDate(val)
})

watch(internalDate, (val) => {
  emit('update:modelValue', formatDate(val))
})

const handleInput = (e) => {
  let value = e.target.value
  
  // Remove any non-digit or non-slash characters
  value = value.replace(/[^0-9/]/g, '')
  
  // Update the input value if changed
  if (value !== e.target.value) {
    e.target.value = value
  }
  
  // Update model if valid (8 digits or 10 characters with slashes)
  if ((value.length === 8 && /^\d+$/.test(value)) || 
      (value.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(value))) {
    const parsed = parseDate(value)
    if (parsed) internalDate.value = parsed
  }
}

onMounted(() => {
  nextTick(() => {
    const input = document.querySelector('.custom-input')
    if (input) {
      // Key settings for mobile keyboard with slash
      input.setAttribute('maxlength', '10')
      input.setAttribute('inputmode', 'tel') // Shows numeric keyboard with slash
      input.setAttribute('pattern', '[0-9/]*')
      input.setAttribute('placeholder', 'DD/MM/YYYY')
      
      // Keyboard control
      input.addEventListener('keydown', (e) => {
        // Allow: numbers, slash, navigation keys, and basic editing keys
        if (/[0-9/]/.test(e.key) || 
            ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
            (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))) {
          return
        }
        e.preventDefault()
      })
    }
  })
})
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
  text-align: center;
  letter-spacing: 0.15em;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 60px;
  background-color: white;
  box-sizing: border-box;
}
</style>