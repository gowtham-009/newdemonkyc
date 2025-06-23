<template>
    <div ref="dropdownRef" class="relative inline-block ">
        <!-- Toggle Button -->
        <Button  class="rounded-full bg  w-10 h-10 border-0 text-2xl flex-shrink-0 shadow " @click="toggleDropdown">
            <i class="pi pi-user text-2xl text-white"></i>
        </Button>

        <!-- Dropdown Panel -->
        <div v-show="dropdownOpen" class="absolute right-2 mt-1 w-60 bg-white shadow-lg rounded-lg z-10 dark:bg-slate-900">
            <ul class="py-2">
                <li class="px-4 py-2  cursor-pointer dark:text-gray-500"><span class="text-xl">Welcome</span> <br> <span
                        class="text-2xl">{{ gust }}</span></li>
                <hr>
                <li class="px-4 flex justify-center py-2 cursor-pointer">
                    <darkmode class="w-full" />
                </li>
                <li class="px-4 py-2  cursor-pointer">
                    <button @click="logout"
                        class="p-3 bg-gray-300 w-full dark:bg-black dark:text-gray-500 rounded-lg flex items-center gap-2">
                        <i class="pi pi-sign-out text-gray-500"></i>
                        <span>Logout</span>  
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
const gust = ref('')
const dropdownOpen = ref(false)
const dropdownRef = ref(null)


const router = useRouter()

const gustfun=async()=>{
const mydata = await getServerData();
const statuscheck=mydata.payload.metaData.kraPan.APP_KRA_INFO
if(statuscheck){
    gust.value=mydata.payload.metaData.profile.clientName ||'Gust'
}
else{
     gust.value=mydata.payload.metaData.profile.clientName ||'Gust'
}
}
function toggleDropdown() {
    dropdownOpen.value = !dropdownOpen.value
}

// Click outside handler
function handleClickOutside(event) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        dropdownOpen.value = false
    }
}

onMounted(async() => {
    await gustfun()
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

async function logout() {
      localStorage.removeItem('userkey')
       localStorage.removeItem('latitude')
        localStorage.removeItem('longitude')
    
       router.push('/');


}

</script>

<style scoped>
/* You can add transitions or custom styles here */
.bg{
    background-color: rgb(100, 106, 233) !important;
}
</style>