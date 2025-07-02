<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
       <profile />
    </div>
    <div class="flex justify-between  p-1 px-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full">
        <div class="w-full mt-2  flex flex-col justify-between">
          <div class="w-full">
            <p class="text-xl font-medium dark:text-gray-400">Ready to get started?</p>
            <p class="text-sm font-normal text-gray-500 leading-5">Enter your mobile number to help us set up your 
              account</p>
          </div>

           <div class="w-full mt-3 flex gap-2 items-center">
            <div class="w-full" :class="{ 'disabled-div': mobileotp }"
              :style="mobileotp ? { pointerEvents: 'none', opacity: 0.5 } : {}">
              <MobileInput v-model="mobileNo" />
              <span v-if="errormsg" class="text-red-500">{{ errormobile }}</span>
            </div>
           
          </div>
          <div class="w-full mt-4">
            <Checkbox v-model="checkboxValue" />
          </div>
        </div>

        <div class="w-full  mt-4" v-if="mobileotp">
          <p class="font-medium text-slate-800 text-2xl dark:text-gray-400">
            OTP sent
          </p>
          <p class="text-sm leading-6  font-normal text-gray-500">
            We have sent an OTP to your mobile number <br> +91 {{ phoneNumber }} <Chip @click="otpclear()" class="bg-blue-50 py-1 text-blue-500" label="Change Mobile Number" />
          </p>
          <div class="w-full mt-3">
            <phoneOTP v-model="p_otp" />
            <span v-if="otperror" class="text-red-500">{{ errorotp }}</span>

            <div class="w-full h-12 flex justify-center gap-2">
              <p class="text-sm font-medium text-center leading-5 text-gray-500" v-if="resend_sh">OTP Resend Successfully <br> +91 {{
                phoneNumber }}</p>
            </div>
            <div class="w-full flex justify-between items-center">
              <h2 class="font-medium text-sm dark:text-gray-500">00:{{ timeLeft.toString().padStart(2, '0') }}s</h2>
              <button :disabled="timeLeft" type="button" @click="sendmobileotp('resend')"
                class="text-lg font-medium text-blue-500 cursor-pointer ">Resend</button>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full flex gap-2">
      
        <Button
  ref="rippleBtn"
  type="button"
  label="Verify OTP"
  class="primary_color text-white w-full py-3 text-xl border-0"
  @click="mobile_signup"
  :disabled="isButtonDisabled || !isStatusValid"
>
  {{ buttonText }}
</Button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import ThemeSwitch from '~/components/darkmode/darkmodesign.vue';
import phoneOTP from '~/components/forminputs/otpinput.vue'
import MobileInput from '~/components/forminputs/mobileinput.vue';
import Checkbox from '~/components/forminputs/remembercheckbox.vue';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { encryptionrequestdata } from '~/utils/globaldata.js'
import { getServerData } from '~/utils/serverdata.js'
import { getEncryptionData } from '~/utils/kradata.js'
import { pagestatus } from '~/utils/pagestatus.js'
const { baseurl } = globalurl();
const {htoken}=headerToken()
const deviceHeight = ref(0);
const emit = defineEmits(['updateDiv']);
const timeLeft = ref(10); 
const phoneNumber = ref('')
const mobileotp = ref(false)
const rippleBtn = ref(null)

const buttonText = ref("Next");
const otperror = ref(false)
const errorotp = ref('')
let timer = null;
const errormsg = ref(false)
const errormobile = ref('')
const p_otp = ref('')
const isStatusValid = ref(true); // Assuming this is set based on some validation logic
const isSending = ref(false);
const mobileNo = ref(''); 

const router = useRouter();
const setMobileData = async () => {
  try {
    const mydata = await getServerData();
    const kraresdata=getEncryptionData()
    console.log("KRA Data:", kraresdata);
    const appKraMobile = kraresdata?.kradata?.decryptdata?.payload?.metaData?.KYC_DATA?.APP_MOB_NO || '';
    const profileMobile = mydata?.payload?.metaData?.profile?.mobileNo;
     const kraMobile = mydata?.payload?.metaData?.kraPan?.APP_MOB_NO;
    let rawMobile = profileMobile || appKraMobile || kraMobile || '';
      

    if (rawMobile.startsWith('91') && rawMobile.length === 12) {
      rawMobile = rawMobile.slice(2);
  
    }

    // Show OTP input if required
    if (mydata?.payload?.metaData?.otpVerification?.mobile?.otpVerifiedStatus=='0') {
     
      mobileotp.value = true;
    }

    // Check for valid 10-digit mobile number
    const isValidMobile = /^\d{10}$/.test(rawMobile);
    mobileNo.value = isValidMobile ? rawMobile : '';
    
  } catch (error) {
    console.error('Error setting mobile data:', error);
    mobileNo.value = '';
    mobileotp.value = false;
  }
};

await setMobileData();

onMounted(() => {


  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });

});

onUnmounted(() => {
  clearInterval(timer);
});







const sendmobileotp = async (resend) => {

  isStatusValid.value = false;
  const apiurl = `${baseurl.value}validateMobile`;
  phoneNumber.value = mobileNo.value.replace(/^(\d{0,6})(\d{4})$/, '******$2');
    const user =await encryptionrequestdata({
    otpType:'mobile',
    mobile: mobileNo.value,
    resend:'false',
    pageCode:"mobile",
    userToken:localStorage.getItem('userkey')
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
  });

  const decryptedData = await response.json(); // Read body regardless of status
const data = await decryptionresponse(decryptedData);
console.log("Response Data:", data);
  if (!response.ok) {
    console.error("Error:", data.message);
    errormsg.value = data.message; // Show in UI
    return;
  }

   // Reset the timer before starting a new one
    clearInterval(timer);
    timeLeft.value = 10; // reset countdown
    timer = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value -= 1;
      } else {
        clearInterval(timer);
      }
    }, 1000);
  if(resend=='resend'){
    otperror.value=false
    p_otp.value=''
     resend_sh.value=true
  }

  if (data.payload.status === 'ok' && data.payload.otpStatus=='0') {
    
    mobileotp.value=true
    buttonText.value='Verify Otp'

  }
  else if(data.payload.status === 'ok' && data.payload.otpStatus=='1'){
 
     mobileotp.value=false
    buttonText.value='Verify Otp'
     emit('updateDiv', 'email');
  }
  else if(data.payload.status=='error'  && data.payload.code=='B1002' && data.payload.otpStatus==0){
    errormsg.value=true
    errormobile.value=data.payload.message
     
  }
  else if(data.payload.status=='error'  && data.payload.code=='1005' && data.payload.otpStatus==0){
    errormsg.value=true
    errormobile.value=data.payload.message
     
  }

   else if(data.payload.status=='error'  && data.payload.code=='1002'){
   alert(data.payload.message)
    localStorage.removeItem('userkey')
      router.push('/')
     
  }
 
    else if(data.payload.status=='error'  && data.payload.code=='1004'){
    alert(data.payload.message)
    localStorage.removeItem('userkey')
      router.push('/')
     
  }

} catch (error) {
  console.error("OTP Send Error:", error.message);
  errormsg.value = 'Something went wrong. Please try again.';
}
};



const otpverfication = async () => {
 isStatusValid.value = false;
  errormobile.value = '';
  const usekey=localStorage.getItem('userkey')
  const apiurl = `${baseurl.value}validateMobile`;
    const user =await encryptionrequestdata({
    userToken:usekey,
    mobile: mobileNo.value,
    verifyotp:'false',
    otpCode:p_otp.value,
    pageCode:"email",
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
  });

  const decryptedData = await response.json(); // Read body regardless of status
 const  data= await decryptionresponse(decryptedData);
  if (!response.ok) {
   
    console.error("Error:", data.message);
    errormsg.value = data.message; // Show in UI
    return;
  }

  if (data.payload.status === 'ok') {
     
    emit('updateDiv', 'email');
  }
  else if(data.payload.status==='error' && data.payload.code=='1005' && data.payload.otpStatus=='0'){
    otperror.value = true
     errorotp.value = data.payload.message
      isSending.value=true
  }

   else if(data.payload.status==='error' && data.payload.code=='B1006' ){
    otperror.value = true
     errorotp.value = data.payload.message
      isSending.value=true
  }

  else if(data.payload.status=='error'  && data.payload.code=='1002'){
   alert(data.payload.message)
    localStorage.removeItem('userkey')
      router.push('/')
     
  }
 
    else if(data.payload.status=='error'  && data.payload.code=='1004'){
   alert(data.payload.message)
    localStorage.removeItem('userkey')
      router.push('/')
     
  }


} catch (error) {
  console.error("OTP Send Error:", error.message);  
}
};

function otpclear(){
  buttonText.value='Next'
  p_otp.value=''
    mobileotp.value = false;
   isSending.value=false

}

const isButtonDisabled = computed(() => {
  if (!mobileNo.value || mobileNo.value.length !== 10) return true;
  if (mobileotp.value && p_otp.value.length !== 4) return true;
  return isSending.value;
});


const mobile_signup = async (event) => {
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

    if(mobileotp.value==true){

      await otpverfication();
    }
    else{
   
await sendmobileotp();
    }

      
   
    
  }, 600);
};



watch(p_otp, (newval) => {
  if (newval.length === 4) {
    isStatusValid.value = true;

   isSending.value=false
  }
  else {

    otperror.value=false
  }
})

watch(mobileNo,(newval)=>{
  if(newval.length<10){
errormsg.value=false
  }
  else if(newval.length==10){
    isStatusValid.value=true
  }
  
  
})



const resend_sh = ref(false)


</script>

<style scoped>
.disabled-div {
  cursor: not-allowed;
  background-color: #f0f0f0;
 
}
</style>