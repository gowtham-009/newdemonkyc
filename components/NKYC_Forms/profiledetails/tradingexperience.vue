<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <div class="flex justify-between  p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">

      <!-- Marital Status -->
      <div class="w-full mt-1 px-2 p-1" v-if="activebox === 'marriedbox'">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Trading Experience
        </p>
        <p class="text-sm  text-gray-500 font-normal leading-5">
          These details are required by SEBI to open your Demat account.
        </p>



        <div class="w-full  mt-2">

          <div class="w-full grid grid-cols-2 gap-2">
            <button v-for="option in options" :key="option.value" @click="selectMaritalStatus(option.value)" :class="[
              'px-6 py-2 rounded-lg border-2 text-md font-normal leading-5 w-full transition-all',
              selected === option.value
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-gray-200 border-gray-300 text-black'
            ]">
              {{ option.label }}
            </button>
          </div>
        </div>
               <span class="text-red-500">{{tradingerror }}</span>


      </div>


      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" ref="rippleBtn" @click="handleButtonClick" :disabled="!selected || !isStatusValid"
          class=" primary_color  text-white w-5/6 py-3 text-xl border-0  ">
          {{ buttonText }}
        </Button>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { pagestatus } from '~/utils/pagestatus.js'
const { baseurl } = globalurl();
const {htoken}=headerToken()
const deviceHeight = ref(0);
const buttonText = ref("Next");
const rippleBtn = ref(null);
const activebox = ref('marriedbox');
const emit = defineEmits(['updateDiv']);
const rippleBtnback = ref(null)
const isStatusValid = ref(true);
const isBack = ref(true);
const tradingerror=ref('')
import { useRouter } from 'vue-router';
const router = useRouter();
// qualification Status
const selected = ref("");
const options = [
  { label: "New to Trading", value: "New to Trading" },
  { label: "1-2 Years of Experience", value: "1-2 Years of Experience" },
  { label: "2-5 Years of Experience", value: "2-5 Years of Experience" },
  { label: "5-10 Years of Experience", value: "5-10 Years of Experience" },

];

const selectMaritalStatus = (value) => {
  tradingerror.value=''
  selected.value = value;
};


const profilesetinfo = async () => {
  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.personal?.tradingExperience;
  if (statuscheck) {
    selected.value = mydata?.payload?.metaData?.personal?.tradingExperience 
  }
  else  {
    selected.value = ''
  }
 
};

await profilesetinfo()
onMounted(() => {
  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});

const back = () => {
  const button = rippleBtnback.value
  const circle = document.createElement('span')
  circle.classList.add('ripple')
  const rect = button.$el.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  circle.style.left = `${x}px`
  circle.style.top = `${y}px`
  button.$el.appendChild(circle)
  setTimeout(async() => {
    circle.remove()
 const data = await pagestatus('qualification')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'qualification');
  isBack.value = false;
}

  }, 600)

};


const personalinfo = async () => {
  const apiurl = `${baseurl.value}personal_info`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: "occupation",
    tradingExperience: selected.value,

  });
const headertoken=htoken
  const payload = { payload: user };
  const jsonString = JSON.stringify(payload);
  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization': headertoken,
        'Content-Type': 'application/json',
      },
      body: jsonString,
    })

    if (!response.ok) {
      throw new Error("Network is error", response.status);

    }
    else {
      const decryptedData = await response.json()
      const data = await decryptionresponse(decryptedData);
      if (data.payload.status == 'ok') {
        emit('updateDiv', 'occupation');
      }

       else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }

               else if(data.payload.status=='error' && data.payload.errors.length>0){
      tradingerror.value=""

   
    
  data.payload.errors.forEach((err) => {
    

    if (err.field === 'tradingExperience' && !selected.value) {
      tradingerror.value = err.message || ' ';
    }
 
  });
}
       
      }


      


    }

  } catch (error) {
    console.log(error.message)
  }
}
const handleButtonClick = () => {
  const button = rippleBtn.value
  const circle = document.createElement('span')
  circle.classList.add('ripple')

  const rect = button.$el.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  circle.style.left = `${x}px`
  circle.style.top = `${y}px`

  button.$el.appendChild(circle)

  setTimeout(() => {
    circle.remove()
    personalinfo()
    isStatusValid.value = false;
  }, 600)
};
</script>
