<template>
  <div>
    <button @click="loc">loction</button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGeolocation } from '~/composables/useGeolocation';

const { coords, error, isLoaded, getLocation } = useGeolocation();

const loc=()=>{
  alert(loc)
getLocation();
}

onMounted(() => {
  loc()
})

</script>
