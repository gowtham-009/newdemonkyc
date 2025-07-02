<template>
  <div class="primary_color">
    <div class="flex justify-between items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>
    <div class="flex justify-between  p-2 px-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">

      <div class="w-full p-1 mt-2">
        <div class="w-full mt-2 ">
          <div class="w-full">
            <p class="text-xl font-medium dark:text-gray-400">Add your email</p>
            <p class=" leading-5 text-sm font-normal text-gray-500">
              This is where we'll send you important updates and insights on the market.
            </p>
          </div>

          <div class="w-full mt-3">
            <div class="w-full" :class="{ 'disabled-div': emailbox }"
              :style="emailbox ? { pointerEvents: 'none', opacity: 0.5 } : {}">
              <EmailInput v-model="emailid" />
              <span v-if="erroremail" class="text-red-500">{{ emailerror }}</span>
            </div>
          </div>
        </div>
        <div class="w-full mt-2" v-if="emailbox">
          <p class="font-medium text-slate-800 text-xl dark:text-gray-400">
            OTP sent
          </p>
          <p class="text-sm leading-6  font-normal text-gray-500">
            We have sent an OTP to your email {{ emailidtext }}
            <Chip @click="otpclear()" class="bg-blue-50 py-1 text-blue-500" label="Change Email ID" />
          </p>
          <div class="w-full mt-3">
            <emailOTP v-model="e_otp" />
            <span v-if="otperror" class="text-red-500">{{ errorotp }}</span>
            <div class="w-full h-8">
              <p class="text-sm font-medium text-center text-gray-500" v-if="resend_sh">OTP Resend
                Successfully ({{ emailidtext }}) </p>
            </div>
            <div class="w-full mt-4 flex justify-between items-center">
              <h2 class="font-medium text-md dark:text-gray-500">00:{{ timeLeft.toString().padStart(2, '0')
              }}s</h2>

              <button :disabled="timeLeft" type="button" @click="sendemailotp('resend')" disabled
                class="text-lg font-medium text-blue-500 cursor-pointer ">Resend</button>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" ref="rippleBtn" label="Verify OTP"
          class="primary_color text-white w-5/6 py-3 text-xl border-0" @click="handleButtonClick()"
          :disabled="isButtonDisabled || !isStatusValid">
          {{ buttonText }}
        </Button>
      </div>
    </div>


  </div>


</template>

<script setup>

import emailOTP from '~/components/forminputs/emailotp.vue'
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import EmailInput from '~/components/forminputs/emailinput.vue';

import { encryptionrequestdata } from '~/utils/globaldata.js'
import { getServerData } from '~/utils/serverdata.js'
import { getEncryptionData } from '~/utils/kradata.js'
import { pagestatus } from '~/utils/pagestatus.js'

const { baseurl } = globalurl();

const router = useRouter();

const deviceHeight = ref(0);
const emit = defineEmits(['updateDiv']);
const timeLeft = ref(10);
const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const buttonText = ref("Next");
const emailbox = ref(false)
const emailidtext = ref('')
const otperror = ref(false)
const isBack = ref(true);
const errorotp = ref('')
const isStatusValid = ref(true);
const erroremail = ref(false)
const emailerror = ref('')
let timer = null;
const e_otp = ref('')

const {htoken}=headerToken()


const emailid = ref('')
const setEmailData = async () => {
  try {
    const kraResData = getEncryptionData();
    const myData = await getServerData();

    const appKraEmail = kraResData?.kradata?.decryptdata?.payload?.metaData?.KYC_DATA?.APP_EMAIL;
    const profileEmail = myData?.payload?.metaData?.profile?.emailId;
    const kraEmail = myData?.payload?.metaData?.kraPan?.APP_EMAIL;

    const rawEmail = profileEmail || appKraEmail || kraEmail || '';

    emailid.value = rawEmail;

    if (myData?.payload?.metaData?.otpVerification?.email?.otpVerifiedStatus == '0') {
      emailbox.value = true

    }

  } catch (error) {
    console.error('Error setting email data:', error);
    emailid.value = '';
  }
};

await setEmailData()


const isSending = ref(false);
const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

// Function to validate email format
const isValidEmail = computed(() => {
  return validateEmail(emailid.value);
});

const isButtonDisabled = computed(() => {
  if (emailbox.value) {
    // In OTP mode, disable if OTP isn't complete
    return e_otp.value.length !== 5;
  } else {
    // In email mode, disable if email isn't valid
    return !isValidEmail.value;
  }
});


watch(emailid, (newValue) => {
  if (newValue && !validateEmail(newValue)) {
    erroremail.value = true;
    emailerror.value = '';
  } else {
    erroremail.value = false;
    emailerror.value = '';
  }
});


watch(isValidEmail, (newValue) => {
  if (newValue === false) {

    erroremail.value = false
  } else {
    isStatusValid.value = true
    isSending.value = false
    buttonText.value = "Next"
  }
});
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
    const data = await pagestatus('mobile')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'mobile');
  isBack.value = false;
}

  

  },
600)

}

const sendemailotp = async (resend) => {
const headertoken=htoken
    if (!validateEmail(emailid.value)) {
    erroremail.value = true;
    emailerror.value = 'Please enter a valid email address';
    return;
  }


  isStatusValid.value = false;
  isSending.value = true; // Disable button
  const apiurl = baseurl.value + 'validateEmail'


  const email = emailid.value;

  function maskEmail(email) {
    const [local, domain] = email.split("@");
    if (!local || !domain) return ""; // Invalid email
    const maskedLocal = local[0] + "*".repeat(Math.max(1, local.length - 2)) + local.slice(-1);
    return maskedLocal + "@" + domain;
  }

  emailidtext.value = maskEmail(email);

  const user =await encryptionrequestdata({
    otpType: 'email',
    email: emailid.value,
    resend: 'false',
    pageCode: "email",
    userToken: localStorage.getItem('userkey')
  });

  const payload = { payload: user };
  const jsonString = JSON.stringify(payload);


  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization': headertoken
      },
      body: jsonString

    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }


    else {
      const decryptedData = await response.json()
        const  data= await decryptionresponse(decryptedData);
      clearInterval(timer);
      timeLeft.value = 10; // reset countdown
      timer = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value -= 1;
        } else {
          clearInterval(timer);
        }
      }, 1000);
      if (resend == 'resend') {
otperror.value=false


        e_otp.value = ''
        resend_sh.value = true

      }

      if (data.payload.status == 'ok' && data.payload.otpStatus == '0') {
        isSending.value = true;
        emailbox.value = true
        buttonText.value = "Verify OTP"
      }

      else if (data.payload.status == 'ok' && data.payload.otpStatus == 1) {
        emailbox.value = false
        pagestatus('main')
        emit('updateDiv', 'main');
      }
      else if (data.payload.status == 'error' && data.payload.code == 'C1002') {
        erroremail.value = true
        emailerror.value = data.payload.message
      }
      else if (data.payload.status == 'error' && data.payload.code == '1005') {
        erroremail.value = true
        emailerror.value = data.payload.message
      }

      else if (data.payload.status == 'error' && data.payload.code == '1002') {

        alert(data.payload.message)
        localStorage.removeItem('userkey')
        router.push('/')

      }

      else if (data.payload.status == 'error' && data.payload.code == '1004') {
        alert(data.payload.message)
        localStorage.removeItem('userkey')
        router.push('/')

      }
    }
  } catch (error) {
    console.error(error.message)
  }
}



const otpverfication = async () => {
  const headertoken=htoken
  isSending.value = true; // Disable button
  isStatusValid.value = false;
  const apiurl = baseurl.value + 'validateEmail'
  const user = await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    email: emailid.value,
    verifyotp: "false",
    otpCode: e_otp.value,
    pageCode: "main",
  });

  const payload = { payload: user };
  const jsonString = JSON.stringify(payload);


  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization': headertoken
      },
      body: jsonString

    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    else {
      const decryptedData = await response.json()
      const  data= await decryptionresponse(decryptedData);
      if (data.payload.status == 'ok') {
        pagestatus('main')
        emit('updateDiv', 'main');
      }
      else if (data.payload.status === 'error' && data.payload.code === 'C1006') {
        otperror.value = true
        errorotp.value = data.payload.message
        isSending.value = true;
      }
      else if (data.payload.status === 'error' && data.payload.code === '1005' && data.payload.otpStatus === 0) {
        otperror.value = true
        errorotp.value = data.payload.message
        isSending.value = true;
      }

      else if (data.payload.status == 'error' && data.payload.code == '1002') {
        errormsg.value = true
        errormobile.value = data.payload.message
        localStorage.removeItem('userkey')
        router.push('/')

      }
      else if (data.payload.status == 'error' && data.payload.code == '1004') {
        errormsg.value = true
        errormobile.value = data.payload.message
        localStorage.removeItem('userkey')
        router.push('/')

      }


    }
  } catch (error) {
    console.error(error.message)
  }
}

function otpclear() {
  buttonText.value = 'Next'
  emailbox.value = false
  isSending.value = false;;
  e_otp.value = ''
}


watch(e_otp, (newval) => {
  if (newval.length === 5) {
    isStatusValid.value = true;
    isSending.value = false;
    otperror.value = false
  }
  else {
    isSending.value = true;
    otperror.value = false
  }
})

const handleButtonClick = () => {
  const button = rippleBtn.value;
  const circle = document.createElement('span');
  circle.classList.add('ripple');

  const rect = button.$el.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  button.$el.appendChild(circle);
  setTimeout(async () => {
    circle.remove();


    if (emailbox.value == true) {

      await otpverfication();

    }
    else {

      await sendemailotp();
    }



  }, 600);
};

const resend_sh = ref(false)

</script>

<style scoped>
.disabled-div {
  cursor: not-allowed;
  background-color: #f0f0f0;

}
</style>