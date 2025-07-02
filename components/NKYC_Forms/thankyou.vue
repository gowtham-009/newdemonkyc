<template>
  <div class="primary_color">
    <!-- Top Bar -->
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <!-- Main Content -->
    <div class="flex justify-center flex-col items-center  px-2 p-1  bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full p-1"></div>

      <!-- GIF -->
      <div class="w-full p-1 flex flex-col justify-center items-center">
        <img :src="gifSrc" alt="Loading animation" class="w-32 h-32" />
        <p class="text-center text-xl text-gray-500">Thankyou</p>
       
      </div>


     
    </div>

  
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['updateDiv']);
const deviceHeight = ref(0);

const gifSrc = ref('');






onMounted(() => {

  const timestamp = Date.now();
  gifSrc.value = `/image/completetic.gif?t=${timestamp}`;

  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });


});




</script>

<style scoped>
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  animation: ripple 0.6s linear;
  width: 100px;
  height: 100px;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>