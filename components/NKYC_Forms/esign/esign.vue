<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <div v-if="content" class="flex justify-between items-center px-2 p-1 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full p-1">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">Esign</p>
        <p class="text-sm text-gray-500 font-normal leading-5">
          You will receive OTP to Aadhaar Linked Mobile No
        </p>
        <div class="w-full mt-2 rounded-lg bg-blue-50 gap-1 p-2 dark:!bg-gray-800">
          <div v-for="(step, index) in steps" :key="index" class="w-full flex ">
            <div class="font-normal text-sm text-gray-500">{{ step.label }}</div>
            <div class="font-normal text-sm text-gray-500">{{ step.text }}</div>
          </div>
        </div>
  <div v-if="loadingen" class="max-w-md mx-auto p-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg ">
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-1">
      {{ syncStatus.icon }} {{ syncStatus.title }}
    </h2>

    <p class="text-gray-600 dark:text-gray-300 mb-2">
      {{ syncStatus.message }}
    </p>

    <div class="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-6 overflow-hidden relative">
      <div
        class="bg-blue-600 h-6 text-white text-sm font-medium text-center flex items-center justify-center transition-all duration-300 ease-in-out"
        :style="{ width: progress + '%' }"
      >
        {{ progress.toFixed(2) }}%
      </div>
    </div>
  </div>

      </div>

      
      

      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" ref="rippleBtn" @click="handleButtonClick" :disabled="!isStatusValid"
          class=" primary_color  text-white w-5/6 py-3 text-xl border-0  ">
          {{ buttonText }}
        </Button>
      </div>
    </div>

   
       <div v-if="loadingen" class="max-w-md mx-auto p-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg ">
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">
      {{ syncStatus.icon }} {{ syncStatus.title }}
    </h2>

    <p class="text-gray-600 dark:text-gray-300 mb-4">
      {{ syncStatus.message }}
    </p>

    <div class="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-6 overflow-hidden relative">
      <div
        class="bg-blue-600 h-6 text-white text-sm font-medium text-center flex items-center justify-center transition-all duration-300 ease-in-out"
        :style="{ width: progress + '%' }"
      >
        {{ progress.toFixed(2) }}%
      </div>
    </div>
  </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const emit = defineEmits(['updateDiv']);
const { baseurl } = globalurl();
const {htoken}=headerToken()
import { useRouter } from 'vue-router';
const router = useRouter();
const deviceHeight = ref(window.innerHeight);
const buttonText = ref('Ready for Esign');
const rippleBtn = ref(null);
const rippleBtnback = ref(null);
const content = ref(true);
const loading = ref(false);
const isStatusValid = ref(true);
const isBack = ref(true);
const route = useRoute();
const loadingen=ref(false)

const steps = [
  { label: 'A.', text: 'Click Next Step' },
  { label: 'B.', text: 'Enter OTP received in your Mobile Number' },
  { label: 'C.', text: 'Click Proceed' },
  { label: 'D.', text: 'Enter Aadhaar Number' },
  { label: 'E.', text: 'Enter Aadhaar OTP (Check Aadhaar Linked Mobile Number)' },
  { label: 'F.', text: 'Esign Complete' },
];

onMounted(() => {
  if (route.query.documentId) {
    esignStatusCheck(route.query.documentId);
  }

  const updateHeight = () => {
    deviceHeight.value = window.innerHeight;
  };
  window.addEventListener('resize', updateHeight);
});


const progress = ref(0);
const progressInterval = ref(null);
const syncStatus = computed(() => {
  if (progress.value <= 30) {
    return {
     
      title: 'Syncing',
      message: 'Saving...'
    };
  } else if (progress.value <= 80) {
    return {
     
      title: 'Syncing',
      message: 'Verifying...'
    };
  } else if (progress.value < 100) {
    return {
      
      title: 'Syncing',
      message: 'Completing...'
    };
  } else {
    return {
      
      title: 'Syncing',
      message: 'Esign Generate successfully!'
    };
  }
});

const startProgressAnimation = () => {
  progress.value = 0;
  // Smooth progress animation
  progressInterval.value = setInterval(() => {
    if (progress.value < 90) { // Only animate to 90%, rest will complete on API success
      progress.value += Math.random() * 10;
      if (progress.value > 90) progress.value = 90;
    }
  }, 300);
};

const completeProgress = () => {
  clearInterval(progressInterval.value);
  progress.value = 100;
  setTimeout(() => {
    loadingen.value = false;
  }, 500);
};

const resetProgress = () => {
  clearInterval(progressInterval.value);
  loadingen.value = false;
  progress.value = 0;
};


const createunsignedDocument = async () => {
    const headertoken=htoken
  loadingen.value = true
   startProgressAnimation();
  const apiurl = `${baseurl.value}nkyc_document`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
  });

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
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const decryptedData = await response.json();
    const data = await decryptionresponse(decryptedData);
    if (data.payload.status == 'ok') {
      completeProgress();
       createEsign()
    }

      else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
}

  } catch (error) {
    resetProgress();
    console.error(error.message);
  }
};

const createEsign = async () => {
 const headertoken=htoken
  const apiurl = `${baseurl.value}esign`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: 'esign',
    redirectUrl: 'https://nkcynewone.vercel.app/main',
    esignAction: 'createEsign',
  });

  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization': headertoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: user }),
    });

    if (!response.ok) throw new Error(`Network error: ${response.status}`);
    const decryptedData = await response.json();
    const data = await decryptionresponse(decryptedData);
    if (data.payload.status === 'ok') {
      const decoded = atob(data.payload.metaData.dataEsign);
      window.location.href = decoded;
    }
      else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
}
  } catch (error) {
    console.error('Create Esign failed:', error.message);
  } finally {
    content.value = true;
    loading.value = false;
  }
};

const esignStatusCheck = async (requestId) => {
  const apiurl = `${baseurl.value}esign`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),

    esignId: requestId,
    esignAction: 'checkEsignStatus',
  });
const headertoken=htoken
  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization':headertoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: user }),
    });

    if (!response.ok) throw new Error(`Network error: ${response.status}`);
    const decryptedData = await response.json();
const data = await decryptionresponse(decryptedData);
    if (data.payload.status === 'ok') {
      content.value = false;
      loading.value = true;
      route.query.documentId = null;

      const mydata = await getServerData();
      const statuscheck = mydata?.payload?.metaData?.segments;

      if (statuscheck) {
        const {
          nseCASH, bseCASH,
          nseFO, bseFO,
          nseCOM, bseCOM, MCX,
          nseCD, nseMF,
          bseCD, bseMF,
          MCXcategory, ICEX, mseCD
        } = statuscheck;
        
        const onlyCashYes =
          nseCASH === 'YES' &&
          bseCASH === 'YES' &&
          nseFO !== 'YES' &&
          bseFO !== 'YES' &&
          nseCOM !== 'YES' &&
          bseCOM !== 'YES' &&
          MCX !== 'YES' &&
          nseCD !== 'YES' &&
          bseCD !== 'YES' &&
          nseMF !== 'YES' &&
          bseMF !== 'YES' &&
          MCXcategory !== 'YES' &&
          ICEX !== 'YES' &&
          mseCD !== 'YES';
        if (onlyCashYes) {
          pagestatus('thankyou');
          emit('updateDiv', 'thankyou');
        } else {
          pagestatus('bankfile');
          emit('updateDiv', 'bankfile');
        }
      }
    }

      else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
}
  } catch (error) {
    console.error('Status check failed:', error.message);
  }
};



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
    

  if (!loadingen.value && isStatusValid.value) {
      createunsignedDocument();
      isStatusValid.value = false;
    }
  }, 600)
}

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
  
    
 const data = await pagestatus('signdraw')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'signdraw');
  isBack.value = false;
}

  }, 600)

}

</script>
<style scoped>

.ripple {
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple-animation 0.6s linear;
  pointer-events: none;
}

@keyframes ripple-animation {
  from {
    transform: scale(0);
    opacity: 1;
  }
  to {
    transform: scale(2);
    opacity: 0;
  }
}

.pi-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
