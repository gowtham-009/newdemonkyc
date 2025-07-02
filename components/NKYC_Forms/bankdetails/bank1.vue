<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>
    <div class="flex justify-between  p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full px-2 p-1">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Link your bank account
        </p>

        <p class="text-sm  text-gray-500 font-normal leading-4">
          Please provide your bank account details to link your bank account with your trading account.
        </p>

        <div class="w-full ">
          <div>
            <span class="text-gray-500 text-sm mt-1">Account Type</span>
            <div class="flex gap-2">
              <div class="flex items-center gap-2">
                <RadioButton v-model="selected" inputId="SAVING " name="id" value="SAVING " @change="emitSelection" />
                <label for="SAVING " class="text-gray-500 text-sm">Saving</label>
              </div>
              <div class="flex items-center gap-2">
                <RadioButton v-model="selected" inputId="CURRENT " name="id" value="CURRENT " @change="emitSelection" />
                <label for="CURRENT " class="text-gray-500  text-sm">Current </label>
              </div>

            </div>
 <span class="text-red-500">{{ accnotypeerror }}</span>
          </div>

          <div>
            <span class="text-gray-500  text-sm">Account No</span>
            <Accno v-model="accno" />
             <span class="text-red-500">{{ accnoerror }}</span>

          </div>


          <div>
            <span class="text-gray-500  text-sm">IFSC Code</span>
            <IFSC v-model="ifsc" />
                  <span class="text-red-500">{{ ifscerror }}</span>

          </div>


          <div>
            <span class="text-gray-500  text-sm">MICR Code</span>
            <MICR v-model="micr" />
                  <span class="text-red-500">{{ micrerror }}</span>

          </div>

          <div>
            <span class="text-gray-500  text-sm">Bank Name</span>
            <Bankname v-model="bankname" />
                  <span class="text-red-500">{{ banknameerror }}</span>

          </div>

          <div>
<span class="text-gray-500  text-sm">BanK Address</span>
            <Address v-model="address" />
                  <span class="text-red-500">{{ addresserror }}</span>

          </div>

          <div v-if="errorbox" class="w-full px-2 py-2 mt-1 rounded-lg bg-red-50">
            <p class=" text-sm text-red-600 leading-4 text-center">{{ errormsg }}</p>
          </div>

           <div v-if="waitingbox" class="max-w-md mx-auto p-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg ">
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
      </div>

      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button @click="handleButtonClick" ref="rippleBtn" :disabled="!bankname || !accno || !ifsc || !micr || !address || !isStatusValid"
          class="primary_color  w-5/6 text-white  py-3 text-xl border-0">
          {{ buttonText }}
        </Button>
      </div>


    </div>

  </div>






</template>
<script setup>

import { ref, onMounted, watch } from 'vue';
import Bankname from '~/components/NKYC_Forms/bankdetails/bankinputs/bankname.vue'
import Accno from '~/components/NKYC_Forms/bankdetails/bankinputs/accno.vue'

import IFSC from '~/components/NKYC_Forms/bankdetails/bankinputs/ifsc.vue'
import MICR from '~/components/NKYC_Forms/bankdetails/bankinputs/micr.vue'
import Address from '~/components/NKYC_Forms/bankdetails/bankinputs/address.vue'
const emit = defineEmits(['updateDiv']);
import { useRouter } from 'vue-router';
const router = useRouter();

import { pagestatus } from '~/utils/pagestatus.js'
const { baseurl } = globalurl();
const {htoken}=headerToken()
const isBack = ref(true);
const deviceHeight = ref(0);
const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const buttonText = ref("Next");
const prooftype = ref('')
const inputval = ref('')

const bankname = ref("");
const accno = ref("");
const ifsc = ref("");
const micr = ref("");
const address = ref("");
const selected = ref('SAVING')
const errorbox = ref(false)
const waitingbox = ref(false)
const errormsg = ref('')
const isStatusValid = ref(true);


// error
const accnotypeerror=ref('')
const accnoerror=ref('')
const ifscerror=ref('')
const micrerror=ref('')
const banknameerror=ref('')
const addresserror=ref('')

const profilesetinfo = async () => {
  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.bank ;

  if (statuscheck) {

    selected.value = mydata?.payload?.metaData?.bank?.bank1AccType 
    accno.value = mydata?.payload?.metaData?.bank?.bank1AccNo 
    ifsc.value = mydata?.payload?.metaData?.bank?.bank1IFSC 
    micr.value = mydata?.payload?.metaData?.bank?.bank1MICR 
    address.value = mydata?.payload?.metaData?.bank?.bank1Address 
    bankname.value = mydata?.payload?.metaData?.bank?.bank1Name 

  }
  else {
    selected.value = ''
    accno.value = ''
    ifsc.value = ''
    micr.value =''
    address.value = ''
    bankname.value = ''
  }
};
await profilesetinfo()


const emitSelection = () => {
  prooftype.value = selected.value
  inputval.value = ''
}

onMounted(() => {
  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});


watch(ifsc, (newIfsc) => {
  if (newIfsc && newIfsc.length === 11) {
    getbankaddress(newIfsc)
  }
});


const progress = ref(0);
const progressInterval = ref(null);
const syncStatus = computed(() => {
  if (progress.value <= 30) {
    return {
     
      title: 'Syncing',
      message: 'Verifying bank details'
    };
  } else if (progress.value <= 80) {
    return {
      
      title: 'Syncing',
      message: 'Verifying document with SEBI records...'
    };
  } else if (progress.value < 100) {
    return {
     
      title: 'Syncing',
      message: 'Completing your application...'
    };
  } else {
    return {
     
      title: 'Syncing',
      message: 'Bank details uploaded successfully!'
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
    waitingbox.value = false;
  }, 500);
};

const resetProgress = () => {
  clearInterval(progressInterval.value);
  waitingbox.value = false;
  progress.value = 0;
};




const getbankaddress = async (ifscval) => {
  const apiUrl = `https://ifsc.razorpay.com/${ifscval}`;
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.status);
    }
    const data = await response.json();
    if (data) {

       accnotypeerror.value=""
     accnoerror.value =""
     ifscerror.value=""
     micrerror.value=""
     banknameerror.value=""
     addresserror.value=""
     
      micr.value = data.MICR;
      bankname.value = data.BANK;
      address.value = data.ADDRESS;


    }

  } catch (error) {
    console.error('Error:', error);
  }
};


const bankvalidation = async () => {

  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.bank?.bank1AccNo
  if (statuscheck == accno.value) {
    waitingbox.value = false
  }
  else {

    waitingbox.value = true
    startProgressAnimation();
    errorbox.value = false
  }

  const apiurl = `${baseurl.value}bank`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: "bank4",
    bankAccType: selected.value,
    bankAccNo: accno.value,
    bankIFSC: ifsc.value,
    bankMICR: micr.value,
    bankName: bankname.value,
    bankAddress: address.value


  });
const headertoken=htoken
  const payload = { payload: user };
  const jsonString = JSON.stringify(payload);

  try {
    const response = await fetch(apiurl, {
      method: 'POST',

      headers: {
        'Authorization': headertoken
      },
      body: jsonString,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.status);
    }

    const decryptedData = await response.json();
       const data = await decryptionresponse(decryptedData);
      accnotypeerror.value=""
     accnoerror.value =""
     ifscerror.value=""
     micrerror.value=""
     banknameerror.value=""
     addresserror.value=""
    if (data.payload.status=='ok'&&(data.payload.metaData.bankVerifyStatus == 1 || data.payload.metaData.bankVerifyStatus == 0)) {
      errorbox.value = false
       completeProgress();
      emit('updateDiv', 'bank4');

    }
    else if (data.payload.status == 'error' && data.payload.code=='H1002') {
  
      waitingbox.value = false
      errorbox.value = true
      errormsg.value = data.payload.message
      isStatusValid.value=false
    }
    
      else if (data.payload.status == 'error') {
        waitingbox.value=false
        if (data.payload.code == '1002' || data.payload.code=='1004')
        {
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
          else if(data.payload.status=='error' && data.payload.errors.length>0) {
     
  data.payload.errors.forEach((err) => {
    
if (err.field === 'bankAccType' && !selected.value) {
      accnotypeerror.value = err.message || ' ';
    }
    if (err.field === 'bankAccNo' && !accno.value) {
      accnoerror.value = err.message || ' ';
    }
    if (err.field === 'bankIFSC' && !ifsc.value) {
      ifscerror.value = err.message || ' ';
    }
    if (err.field === 'bankMICR' && !micr.value) {
      micrerror.value = err.message || ' ';
    }
    if (err.field === 'bankName' && !bankname.value) {
      banknameerror.value = err.message || ' ';
    }
     if (err.field === 'bankAddress' && !addresserror.value) {
      addresserror.value = err.message || ' ';
    }
  });
}
       
      }
    
  
  
    
 

  } catch (error) {
    resetProgress();
    console.error('Error:', error);
    waitingbox.value = false
  }
  finally {
    waitingbox.value = false
    isStatusValid.value=true
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



   if (!waitingbox.value && isStatusValid.value ) {
      bankvalidation();
      isStatusValid.value = false;
    }
  }, 600)
};



function back() {
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
   circle.remove()

 const data = await pagestatus('nominee')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'nominee');
  isBack.value = false;
}
  }, 600)

}


</script>
