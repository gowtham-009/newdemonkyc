<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>
    <div class="flex justify-between  p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">

      <div class="w-full px-2 p-1 ">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Draw your signature
        </p>
        <p class="text-gray-500 leading-5 font-normal text-sm">
          Use the signature box to sign
        </p>
        <div class="w-full mt-1 rounded-lg   bg-blue-50 dark:bg-slate-900">
                  
                    <div class="w-full flex items-center  gap-2 ">
                        <div class="p-1">
                            <p class="text-gray-500 leading-5 font-normal text-sm">
                                Choose the option to upload an image of your signature for accuracy.
                            </p>
                        </div>
                    </div>

                  


                </div>
        

                <div class="w-full" >
                  <canvas ref="canvasRef" class="signature-canvas rounded-lg mt-1" @touchstart.prevent @touchmove.prevent />

        <div class="w-full mt-1 flex gap-2 justify-center">
          <Button @click="erase" icon="pi pi-trash" label="Clear"
            class="px-2 py-1 text-white !bg-red-500 border-0"></Button>
          <Button @click="triggerUpload" class="primary_color text-white" icon="pi pi-plus"
            label="Upload Signature"></Button>
          <input type="file" accept="image/*" ref="fileInput" @change="uploadImage" style="display: none" />
        </div>
                </div>
        <div class="w-full mt-1">
          <a class="cursor-pointer text-blue-500" @click="additionaldoc" style="text-decoration: underline;">Additional Document</a>
        </div>

        <div v-if="signerror" class="w-full p-1 bg-red-100">
          <p class="text-red-500 text-sm text-center">{{ errorsign }}</p>
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
        :style="{ width: progress + '%' }"
      >
        {{ progress.toFixed(2) }}%
      </div>
    </div>
  </div>
      </div>


         
            <Dialog v-model:visible="visible" modal header="Additional Information" :style="{ width: '25rem' }">
                 <div class="w-full ">
              <p class="text-gray-500 font-medium text-sm">I/We herby voluntarily accord my/our consent to receive the
                aforesaid documents in:</p>
              <Option1 class="mt-1" v-model:selected="question1" />
            </div>

            <div class="w-full">
              <p class="text-gray-500 font-medium text-sm">Mode of communication:</p>
              <p class="text-gray-500 font-medium text-sm">I/We wish to receive Contract Note:</p>

              <Option2 class="mt-1" v-model:selected="question2" />
            </div>

            <div class="w-full ">
              <p class="text-gray-500 font-medium text-sm">I/We wish to receive standard documents - Rights &
                Oblications, Risk Disclosure document, Guidance note and polices & procedures:</p>
              <Option3 class="mt-1" v-model:selected="question3" />
            </div>
            <div class="w-full">
              <p class="text-gray-500 font-medium text-sm">I/We wish to avail facility of internet trading/wireless
                technology:</p>
              <Option4 class="mt-1" v-model:selected="question4" />
            </div>
            <div class="w-full ">
              <p class="text-gray-500 font-medium text-sm">Past Action: Details of any action / Proceedings initiated /
                pending / taken by SEBI / Stock Exchange / any other authority against the applicant / constituent or
                its patners / promoters / whole time directors / authorised persons in charge of dealing in securities
                during last 3 years.</p>
              <Option5 class="mt-1" v-model:selected="question5" />
            </div>
            <div class="w-full ">
              <p class="text-gray-500 font-medium text-sm">I/We Whether dealing with any Other stock Broker /AP:</p>
              <Option6 class="mt-1" v-model:selected="question6" />
            </div>
            <div class="w-full ">
              <p class="text-gray-500 font-medium text-sm">OTHER DP DETAILS:</p>
              <Option7 class="mt-1" v-model:selected="question7" />
            </div>
            <div class="w-full">
              <p class="text-gray-500 font-medium text-sm">I/We further wish to have settlement of my account (funds and
                securities):</p>
              <Option8 class="mt-1" v-model:selected="question8" />
            </div>

            <div class="w-full ">
              <p class="text-gray-500 font-medium text-sm">I understand that settlement amount shall be subject to
                retention of requisite securities / funds towards outstanding obligations and margins in my account
                calculated in the manner specified by SEBI / Exchange and details mentioned in the "Statement of
                Account" at the time of settlement. I authorize you to send the statement of account on funds and
                securities as on the date of settelement to my e-mail id registered with you. I understand that i can
                obtain a copy of the same from your Head office.</p>
            </div>
             <Button type="button" ref="rippleBtn" @click="documentsavebtn"
          class=" primary_color wave-btn text-white w-full py-2 text-lg border-0  ">
         Save
        </Button>
        </Dialog>

      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
       <Button type="button" ref="rippleBtn" @click="handleButtonClick" 
    :disabled="!hasSignature || !isStatusValid"
    class="primary_color text-white w-5/6 py-3 text-xl border-0">
    {{ buttonText }}
  </Button>
      </div>


    </div>

  </div>
</template>
<script setup>

import { ref, onMounted, onUnmounted } from 'vue';
import Option1 from '~/components/NKYC_Forms/photo&sign/questionoption/radioquestionoption1.vue'
import Option2 from '~/components/NKYC_Forms/photo&sign/questionoption/radioquestionoption2.vue'
import Option3 from '~/components/NKYC_Forms/photo&sign/questionoption/radioquestionoption3.vue'
import Option4 from '~/components/NKYC_Forms/photo&sign/questionoption/radioquestionoption4.vue'
import Option5 from '~/components/NKYC_Forms/photo&sign/questionoption/radioquestionoption5.vue'
import Option6 from '~/components/NKYC_Forms/photo&sign/questionoption/radioquestionoption6.vue'
import Option7 from '~/components/NKYC_Forms/photo&sign/questionoption/radioquestionoption7.vue'
import Option8 from '~/components/NKYC_Forms/photo&sign/questionoption/radioquestionoption8.vue'

import { useRouter } from 'vue-router';
const hasSignature = ref(false);
const isSignatureUploaded = ref(false);
const isSignatureModified = ref(false);
const initialSignatureLoaded = ref(false);
const router = useRouter();
const question1 = ref('')
const question2 = ref('')
const question3 = ref('')
const question4 = ref('')
const question5 = ref('')
const question6 = ref('')
const question7 = ref('')
const question8 = ref('')
const deviceHeight = ref(0);
const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const buttonText = ref("Continue");
const canvasRef = ref(null);
const loading = ref(false)

const isStatusValid = ref(true);
const isBack = ref(true);
const signerror=ref(false)
const errorsign=ref('')
const visible=ref(false)
let ctx = null;
let isDrawing = false;
const isImageUploaded = ref(false);

const { baseurl } = globalurl();
const {htoken}=headerToken()



const getsegmentdata = async () => {
  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.proofs?.signature;
  if (statuscheck) {
    const segments = mydata?.payload?.metaData?.proofs?.signature ;
       isSignatureUploaded.value = true;
       const headertoken=htoken
      const imageauth = headertoken;
      const userToken = localStorage.getItem('userkey');
      const imgSrc = `${baseurl.value}/view/uploads/${imageauth}/${userToken}/${segments}`;
      imageSrc.value = imgSrc;


      const img = new Image();
      img.crossOrigin = "Anonymous"; // Required for canvas toDataURL from remote source
      img.onload = () => {
        const canvas = canvasRef.value;
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        isImageUploaded.value = true;
         hasSignature.value = true;
          initialSignatureLoaded.value = true;
      };
      img.src = imgSrc;
    

  }


};


const checkCanvasContent = () => {
  if (!canvasRef.value || !ctx) return false;
  
  const canvas = canvasRef.value;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  
  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i + 3] !== 0) { // Check alpha channel
      return true;
    }
  }
  return false;
};


const getsegmentdatadialog = async () => {
  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.additional_docs;
  if (statuscheck) {
    question1.value = mydata?.payload?.metaData?.additional_docs?.documentConsentMode
    question2.value = mydata?.payload?.metaData?.additional_docs?.contractNoteMode 
    question3.value = mydata?.payload?.metaData?.additional_docs?.standardDocsConsent 
    question4.value = mydata?.payload?.metaData?.additional_docs?.internetTradingOpted 
    question5.value = mydata?.payload?.metaData?.additional_docs?.pastActionsDetails 
    question6.value = mydata?.payload?.metaData?.additional_docs?.otherBrokerDetails 
    question7.value = mydata?.payload?.metaData?.additional_docs?.otherDPDetails 
    question8.value = mydata?.payload?.metaData?.additional_docs?.accountSettlementPreference 
  }
  else  {
    question1.value = 'Electronic'
    question2.value =  'Electronic'
    question3.value =  'Electronic'
    question4.value = 'Yes'
    question5.value = 'No'
    question6.value = 'No'
    question7.value = 'CDSL'
    question8.value = 'Once in Quarter'
  }

};


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
      message: 'Signature uploaded successfully!'
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


const startDrawing = (e) => {
  if (isImageUploaded.value) return;
  isDrawing = true;
  isSignatureModified.value = true; // Mark as modified when drawing starts
  const pos = getMousePos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
};

const draw = (e) => {
  if (!isDrawing || isImageUploaded.value) return;
  const pos = getMousePos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
};

const stopDrawing = (e) => {
  if (!isDrawing || isImageUploaded.value) return;
  isDrawing = false;
  ctx.beginPath();
  
  hasSignature.value = checkCanvasContent();
  if (hasSignature.value) {
    imageSrc.value = canvasRef.value.toDataURL('image/png');
  }
};


const drawDot = (x, y) => {
  if (isImageUploaded.value) return;
  ctx.beginPath();

  ctx.arc(x, y, 1.5, 0, Math.PI * 2); // reduced radius from 4 to 1.5
  ctx.fill();
}

const getMousePos = (event) => {
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  let clientX, clientY;
  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  };
};


onMounted(async () => {
  await getsegmentdata()
 
  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = 300;

  ctx = canvas.getContext("2d");
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";

  // Mouse drawing
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // Touch drawing
  canvas.addEventListener("touchstart", (e) => {
    const pos = getMousePos(e);
    drawDot(pos.x, pos.y);
    startDrawing(e);
  }, { passive: false });

  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);

  // Mouse single click to draw a dot
  canvas.addEventListener("click", (e) => {
    const pos = getMousePos(e);
    drawDot(pos.x, pos.y);
  });
});


onUnmounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  canvas.removeEventListener("mousedown", startDrawing);
  canvas.removeEventListener("mousemove", draw);
  canvas.removeEventListener("mouseup", stopDrawing);
  canvas.removeEventListener("mouseleave", stopDrawing);

  canvas.removeEventListener("touchstart", startDrawing);
  canvas.removeEventListener("touchmove", draw);
  canvas.removeEventListener("touchend", stopDrawing);
  canvas.removeEventListener("click", drawDot);
});

const imageSrc = ref('');
const emit = defineEmits(['updateDiv']);




const uploadsign = async () => {
      signerror.value=false
  loading.value = true;
    startProgressAnimation();
  const apiurl = `${baseurl.value}proofFormUpload`;
const headertoken=htoken
  

  try {
    // Fetch the image as a Blob (binary)
    const response = await fetch(imageSrc.value);
    const blob = await response.blob();

    // Create encrypted metadata (excluding image)
    const user =await encryptionrequestdata({
      userToken: localStorage.getItem('userkey'),
      pageCode: "additionalinformation"
    });

    // Prepare FormData
    const formData = new FormData();
    formData.append('signature', blob, 'signature.jpg'); // Binary file
    formData.append('payload', JSON.stringify({ payload: user }));

   

    const uploadResponse = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization': headertoken,
        // Content-Type must NOT be set manually for FormData
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
        isSignatureUploaded.value = true;
       pagestatus('esign')
      emit('updateDiv', 'esign');
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
  } finally {
    loading.value = false;
  }
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
 const data = await pagestatus('photoproceed')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'photoproceed');
  isBack.value = false;
}
  }, 600)

}
const erase = () => {
  if (!canvasRef.value || !ctx) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  imageSrc.value = '';
  isImageUploaded.value = false;
  hasSignature.value = false;
  isSignatureModified.value = true; // Mark as modified when erased
};

const fileInput = ref(null);

const triggerUpload = () => {
  fileInput.value?.click();
};
const uploadImage = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.value;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      isImageUploaded.value = true;
      imageSrc.value = canvas.toDataURL('image/png');
      hasSignature.value = true;
      isSignatureModified.value = true; // Mark as modified when new image uploaded
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};
// Modify erase to update hasSignature
const handleButtonClick = async () => {
  // Check if canvas is empty
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let isEmpty = true;
  
  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i + 3] !== 0) {
      isEmpty = false;
      break;
    }
  }
  
  if (isEmpty && !isImageUploaded.value) {
    signerror.value = true;
    errorsign.value = 'Please draw your signature or upload an image before continuing';
    return;
  }
  
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

  setTimeout(async () => {
    circle.remove();
    
    if (initialSignatureLoaded.value && !isSignatureModified.value) {
      const page = await pagestatus('esign');
      if (page?.payload?.status === 'ok') {
        emit('updateDiv', 'esign');
      }
    } else {
      await uploadsign();
    }
  }, 600);
};

const additionaldoc=()=>{
 visible.value=true
 getsegmentdatadialog()
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
    otherDPDetails:question7.value || 'CDSL',
    accountSettlementPreference: question8.value ||'Once in Quarter' ,
    settlementStatementConsent:  'Yes'

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
  
    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const decryptedData = await response.json();
    const data = await decryptionresponse(decryptedData);
    if (data.payload.status === 'ok') {
     visible.value=false
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
</script>
<style>
.signature-canvas {
  width: 100%;
  height: 270px;
  border: 1px dashed #ccc;
  touch-action: none;
  background-color: white;
}
</style>