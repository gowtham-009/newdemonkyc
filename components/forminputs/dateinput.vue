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
  // Allow both formats: with slashes (09/05/2000) and without (09052000)
  const withSlashes = /^\d{2}\/\d{2}\/\d{4}$/.test(str)
  const withoutSlashes = /^\d{8}$/.test(str)
  
  if (!withSlashes && !withoutSlashes) return null
  
  let dateStr = str
  if (withoutSlashes) {
    dateStr = `${str.slice(0,2)}/${str.slice(2,4)}/${str.slice(4)}`
  }
  
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
  
  // Update the model if valid (accept both formats)
  if (value.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const parsed = parseDate(value)
    if (parsed) internalDate.value = parsed
  }
  else if (value.length === 8 && /^\d{8}$/.test(value)) {
    const parsed = parseDate(value)
    if (parsed) internalDate.value = parsed
  }
}

onMounted(() => {
  nextTick(() => {
    const input = document.querySelector('.custom-input')
    if (input) {
      input.setAttribute('maxlength', '10') // Allows DD/MM/YYYY (10 chars)
      input.setAttribute('inputmode', 'tel') // Shows numeric keyboard with slash on mobile
      input.setAttribute('pattern', '[0-9/]*')
      input.setAttribute('placeholder', 'DD/MM/YYYY')
      
      input.addEventListener('keydown', (e) => {
        // Allow: numbers (0-9), slash (/), backspace, delete, tab, arrows
        const allowedKeys = [
          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
          '/', 'Backspace', 'Delete', 'Tab',
          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
        ]
        
        // Allow Ctrl combinations (A, C, V, X)
        if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
          return
        }
        
        // Block any other key
        if (!allowedKeys.includes(e.key)) {
          e.preventDefault()
        }
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