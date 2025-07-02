<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <div class="flex justify-between p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full mt-1 px-2 p-1">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">Upload proofs</p>
        <p class="text-sm text-gray-500 font-normal leading-6">
          These details are required by SEBI to open your Demat account.
        </p>

        <div class="w-full mt-2">
          <span class="text-gray-500 text-md font-medium">Upload PAN</span>
          <div class="grid grid-cols-1 gap-3">
            <div>
              <div v-if="pancard"
                class="overflow-hidden flex w-full justify-center items-center rounded-lg mt-2 bg-white shadow-lg dark:border-white" >
                <div class="px-2 py-2 w-full" >
                  <PAN v-model:src="imageSrcpan" v-model:valid="isImageValid" />
                </div>
              </div>

              <div v-if="panoverwite" class="w-full flex flex-col justify-center items-center p-1" >
                  <div  class="w-32 h-40 rounded-lg cursor-pointer mb-2" @click="panoverzoom()" >
                  <img :src="panoverwitesrc" alt="" class="w-32 h-40 rounded-lg">

                   <Dialog v-model:visible="visible1" modal header="View" :style="{ width: '25rem' }">
                  <img :src="panoverwitesrc" alt="PAN Image" class="shadow-md rounded-xl w-full mb-1"
                    style="filter: grayscale(100%)" />
                </Dialog>
                </div>

                <Button type="button" @click="viewpanoverwrite()" class="w-full bg-blue-500 text-white border-0">Remove</Button>
              </div>

              <div v-if="digipan" class="w-full p-1 flex justify-center bg-gray-100 rounded-lg shadow-sm">
                <div class="w-32 h-40 rounded-lg" @click="panzoom()">
                  <img :src="digisrc" alt="" class="w-32 h-40 rounded-lg">
                </div>

                <Dialog v-model:visible="visible" modal header="View" :style="{ width: '25rem' }">
                  <img :src="digisrc" alt="PAN Image" class="shadow-md rounded-xl w-full mb-1"
                    style="filter: grayscale(100%)" />
                </Dialog>
              </div>
            </div>
          </div>

          <div v-if="errorimage" class="w-full px-1 py-1 bg-red-100 rounded-lg mt-1">
            <p class="text-red-500 text-sm text-center">{{ imageerror }}</p>
          </div>
          <div v-if="loading" class="max-w-md mx-auto p-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg ">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-1">
              {{ syncStatus.icon }} {{ syncStatus.title }}
            </h2>

            <p class="text-gray-600 dark:text-gray-300 mb-2">
              {{ syncStatus.message }}
            </p>

            <div class="w-full bg-gray-400 dark:bg-gray-700 rounded-full h-6 overflow-hidden relative">
              <div
                class="bg-blue-600 h-6 text-white text-sm font-medium text-center flex items-center justify-center transition-all duration-300 ease-in-out"
                :style="{ width: progress + '%' }">
                {{ progress.toFixed(2) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="w-full flex gap-2">
        <Button @click="back" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" ref="rippleBtn" @click="handleButtonClick"
          :disabled="!(panoverwitesrc || (imageSrcpan && isImageValid && isStatusValid))"

          class="primary_color wave-btn text-white w-5/6 py-3 text-xl border-0">
          {{ buttonText }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import PAN from '~/components/NKYC_Forms/account/fileuploads/pancard.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const emit = defineEmits(['updateDiv']);
const { baseurl } = globalurl();
const { htoken } = headerToken()
const deviceHeight = ref(window.innerHeight);
const buttonText = ref('Next');
const rippleBtn = ref(null);
const rippleBtnback = ref(null);
const imageSrcpan = ref(null);
const loading = ref(false)
const pancard = ref(true);
const isStatusValid = ref(true); // Assuming this is set based on some validation logic
const isBack = ref(true); // Assuming you have some logic to enable/disable back button
const isImageValid = ref(false)
const digipan = ref(false)
const digisrc = ref('')
const visible = ref(false)
const panoverwite=ref(false)
const panoverwitesrc=ref(null)
const visible1=ref(false)

const errorimage=ref(false)
const imageerror=ref('')

const getsegmentdata = async () => {
  const headertoken = htoken;
  const mydata = await getServerData();
  const imageauth = headertoken;
  const userToken = localStorage.getItem('userkey');
  const segments = mydata?.payload?.metaData?.proofs?.pancard ;

  if (
  
    mydata?.payload?.metaData?.digi_info?.aadhaarUID && mydata?.payload?.metaData?.digi_docs?.aadhaarDocument
  ) {

    
   if (segments) {
  pancard.value = false;
  panoverwite.value = true;
  const imgSrc = `${baseurl.value}/view/uploads/${imageauth}/${userToken}/${segments}`;
  
  panoverwitesrc.value = imgSrc;
  isImageValid.value = true;  
  isStatusValid.value = true;

}
    else{
       pancard.value=true
    panoverwite.value=false
    }
  }

  const digilockpan = mydata?.payload?.metaData?.digi_docs?.panDocument;
  const pancardName = mydata?.payload?.metaData?.proofs?.pancard;

  if (digilockpan) {
    const panslice = digilockpan.replace(/\.pdf$/i, ".png");
    if (panslice === pancardName) {
        panoverwite.value = false;
      pancard.value = false; 
      digipan.value = true
      const imgSrc = `${baseurl.value}/view/uploads/${imageauth}/${userToken}/${pancardName}`;
      digisrc.value = imgSrc
    } else {
      pancard.value = true;  // ✅ show pancard section
      digipan.value = false
    }
  }
};

watch([imageSrcpan, isImageValid], ([src, valid]) => {
  if (src && valid) {
    isStatusValid.value = true; 
  }
});

function panzoom() {
  visible.value = true
}

function panoverzoom() {

  visible1.value = true
}

function viewpanoverwrite() {
  pancard.value = true;
  digipan.value = false;
  panoverwite.value = false;
  panoverwitesrc.value = null;      // Clear overwritten image src
  imageSrcpan.value = null;         // Clear pancard image if needed
  isImageValid.value = false;       // Mark image as invalid
  isStatusValid.value = false;      // Disable Next button
}


const progress = ref(0);
const progressInterval = ref(null);
const syncStatus = computed(() => {
  if (progress.value <= 30) {
    return {

      title: 'Syncing',
      message: 'Saving your pan proof...'
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
      message: 'Documents uploaded successfully!'
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
    loading.value = false;
  }, 500);
};

const resetProgress = () => {
  clearInterval(progressInterval.value);
  loading.value = false;
  progress.value = 0;
};


const proofupload = async () => {
  errorimage.value=false
  if (!imageSrcpan.value) {
      errorimage.value=true
      imageerror.value="Please upload file in valid format"
    return;
  }

  loading.value = true;
  startProgressAnimation();
  const apiurl = `${baseurl.value}proofFormUpload`;
  const headertoken = htoken
  try {
    // Convert URL to binary Blob
    const response = await fetch(imageSrcpan.value);
    const blob = await response.blob();

    // Create encrypted JSON payload
    const encryptedPayload =await encryptionrequestdata({
      userToken: localStorage.getItem('userkey'),
      pageCode: 'uploadbank',
    });

    const formData = new FormData();
    formData.append('pancard', blob, 'pancard.jpg'); // or 'pancard.pdf' if PDF
    formData.append('payload', JSON.stringify({ payload: encryptedPayload }));



    const uploadResponse = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization': headertoken
        // Do NOT manually set 'Content-Type'
      },
      body: formData,
    });



    if (!uploadResponse.ok) {
      throw new Error(`Network error: ${uploadResponse.status}`);
    }

    const decryptedData = await uploadResponse.json();
    const data = await decryptionresponse(decryptedData);
    if (data.payload.status === 'ok') {
      completeProgress();
      const mydata = await getServerData();
      const statuscheck1 = mydata?.payload?.metaData?.bank?.bank1HolderName;

      if (statuscheck1) {
        const nextPage = await pagestatus('photosign1');
        if (nextPage.payload.status === 'ok') {
          emit('updateDiv', 'photosign1');
        }
      } else {
        await pagestatus('uploadbank');
        emit('updateDiv', 'uploadbank');
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
    resetProgress();
    console.error('Upload failed:', error.message);
  }
};



const back = (event) => {
  const button = rippleBtnback.value;
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
   
    
 const data = await pagestatus('brokerage')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'brokerage');
  isBack.value = false;
}
  }, 600);
};

const handleButtonClick = async (event) => {
  try {
    // Ripple effect
    const button = rippleBtn.value;
    const circle = document.createElement('span');
    circle.classList.add('ripple');

    const rect = button.$el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    button.$el.appendChild(circle);

    // Remove ripple after animation
    setTimeout(() => circle.remove(), 600);

    // Fetch server data
    const mydata = await getServerData();
    
    // Handle error response
    if (mydata.payload?.status === 'error') {
      if (mydata.payload.code === '1002' || mydata.payload.code === '1004') {
        alert(mydata.payload.message);
        localStorage.removeItem('userkey');
        router.push('/');
      }
      return;
    }

    const digilockpan = mydata?.payload?.metaData?.digi_docs?.panDocument;
    const pancardName = mydata?.payload?.metaData?.proofs?.pancard;

    // Case 1: Digilock PAN exists
    if (digilockpan) {
      const panslice = digilockpan.replace(/\.pdf$/i, ".png");
      
      if (panslice === pancardName) {
        const statuscheck1 = mydata?.payload?.metaData?.bank?.bank1HolderName;
        
        if (statuscheck1) {
          const nextPage = await pagestatus('photosign1');
          if (nextPage.payload.status === 'ok') {
            emit('updateDiv', 'photosign1');
          }
        } else {
          await pagestatus('uploadbank');
          emit('updateDiv', 'uploadbank');
        }
      }
    } 
    // Case 2: PAN overwrite is true and pancardName exists
    else if (panoverwite.value === true && pancardName) {
      const bankcheck = mydata?.payload?.metaData?.bank?.bank1HolderName;
      
      if (bankcheck) {
        await pagestatus('photosign1');
        emit('updateDiv', 'photosign1');
        isStatusValid.value = false;
      } else {
        await pagestatus('uploadbank');
        emit('updateDiv', 'uploadbank');
        isStatusValid.value = false;
      }
    } 
    // Default case
    else {
      proofupload();
      isStatusValid.value = false;
    }

  } catch (error) {
    console.error('Error in handleButtonClick:', error);
    // Handle error appropriately (e.g., show error message to user)
  }
};

onMounted(async () => {
  await getsegmentdata();
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});
</script>
