<template>
  <div class="w-full">
    <div class="w-full flex justify-center">
      <img
        v-if="localSrc"
        @click="visible = true"
        :src="localSrc"
        alt="PAN Image"
        class="shadow-md rounded-xl mb-1 h-40"
        style="filter: grayscale(100%)"
      />
    </div>

    <FileUpload
      mode="basic"
      @select="onFileSelect"
      chooseLabel="Upload PAN"
      customUpload
      auto
      :showUploadButton="false"
      :showCancelButton="false"
      accept="image/*"
      class="p-button-outlined p-button-secondary w-full"
    />

    <!-- Error Message -->
    <p v-if="errorMessage" class="text-red-500 text-sm mt-1 text-center">
      {{ errorMessage }}
    </p>

    <Dialog v-model:visible="visible" modal header="View" :style="{ width: '25rem' }">
      <img
        v-if="localSrc"
        :src="localSrc"
        alt="PAN Image"
        class="shadow-md rounded-xl w-full mb-1"
        style="filter: grayscale(100%)"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: String
})
const emit = defineEmits(['update:src', 'update:valid'])

const localSrc = ref(props.src || null)
const visible = ref(false)
const errorMessage = ref('')

watch(() => props.src, (newVal) => {
  localSrc.value = newVal
})

function onFileSelect(event) {
  const file = event.files[0]

  if (!file || !file.type.match(/^image\/(jpeg|png)$/)) {
    errorMessage.value = 'Only JPG or PNG image files are allowed.'
    localSrc.value = null
    emit('update:src', null)
    emit('update:valid', false)
    return
  }

  errorMessage.value = ''
  const reader = new FileReader()

  reader.onload = (e) => {
    localSrc.value = e.target.result
    emit('update:src', localSrc.value)
    emit('update:valid', true)
  }

  reader.readAsDataURL(file)
}
</script>
<style>
.p-message-error{
  display: none !important;
}
</style>