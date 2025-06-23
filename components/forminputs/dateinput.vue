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
  if (!str || str.length !== 10) return null
  const [dd, mm, yyyy] = str.split('/')
  const isValid = /^\d{2}\/\d{2}\/\d{4}$/.test(str)
  const date = new Date(`${yyyy}-${mm}-${dd}`)
  return isValid && !isNaN(date) ? date : null
}

const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return ''
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
  const value = e.target.value
  const parsed = parseDate(value)
  if (parsed) internalDate.value = parsed
}

onMounted(() => {
  nextTick(() => {
    const input = document.querySelector('.custom-input')
    if (input) {
      input.setAttribute('maxlength', '10')
      input.setAttribute('inputmode', 'text') // ✅ Forces mobile keyboard with `/`
      input.setAttribute('pattern', '\\d{2}/\\d{2}/\\d{4}')
      input.setAttribute('placeholder', 'DD / MM / YYYY')
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
