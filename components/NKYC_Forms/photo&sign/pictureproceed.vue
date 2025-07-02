<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>
    <div class="flex justify-between  p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full mt-1 px-2 p-1">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Looking good, <span class="text-md">{{ clientname }}</span>
        </p>

        <p class="text-sm text-gray-500 font-normal leading-5">
          Just a few more steps and you're done.
        </p>

        <div class="w-full  p-1 flex justify-center items-center flex-col mt-20 h-64 ">

          <img :src="srcUrl" alt="Base64 Image" class="rounded-full w-80 h-80 object-cover " />
          <div class="w-full flex justify-center mt-2">
            <Chip @click="retake" class="px-5 bg-blue-50 text-blue-500" label="Retake" />
          </div>

        </div>




      </div>

      <div class="w-full">


        <div class="w-full flex gap-2">
          <Button @click="back()" ref="rippleBtnback"
            class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900" :disabled="!isBack">
            <i class="pi pi-angle-left text-3xl dark:text-white"></i>
          </Button>
          <Button type="button" ref="rippleBtn" @click="handleButtonClick" :disabled="!isStatusValid"
            class=" primary_color wave-btn text-white w-5/6 py-3 text-xl border-0  ">
            {{ buttonText }}
          </Button>
        </div>

      </div>


    </div>

  </div>






</template>
<script setup>

import { ref, onMounted } from 'vue';

import { useRouter } from 'vue-router';
const router = useRouter();

const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const buttonText = ref("Next");
const deviceHeight = ref(0);
const srcUrl = ref(null)
const isBack = ref(true); // Assuming you have a way to determine if the back button should be enabled
const isStatusValid = ref(true); // Assuming you have a way to determine if the status is valid
const { baseurl } = globalurl();
const { htoken } = headerToken()
const question1 = ref('')
const question2 = ref('')
const question3 = ref('')
const question4 = ref('')
const question5 = ref('')
const question6 = ref('')
const question7 = ref('')
const question8 = ref('')
const clientname = ref('')
const getsegmentdata = async () => {
  const mydata = await getServerData();
    const headertoken=htoken
  const statuscheck = mydata?.payload?.metaData?.proofs?.ipvImg;
  if (statuscheck) {
    clientname.value = mydata?.payload?.metaData?.profile?.clientName
    const segments = mydata?.payload?.metaData?.proofs?.ipvImg;
    const imageauth = headertoken;
      const userToken = localStorage.getItem('userkey');
      const imgSrc = `${baseurl.value}/view/uploads/${imageauth}/${userToken}/${segments}`;
      srcUrl.value = imgSrc; 
  }
  
};

onMounted(async () => {
  await getsegmentdata()
  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});

const emit = defineEmits(['updateDiv']);

const retake = async () => {
  const page = await pagestatus('takephoto')
  if ((page?.payload?.status == 'error' && page?.payload?.message == 'User Not Found.') || (page?.payload?.status == 'error' && page?.payload?.message == 'Missing Usertoken parameters.')) {
    alert('Session has expired, please login.');
    localStorage.removeItem('userkey')
    router.push('/')
  }
  else if (page.payload.status == 'ok') {
    emit('updateDiv', 'takephoto');
  }
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

  setTimeout(async () => {
    circle.remove()
    circle.remove()
  const data = await pagestatus('photosign1')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'photosign1');
  isBack.value = false;
}
  }, 600)

}


const documentsavebtn = async () => {


  const apiurl = `${baseurl.value}additional_docs`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: "signdraw",
    documentConsentMode: question1.value || 'Electronic',
    contractNoteMode: question2.value || 'Electronic',
    standardDocsConsent: question3.value || 'Electronic',
    internetTradingOpted: question4.value || 'Yes',
    pastActionsDetails: question5.value || 'No',
    otherBrokerDetails: question6.value || 'No',
    otherDPDetails: question7.value || 'CDSL',
    accountSettlementPreference: question8.value || 'Once in Quarter',
    settlementStatementConsent: 'Yes'

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
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const decryptedData = await response.json();
    const data = await decryptionresponse(decryptedData);
    if (data.payload.status === 'ok') {
      emit('updateDiv', 'signdraw');
      isStatusValid.value = false;
    }
    else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }
  } catch (error) {

    console.error(error.message);
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

  setTimeout(async () => {
    circle.remove()


    const page = await pagestatus('signdraw')
   if (page.payload.status == 'error') {
        if (page.payload.code == '1002' || page.payload.code=='1004'){
             alert(page.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }
    else if (page.payload.status == 'ok') {
      const mydata = await getServerData();
      const statuscheck = mydata?.payload?.metaData?.additional_docs;
      if (statuscheck.length === 0) {
       
        documentsavebtn();
      }
      emit('updateDiv', 'signdraw');
      isStatusValid.value = false;
    }




  }, 600)
};







</script>
<style></style>