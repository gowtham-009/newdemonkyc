<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>
    <div class="flex p-2 justify-between flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full mt-1 p-1 px-2 ">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Fill your Communication address
        </p>

        <p class="text-sm  leading-5 text-gray-500 font-normal">
          Please enter your address as per the documents you have uploaded.
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


      </div>

      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" ref="rippleBtn" @click="handleButtonClick"
          :disabled="!address || !state || !city || !pincode || !isaddress"
          class=" primary_color wave-btn text-white w-5/6 py-3 text-xl border-0  ">
          {{ buttonText }}
          <span v-if="isAnimating" class="wave"></span>
        </Button>
      </div>


    </div>

  </div>






</template>
<script setup>

import Address from '~/components/NKYC_Forms/pandetails/paninputs/address.vue'
import State from '~/components/NKYC_Forms/pandetails/paninputs/state.vue'
import City from '~/components/NKYC_Forms/pandetails/paninputs/city.vue'
import Pincode from '~/components/NKYC_Forms/pandetails/paninputs/pincode.vue'
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const emit = defineEmits(['updateDiv']);

const { baseurl } = globalurl();
const {htoken}=headerToken()
const deviceHeight = ref(0);
const buttonText = ref("Continue");
const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const address = ref('');

const state = ref('');
const city = ref('');
const pincode = ref('');
const isaddress = ref(true);
const isBack = ref(true);


//errorlist
const addresserror=ref('')
const stateerror=ref('')
const cityerror=ref('')
const pincodeerror=ref('')

const setCommunicationAddress = async () => {
  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.kraPan?.APP_KRA_INFO

  const addresscom=mydata.payload.metaData.address
  if(addresscom.length==0){
     if (statuscheck) {
    const add1 = mydata?.payload?.metaData?.kraPan?.APP_COR_ADD1 || ''
    const add2 = mydata?.payload?.metaData?.kraPan?.APP_COR_ADD2 || ''
    const add3 = mydata?.payload?.metaData?.kraPan?.APP_COR_ADD3 || ''
    address.value = add1 + " " + add2 + " " + add3
    const stateCode = String(mydata?.payload?.metaData?.kraPan?.APP_PER_STATE || '');
    state.value = (mydata?.payload?.metaData?.kraIdentityData?.stateCode && mydata?.payload?.metaData?.kraIdentityData?.stateCode[stateCode]) || '';
    city.value = mydata?.payload?.metaData?.kraPan?.APP_PER_CITY || ''
    pincode.value = mydata?.payload?.metaData?.kraPan?.APP_PER_PINCD || ''
  }
  else if (mydata?.payload?.metaData?.digi_info?.aadhaarUID && mydata?.payload?.metaData?.digi_docs?.aadhaarDocument) {
    address.value = mydata?.payload?.metaData?.address?.comAddress || ''

    state.value = mydata?.payload?.metaData?.address.comState || ''
    city.value = mydata?.payload?.metaData?.address.comCity || ''
    pincode.value = mydata?.payload?.metaData?.address.comPincode || ''
  }
  }
 
  else if(mydata.payload.metaData.address.comPincode){
     const add1 = mydata.payload.metaData.address.comAddress
    const add2 = mydata.payload.metaData.address.comAddressLine2
    const add3 = mydata.payload.metaData.address.comAddressLine3
    address.value = add1 + " " + add2 + " " + add3
    state.value = mydata.payload.metaData.address.comState
    city.value = mydata.payload.metaData.address.comCity
    pincode.value = mydata.payload.metaData.address.comPincode

  }
};

await setCommunicationAddress();
onMounted(() => {
  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});



const communicateaddressdata = async () => {

  const apiurl = `${baseurl.value}address`;

  const user = encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),

    pageCode: "info",
    communicationAddress: address.value,
    communicationCity: city.value,
    communicationState: state.value,
    communicationPincode: pincode.value


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
    addresserror.value=""
     cityerror.value =""
     stateerror.value=""
     pincodeerror.value=""
      if (data.payload.status == 'ok') {
        const mydata = await pagestatus('info')
        if (mydata.payload.status == 'ok') {
          const mydata = await pagestatus('info')
          if (mydata.payload.status == 'ok') {
            emit('updateDiv', 'info');
          }
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
    

    if (err.field === 'communicationAddress' && !address.value) {
      addresserror.value = err.message || ' ';
    }
    if (err.field === 'communicationCity' && !city.value) {
      cityerror.value = err.message || ' ';
    }
    if (err.field === 'communicationState' && !state.value) {
      stateerror.value = err.message || ' ';
    }
    if (err.field === 'communicationPincode' && !pincode.value) {
      pincodeerror.value = err.message || ' ';
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

    communicateaddressdata()
    isaddress.value = false;
  }, 600)
};





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






</script>
