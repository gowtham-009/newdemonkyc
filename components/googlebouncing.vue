<template>
  <div class="flex items-center justify-center space-x-2">
    <div 
      v-for="(dot, index) in dots" 
      :key="index"
      class="w-3 h-3 rounded-full animate-bounce"
      :class="dot.color"
      :style="`animation-delay: ${index * 0.1}s`"
    ></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dots: [
        { color: 'bg-red-500' },
        { color: 'bg-blue-500' },
        { color: 'bg-green-500' },
        { color: 'bg-orange-500' }
      ]
    }
  }
}
</script>

<style>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 0.6s infinite ease-in-out;
}


</style>