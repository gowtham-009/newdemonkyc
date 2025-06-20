<template>
  <div class="primary_color overflow-hidden h-screen">

    <!-- Box 1 -->
    <div class="w-full p-2 primary_color transition-all duration-300"  :style="{ height: box1Height + 'px' }" >
      <div class="w-full px-2 py-2 flex justify-end items-center">
        <ThemeSwitch />
      </div>

  <div class="w-full flex justify-center items-center" >
        <logo />
      </div>
    </div>

    <!-- Box 2 -->
    <div v-show="showBox2"
      class="w-full p-1 flex flex-col justify-between bg-white rounded-t-3xl dark:bg-black transition-all duration-300"
      :style="{ height: box2Height + 'px' }">
      <div class="w-full mt-2 px-2 flex flex-col justify-between">
        <span class="font-medium text-gray-500 text-md">Identity Verification</span>
        <p class="text-lg font-semibold dark:text-gray-400">Fill Your PAN Details</p>
        <p class="font-medium text-gray-500 text-md leading-5">This is required as mandated by regulator for verification
          purposes. </p>

          <div class="w-full">
              <NAME v-model="namevalue" />
          </div>

        <div class="w-full mt-2">
          <PAN v-model="panvalue" />
          <span class="text-red-500" v-if="panerror">{{ error }}</span>
        </div>

        <div class="w-full mt-2" v-if="dobbox">
          <DOB v-model="visibleDate" />
        </div>

        <div v-if="loginotpbox" class="w-full  mt-1">
          <p class="font-medium text-gray-500 text-md dark:text-gray-400">
            OTP Sent mobile number +91 {{ phoneNumber }}
          </p>
          <LOGINOTP v-model="loginotpval" />
          <span class="text-red-500" v-if="loginerror">{{ errorval }}</span>
          <div class="w-full flex justify-between items-center">
            <h2 class="font-medium text-md dark:text-gray-500">00:{{ timeLeft.toString().padStart(2, '0') }}s</h2>
            <p class="text-md font-medium text-center leading-5 text-gray-500" v-if="resend_sh">OTP Resent </p>
            <button :disabled="timeLeft" type="button" @click="kraaddresssubmission('resend')"
              class="text-lg font-medium text-blue-500 cursor-pointer ">Resend</button>
          </div>
        </div>
      </div>
      <div class="w-full">
        <Button ref="buttonRef" :disabled="!namevalue || !panvalue || !visibleDate || isSending" @click="handleButtonClick"
          class="primary_color w-full text-white py-3 text-xl border-0 wave-btn">
          <span ref="waveRef" class="wave"></span>
          {{ buttonText }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import {useRouter} from 'vue-router'
import ThemeSwitch from '~/components/darkmode/darkmodesign.vue';
import NAME from '~/components/forminputs/name.vue';
import PAN from '~/components/forminputs/paninput.vue';
import DOB from '~/components/forminputs/dateinput.vue';
import LOGINOTP from '~/components/forminputs/loginotp.vue';
import { encryptionrequestdata } from '~/utils/globaldata.js';
import { kradatares } from '~/utils/kradata.js';

const router=useRouter()

const { baseurl } = globalurl();
const {htoken}=headerToken()
const panerror = ref(false);
const panvalue = ref('');
const dobbox = ref(false);
const loginotpbox = ref(false);
const box1Height = ref(0);
const box2Height = ref(0);
const showBox2 = ref(false);
const error = ref('');
const loginerror = ref(false);
const errorval = ref('');
const buttonRef = ref(null);
const waveRef = ref(null);
const phoneNumber = ref('');
const emailid = ref('');
const loginotpval = ref('');
const visibleDate = ref('');
const isSending = ref(false);
const buttonText = ref("Continue");
const tokenval = ref('');

const namevalue=ref('')


const resend_sh = ref(false)
const timeLeft = ref(10);
let timer = null;
const emit = defineEmits(['updateDiv']);

watch(panvalue, (newVal) => {
  if (newVal.length === 10) {
    const pattern = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
    const isValid = pattern.test(newVal);
    panerror.value = !isValid;
    error.value = isValid ? '' : 'Please enter a valid PAN no';
    dobbox.value = isValid;
  } else {
    panerror.value = false;
    dobbox.value = false;
  }
});

onMounted(() => {
  localStorage.removeItem('userkey')
  const fullHeight = window.innerHeight;
  box1Height.value = fullHeight;
  box2Height.value = 0;
  showBox2.value = false;

  setTimeout(() => {
    showBox2.value = true;
    box1Height.value = fullHeight * 0.2;
    box2Height.value = fullHeight * 0.8;
  }, 500);

  window.addEventListener('resize', () => {
    const updatedHeight = window.innerHeight;
    box1Height.value = showBox2.value ? updatedHeight * 0.2 : updatedHeight;
    box2Height.value = showBox2.value ? updatedHeight * 0.8 : 0;
  });
});

onUnmounted(() => {
  clearInterval(timer);
});

const kraaddresssubmission = async (resend) => {

  const apiurl = `${baseurl.value}kra_pan`;
  const userkey = localStorage.getItem('userkey') || '';

  const encryptedPayload = await encryptionrequestdata({
    clientName:namevalue.value,
    panNo: panvalue.value,
    dob: visibleDate.value,
    pageCode: "mobile",
    userToken: userkey
  });

 const headertoken=htoken

  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization':headertoken
      },
      body: JSON.stringify({ payload: encryptedPayload })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if(data.payload.status=='error' && data.payload.code=='A1001'){
      panerror.value=true
      error.value=data.payload.message

    }
      else{
        console.log(data.payload.message)
      }


    if (resend == 'resend') {
      resend_sh.value = true
      timeLeft.value = 60;

      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value -= 1;
        } else {
          clearInterval(timer);
        }
      }, 1000);
    }
    return data;
  } catch (error) {
    console.error('Error during KRA address submission:', error.message);
    return null;
  }
};

const otpverfication = async () => {
  const apiurl = `${baseurl.value}login_verification`;
  const encrypted = encryptionrequestdata({
    userToken: tokenval.value,
    pageCode: "pan",
    otpCode: loginotpval.value
  });

   const headertoken=htoken
  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': headertoken
      },
      body: JSON.stringify({ payload: encrypted })
    });

    if (!response.ok) {
      throw new Error("Network error");
    }

    const data=await response.json();
    if(data.payload.status=='error' && data.payload.code=='AA1001'){
      loginerror.value=true
      errorval.value=data.payload.message
    }
    else if(data.payload.status=='error' && data.payload.code=='AA1002'){
       loginerror.value=true
      errorval.value=data.payload.message
    }
    else{
      console.log(data.payload.message)
    }
    return data
  } catch (error) {
    console.error('OTP verification failed:', error.message);
    return null;
  }
};

const handleButtonClick = async () => {
  if (isSending.value) return; // Prevent multiple rapid clicks

  // Start wave animation
  if (waveRef.value) {
    waveRef.value.className = 'wave start-half';
  }

  await new Promise(r => setTimeout(r, 400)); // Allow animation to play

  let data = null;

  // Determine if OTP verification or KRA address submission should occur
  if (loginotpbox.value==true) {
    data = await otpverfication();
  } else {
    data = await kraaddresssubmission();
  }

  if (!data) return; // Exit if no data returned

  // Trigger finish animation
  if (waveRef.value) {
    void waveRef.value.offsetWidth; // Force reflow to reset animation
    waveRef.value.className = 'wave finish-half';
  }

  setTimeout(async () => {
    const status = data?.payload?.status;
    const metaData = data?.payload?.metaData;

    // If handling OTP verification
    if (loginotpval.value.length === 4) {
      if (status === 'ok') {
        localStorage.setItem('userkey', tokenval.value);
        const mydata = await getServerData();
        const statuscheck = mydata?.payload?.metaData?.profile?.pageStatus;

        const pagetext = ['pan'];

        if (statuscheck) {
          const matchedPage = pagetext.find(page =>
            statuscheck.toLowerCase().includes(page)
          );

          if (matchedPage) {
            emit('updateDiv', matchedPage); // Go to known page
          } else {
            pagestatus(statuscheck); // Custom handler for other statuses
            router.push('/main'); // Default route
          }
        }
      } 

    } else {
      // If handling KRA address submission
      if (status === 'ok') {
        const kycData = metaData?.KYC_DATA;

        if (kycData?.APP_KRA_INFO || kycData?.APP_ERROR_DESC ) {
          localStorage.setItem('userkey', data.payload.userKey);
          
          router.push('/main'); // Redirect to main page
        } 
      
        
        else if (metaData?.loginStatus === 0) {
          // Start OTP timer
          timer = setInterval(() => {
            if (timeLeft.value > 0) {
              timeLeft.value -= 1;
            } else {
              clearInterval(timer);
            }
          }, 1000);

          // Show OTP input box and set user details
          loginotpbox.value = true;
          phoneNumber.value = metaData.mobile || '';
          emailid.value = metaData.email || '';
          tokenval.value = metaData.userKey;
        }
      }
    }
  }, 400);
};

watch(loginotpval, (val) => {
  loginerror.value = false;
  errorval.value = '';
  isSending.value = !(val.length === 4);
});
</script>

<style scoped>
.wave-btn {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  outline: none;
  transition: background 0.3s ease-in-out;
}

.wave {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(76, 75, 75, 0.3);
  pointer-events: none;
}

.wave.start-half {
  animation: waveHalf 0.4s ease-out forwards;
}

.wave.finish-half {
  animation: waveFinish 0.4s ease-out forwards;
}

@keyframes waveHalf {
  0% {
    width: 0%;
    opacity: 2;
  }

  100% {
    width: 70%;
    opacity: 2;
  }
}

@keyframes waveFinish {
  0% {
    width: 70%;
    opacity: 2;
  }

  100% {
    width: 100%;
    opacity: 0;
  }
}
</style>
