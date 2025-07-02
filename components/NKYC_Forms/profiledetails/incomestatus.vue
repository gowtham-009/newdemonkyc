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
          Your annual income
        </p>
        <p class="text-sm text-gray-500 font-normal leading-5">
          These details are required by SEBI to open your Demat account.
        </p>

        <div class="grid grid-cols-2 gap-2 mt-2">
          <button v-for="option in options" :key="option.value" @click="selectMaritalStatus(option.value)" :class="[
            'px-6 py-2 rounded-lg border-2 text-md font-normal w-full leading-5 transition-all',
            selected === option.value
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-gray-200 border-gray-300 text-black'
          ]">
            {{ option.label }}
          </button>
        </div>
            <span class="text-red-500">{{ incomeerror }}</span>
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
import { useRouter } from 'vue-router';
const router = useRouter();
const emit = defineEmits(['updateDiv']);
const deviceHeight = ref(0);
const activebox = ref('marriedbox');
const buttonText = ref("Next");
const rippleBtn = ref(null);
const isStatusValid = ref(true);
const rippleBtnback = ref(null)
const isBack = ref(true);
const incomeerror=ref('')
const selected = ref("");
const options = [
  { label: "Below 1 lakh", value: "BELOW 1 LAC" },
  { label: "1 lakh to 5 lakhs", value: "1-5 LAC" },
  { label: "5 lakhs to 10 lakhs", value: "5-10 LAC" },
  { label: "10 lakhs to 25 lakhs", value: "10-25 LAC" },
  { label: "Above 25 lakhs", value: "> 25 LAC" },

];

const selectMaritalStatus = (value) => {
  incomeerror.value=''
  selected.value = value;
};


const profilesetinfo = async () => {
  try {
    const mydata = await getServerData();
    const incomeData = mydata?.payload?.metaData?.kraPan?.APP_INCOME
    const personalIncome = mydata?.payload?.metaData?.personal?.annualIncome || '';
    const kraIncome = mydata?.payload?.metaData?.kraIdentityData?.income?.[incomeData] || '';
    selected.value = personalIncome || kraIncome;
    if (!selected.value) {
      selected.value = '';
    }

  } catch (error) {
    console.error('Error in profilesetinfo:', error);
    
  }
};


await profilesetinfo()
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
  const data = await pagestatus('occupation')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'occupation');
  isBack.value = false;
}
  }, 600)

};


onMounted(() => {
  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});

const personalinfo = async () => {
  const apiurl = `${baseurl.value}personal_info`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: "nominee",

    annualIncome: selected.value,

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
      incomeerror.value = ""
      if (data.payload.status == 'ok') {
        emit('updateDiv', 'nominee');
      }
         else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }

           else if(data.payload.status=='error' && data.payload.errors.length>0){
  

   
    
  data.payload.errors.forEach((err) => {
    

    if (err.field === 'annualIncome' && !selected.value) {
      incomeerror.value = err.message || ' ';
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
