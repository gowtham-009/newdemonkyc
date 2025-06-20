<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo  />
      <profile />
    </div>

    <div class="flex justify-between  p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">

      <!-- Marital Status -->
      <div class="w-full mt-1 px-2" v-if="activebox === 'marriedbox'">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Your information
        </p>
        <p class="text-sm text-gray-500 font-normal leading-5">
          These details are required by SEBI to open your Demat account.
        </p>

        <div class="w-full  mt-3">
          <p class="text-gray-600 text-md font-medium ">Gender</p>
          <div class="grid grid-cols-2 gap-1">
            <button v-for="option in selectoptions" :key="option.value" @click="selectGenderStatus(option.value)"
              :class="[
                'px-6 py-2 rounded-lg border-2 text-md font-normal w-full transition-all',
                selectedgender === option.value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-200 border-gray-300 text-black'
              ]">
              {{ option.label }}
            </button>
           
          </div>
        </div>
     
             <span class="text-red-500">{{ gendererror }}</span>

        <div class="w-full  mt-2">
          <p class="text-gray-600 text-md font-medium ">Marital status</p>
          <div class="w-full flex gap-1">
            <button v-for="option in options" :key="option.value" @click="selectMaritalStatus(option.value)" :class="[
              'px-6 py-2 rounded-lg border-2 text-md font-normal w-full transition-all',
              selected === option.value
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-gray-200 border-gray-300 text-black'
            ]">
              {{ option.label }}
            </button>

          </div>
        </div>
<span class="text-red-500">{{ maritalerror }}</span>
        <div class="w-full mt-2 ">
          <span class="text-gray-600 text-md font-medium">
            Are you PEP/Related to PEP
          </span> <br>
          <span class="text-gray-600 text-md font-medium">
            [PEP=Politically Exposed Person]
          </span>

          <div class="w-full ">
            <div class="w-full flex gap-1">
              <button v-for="option in clientoptions" :key="option.value" @click="clientstatus(option.value)" :class="[
                'px-6 py-2 rounded-lg border-2 text-md font-normal w-full transition-all',
                clientselected === option.value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-200 border-gray-300 text-black'
              ]">
                {{ option.label }}
              </button>
          
                                      
            </div>
          </div>
           <span class="text-red-500">{{ peperror }}</span>

        </div>


      </div>


      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" ref="rippleBtn" @click="handleButtonClick"
          :disabled="!selectedgender || !selected || !clientselected || !isStatusValid"
          class=" primary_color text-white w-5/6 py-3 text-xl border-0  ">
          {{ buttonText }}
        </Button>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { pagestatus } from '~/utils/pagestatus.js'
import { useRouter } from 'vue-router';
const router = useRouter();
const { baseurl } = globalurl();
const {htoken}=headerToken()
const deviceHeight = ref(0);

const buttonText = ref("Next");
const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const activebox = ref('marriedbox');
const emit = defineEmits(['updateDiv']);
const isStatusValid = ref(true);
const isBack = ref(true);

const gendererror=ref('')
const maritalerror=ref('')
const peperror=ref('')
// gender status
const selectedgender = ref("");
const selectoptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Transgender", value: "Transgender" },
];

const selectGenderStatus = (value) => {
  selectedgender.value = value;
};
// Marital Status
const selected = ref("");
const options = [
  { label: "Unmarried", value: "unmarried" },
  { label: "Married", value: "married" },
];

const selectMaritalStatus = (value) => {
  selected.value = value;
};

const clientselected = ref("");
const clientoptions = [
  { label: "No, I am Not", value: "No, I am Not" },
  { label: "Yes, I am", value: "Yes, I am" },
];

const clientstatus = (value) => {
  clientselected.value = value;
};



const profilesetinfo = async () => {
  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.kraPan?.APP_KRA_INFO || '';

  if (statuscheck) {
    const gender = mydata?.payload?.metaData?.kraPan?.APP_GEN || '';
    selectedgender.value = gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other';

    const marriedstatus = mydata?.payload?.metaData?.kraPan?.APP_MAR_STATUS || '';
    selected.value = marriedstatus === '01' ? 'married' : marriedstatus === '02' ? 'unmarried' : 'other';

    clientselected.value = mydata?.payload?.metaData?.personal?.pep || 'No, I am Not'
  }
  else if (mydata?.payload?.metaData?.digi_info?.aadhaarUID && mydata?.payload?.metaData?.digi_docs?.aadhaarDocument) {
    const gender = mydata?.payload?.metaData?.digi_info?.gender || ''
    selectedgender.value = gender === 'MALE' ? 'Male' : gender === 'FEMALE' ? 'Female' : 'Other';

    const marriedstatus = mydata?.payload?.metaData?.personal?.maritalStatus || '';
    selected.value = marriedstatus

    clientselected.value = mydata?.payload?.metaData?.personal?.pep || 'No, I am Not'
  }
  else {

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

  setTimeout(async () => {

    circle.remove()
   const data = await pagestatus('parmanentaddress')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'parmanentaddress');
  isBack.value = false;
}
  }, 600)

};


const personalinfo = async () => {
  const apiurl = `${baseurl.value}personal_info`;
  const user = encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: "clientinfo",
    gender: selectedgender.value,
    maritalStatus: selected.value,
    pep: clientselected.value
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
      const data = await response.json()
         gendererror.value=""
     maritalerror.value =""
     peperror.value=""
      if (data.payload.status == 'ok') {
        emit('updateDiv', 'clientinfo');
      }
 else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }

        else if(data.payload.status=='error' && data.payload.errors.length>0) {
   
    
  data.payload.errors.forEach((err) => {
    

    if (err.field === 'gender' && !selectedgender.value) {
      gendererror.value = err.message || ' ';
    }
    if (err.field === 'maritalStatus' && !selected.value) {
      maritalerror.value = err.message || ' ';
    }
    if (err.field === 'pep' && !clientselected.value) {
      peperror.value = err.message || ' ';
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
    isStatusValid.value=false
  }, 600)
};
</script>
