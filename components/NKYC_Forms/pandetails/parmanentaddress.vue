<template>
  <div class="primary_color">
    <!-- Header -->
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <!-- Content Area -->
    <div class="flex justify-between p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full mt-1 p-1 px-2">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Verify your Permanent address
        </p>
        <p class="text-sm  leading-5 text-gray-500 font-normal">
          Please confirm your address as per the documents you have uploaded.
        </p>


        <div class="w-full mt-1">
          <Address v-model="address" />
          <span class="text-red-500">{{ addresserror }}</span>
        </div>
        <div class="w-full mt-1">
          <State v-model="state" />
          <span class="text-red-500">{{ stateerror }}</span>
        </div>
        <div class="w-full mt-1">
          <City v-model="city" />
          <span class="text-red-500">{{ cityerror }}</span>
        </div>
        <div class="w-full mt-1">
          <Pincode v-model="pincode" />
          <span class="text-red-500">{{ pincodeerror }}</span>
        </div>
        <div class="w-full mt-1">
          <Addresscheck ref="commAddressRef" />

        </div>




      </div>

      <!-- Buttons -->
      <div class="w-full flex gap-2">
        <Button @click="back" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>

        <Button type="button" @click="handleButtonClick" ref="rippleBtn"
          :disabled="!address || !state || !city || !pincode || !isaddress"
          class="primary_color wave-btn text-white w-5/6 py-3 text-xl border-0 relative overflow-hidden">
          {{ buttonText }}
          <span v-if="isAnimating" class="wave"></span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Address from '~/components/NKYC_Forms/pandetails/paninputs/address.vue';
import State from '~/components/NKYC_Forms/pandetails/paninputs/state.vue';
import City from '~/components/NKYC_Forms/pandetails/paninputs/city.vue';
import Pincode from '~/components/NKYC_Forms/pandetails/paninputs/pincode.vue';
import Addresscheck from '~/components/NKYC_Forms/pandetails/paninputs/confirmcheckbox.vue';

import { pagestatus } from '~/utils/pagestatus.js'
import { useRouter } from 'vue-router';
const router = useRouter();
// Form Refs
const { baseurl } = globalurl();
const { htoken } = headerToken()
const emit = defineEmits(['updateDiv']);
const address = ref('');

const city = ref('');
const pincode = ref('');
const state = ref('');
const isBack = ref(true);

// DOM and UI Refs
const commAddressRef = ref(null);
const rippleBtn = ref(null);
const rippleBtnback = ref(null);
const buttonText = ref('Continue');
const isAnimating = ref(false);
const isaddress = ref(true);

// Device height
const deviceHeight = ref(window.innerHeight);

//errorlist
const addresserror = ref('')
const stateerror = ref('')
const cityerror = ref('')
const pincodeerror = ref('')

// Handle window resize
const updateHeight = () => {
  deviceHeight.value = window.innerHeight;
};
onMounted(() => {
  window.addEventListener('resize', updateHeight);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeight);
});



const setPermanentAddress = async () => {
  try {
    const mydata = await getServerData();
    
    // Safely access nested properties with optional chaining and defaults
    const kraPan = mydata?.payload?.metaData?.kraPan || {};
    const addressData = mydata?.payload?.metaData?.address || {};
    const digiInfo = mydata?.payload?.metaData?.digi_info || {};
    const digiDocs = mydata?.payload?.metaData?.digi_docs || {};
    const kraIdentityData = mydata?.payload?.metaData?.kraIdentityData || {};

    // Check if address data is empty or missing pincode
    if (!addressData || Object.keys(addressData).length === 0 || !addressData.perPincode) {
      if (kraPan.APP_KRA_INFO) {
        // Use KRA PAN data
        const addParts = [
          kraPan.APP_PER_ADD1 || '',
          addressData.APP_PER_ADD2 || '', // Note: This looks like it might be a typo - should it be kraPan.APP_PER_ADD2?
          kraPan.APP_PER_ADD3 || ''
        ].filter(Boolean).join(" "); // Filter out empty parts and join with space
        
        address.value = addParts;
        
        const stateCode = String(kraPan.APP_PER_STATE || '');
        state.value = kraIdentityData.stateCode?.[stateCode] || '';
        city.value = kraPan.APP_PER_CITY || '';
        pincode.value = kraPan.APP_PER_PINCD || '';
      }
      else if (digiInfo.aadhaarUID && digiDocs.aadhaarDocument) {
        // Use digi/Aadhaar data
        address.value = addressData.perAddress || '';
        state.value = addressData.perState || '';
        city.value = addressData.perCity || '';
        pincode.value = addressData.perPincode || '';
      }
    } 
    else {
      // Use address data if available
      const addParts = [
        addressData.perAddress,
        addressData.perAddressLine2,
        addressData.perAddressLine3
      ].filter(Boolean).join(" "); // Filter out empty/undefined parts
      
      address.value = addParts;
      state.value = addressData.perState || '';
      city.value = addressData.perCity || '';
      pincode.value = addressData.perPincode || '';
    }

  } catch (error) {
    console.error('Error setting permanent address:', error);
    // Reset all fields on error
    address.value = '';
    state.value = '';
    city.value = '';
    pincode.value = '';
  }
};

await setPermanentAddress();



const permanentaddressdata = async () => {

  const apiurl = `${baseurl.value}address`;
  const pageCode = commAddressRef.value?.confirm ? "address" : "communicationaddress";
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    comAddSameAsPermanent: commAddressRef.value?.confirm ? "YES" : "NO",
    pageCode: pageCode,
    permanentAddress: address.value,
    permanentCity: city.value,
    permanentState: state.value,
    permanentPincode: pincode.value,

  });
  const headertoken = htoken

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
      const  data= await decryptionresponse(decryptedData);
        addresserror.value = ""
        cityerror.value = ""
        stateerror.value = ""
        pincodeerror.value = ""
      if (data.payload.status == 'ok') {
        const isConfirmed = commAddressRef.value?.confirm;
        if (isConfirmed) {
          const mydata = await pagestatus('info')
          if (mydata.payload.status == 'ok') {
            emit('updateDiv', 'info');
          }

        } else {

          emit('updateDiv', 'communicationaddress');

        }
      }

      else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }

         else if(data.payload.status=='error' && data.payload.errors.length>0) {
     
        data.payload.errors.forEach((err) => {


          if (err.field === 'permanentAddress' && !address.value) {
            addresserror.value = err.message || ' ';
          }
          if (err.field === 'permanentCity' && !city.value) {
            cityerror.value = err.message || ' ';
          }
          if (err.field === 'permanentState' && !state.value) {
            stateerror.value = err.message || ' ';
          }
          if (err.field === 'permanentPincode' && !pincode.value) {
            pincodeerror.value = err.message || ' ';
          }
        });
      }
       
      }

    
      else{
        console.log(data.payload.message)
      }




    }

  } catch (error) {
    console.log(error.message)
  }
}





// Handle continue button click
const handleButtonClick = (event) => {


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

    permanentaddressdata()
    isaddress.value = false

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

     const data = await pagestatus('main')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'main');
  isBack.value = false;
}
  }, 600)

}

</script>


<style scoped>
.p-checkbox-checked .p-checkbox-icon {
  color: white !important;
}
</style>