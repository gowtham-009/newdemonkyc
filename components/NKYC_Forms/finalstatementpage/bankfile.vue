<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px" />
      <profile />
    </div>

    <div v-if="content" class="flex justify-between items-center px-2 p-1 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full">
        <div class="w-full p-1 flex flex-col mt-2 items-center">
          <p class="text-md font-normal leading-5 text-gray-500">
            Thank you, esign completed. If you want to activate F&O / MCX,
            please upload the last 6 months bank statements or Download
            automatically.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-2 mt-2">
          <template v-for="(option, index) in options" :key="option.value">
            <button @click="toggleSelection(option.value)" :class="[
              'w-full text-left px-3 py-2 rounded-2xl border-2 transition-all shadow-sm relative',
              selected === option.value
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-black dark:bg-gray-800 dark:text-white'
            ]">
              <div class="flex justify-between items-center">
                <p class="text-md font-semibold">{{ option.label }}</p>
                <i v-if="selected === option.value"
                  class="pi pi-check text-green-500 text-xl rounded-full bg-green-100 p-2"></i>
              </div>
              <p class="text-sm opacity-70">{{ option.subtext }}</p>
            </button>

            <!-- Insert "or" between first and second option -->
            <div v-if="index === 0" class="text-center text-gray-500 font-semibold">OR</div>
          </template>
        </div>

        <div v-if="uploadedPDF" class="w-full bg-gray-100 p-3 rounded-xl mt-3 dark:bg-gray-800">
  <div class="flex items-center justify-between">
    <a
      :href="uploadedPDF" target="_blank"
      class="text-blue-600 font-semibold underline hover:text-blue-800 dark:text-blue-400">
      View Uploaded Bank Statement
    </a>
    <button
      @click="editPDF"
      class="ml-4 text-sm px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition">
      Edit
    </button>
  </div>
</div>

        <div v-if="pdferrorbox" class="w-full p-1 mt-2 rounded-lg bg-red-50">
          <p class="text-sm text-red-500 text-center">Sorry we couldnt fetch you data, please upload pdf.</p>
        </div>
        <input type="file" accept="application/pdf" ref="fileInput" @change="uploadPDF" style="display: none" />


      </div>

      <div class="w-full flex gap-2 mt-4">
        <Button ref="rippleBtnback" @click="back()" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>

        <Button type="button" @click="handleButtonClick"
          :disabled="selected !== 'Upload Last 6 Months Bank Statement PDF'  " ref="rippleBtn"
          class="primary_color wave-btn text-white w-5/6 py-3 text-xl border-0 relative overflow-hidden">
          {{ buttonText }}
        </Button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center flex-col p-2  bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <ProgressSpinner />
      <p class="text-sm text-blue-500 text-center">Please wait, we are fetching data from your Bank</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const emit = defineEmits(['updateDiv']);
const { baseurl } = globalurl();
const {htoken}=headerToken()
const deviceHeight = ref(window.innerHeight);
const buttonText = ref('Activate F&O');
const rippleBtn = ref(null);
const rippleBtnback = ref(null);
const content = ref(true);
const loading = ref(false);
const fileInput = ref(null);
const selected = ref('');
const route = useRoute();
const uploadedPDF=ref('')
const pdferrorbox = ref(false);
const uploadTriggeredByEdit = ref(false);
const isNewUpload = ref(false); // Add this flag to track new uploads

const isBack = ref(true);
const isStatusValid = ref(true);
let intervalId = null;
import { useRouter } from 'vue-router';
const router = useRouter();

const getdatapdf = async() => {
  const mydata = await getServerData();
  const bankpdf = mydata?.payload?.metaData?.proofs?.bankStatement;
  if(bankpdf) {
    const headertoken = htoken;
    const imageauth = headertoken;
    const userToken = localStorage.getItem('userkey');
    const bankstatementpdffile = `${baseurl.value}/view/uploads/${imageauth}/${userToken}/${bankpdf}`;
    uploadedPDF.value = bankstatementpdffile;
  }
}

const options = [
  {
    label: 'CAMS',
    value: 'CAMS',
    subtext: 'Automatically fetch last 6 months of bank statement.'
  },
  {
    label: 'Upload Last 6 Months Bank Statement PDF',
    value: 'Upload Last 6 Months Bank Statement PDF',
    subtext: 'Upload PDF of your bank statement manually.'
  }
];

const toggleSelection = async(value) => {
  selected.value = value;
  if (value === 'CAMS') {
    uploadedPDF.value=false
      const mydata = await getServerData();
      if(mydata.payload.status=='ok'){
        camsbankdata();
      }
     else if (mydata.payload.status == 'error') {
        if (mydata.payload.code == '1002' || mydata.payload.code=='1004'){
             alert(mydata.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }
  } else if (value === 'Upload Last 6 Months Bank Statement PDF') {
    pdferrorbox.value=false
    buttonText.value = 'Upload Bank Statement';
  }
};

function extractTimestamp(filename) {
  const match = filename?.match(/(\d+)\.pdf$/);
  if (match && match[1]) {
    const timestamp = parseInt(match[1], 10);
    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return { timestamp, formattedDate };
  } else {
    return { timestamp: null, formattedDate: 'Invalid filename' };
  }
}

const initPage = async () => {
    
  const queryval = route.query.ecres;
  const mydata = await getServerData();

  const statuscheck = mydata.payload.metaData.proofs.bankStatement;
  const statuscheck2 = mydata.payload.metaData.cams_data.bankStatementFile;

  const statuscheckResult = extractTimestamp(statuscheck);
  const statuscheck2Result = extractTimestamp(statuscheck2);

  if (queryval) {
    content.value = false;
    loading.value = true;
    intervalId = setInterval(() => {
   
      camsbankdatacheck();
    }, 5000);
  } else if (statuscheck2 || statuscheck) {
    const time1 = statuscheckResult.timestamp || 0;
    const time2 = statuscheck2Result.timestamp || 0;

    if (time2 >= time1) {
      selected.value = 'CAMS';
      uploadedPDF.value=false
    } else {

      await getdatapdf()
      selected.value = 'Upload Last 6 Months Bank Statement PDF';
      buttonText.value = 'Upload Bank Statement';
    }
  }
};

const editPDF = () => {
  uploadTriggeredByEdit.value = true;
  isNewUpload.value = true; // Set flag when editing
  triggerUpload();
};
onMounted(async() => {

  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
  initPage();
});

let checkCount = 0; 

const camsbankdatacheck = async () => {
 
  const headertoken=htoken
  const apiurl = `${baseurl.value}cams`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: 'thankyou',
    camsAction: 'checkCamsStatus',
  });

  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        Authorization: headertoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: user }),
    });

    const decryptedData = await response.json();
    const data = await decryptionresponse(decryptedData);
    const meta = data.payload?.metaData;

    if (data.payload.status === 'ok') {
    
      const clienttrnxid1 = meta?.cams_create?.clienttrnxid;
      const clienttrnxid2 = meta?.cams_data?.clienttxnid;
      const consentStatus = meta?.cams_create?.consentStatus;
      const bankStatementFile = meta?.cams_data?.bankStatementFile;
      const camsData = meta?.cams_data;

      if (
        clienttrnxid1 === clienttrnxid2 &&
        consentStatus === 'ACTIVE' &&
        bankStatementFile
      ) {

        clearInterval(intervalId);
        const mydata = await pagestatus('thankyou');
        if (mydata.payload.status === 'ok') {
          emit('updateDiv', 'thankyou');
        }
      } else {
        checkCount++;

        const isCamsDataEmpty =
          Array.isArray(camsData) && camsData.length === 0;

        if (checkCount >= 5 && (consentStatus === 'REJECTED' || isCamsDataEmpty)) {
          clearInterval(intervalId);
          loading.value = false;
          content.value = true;
          pdferrorbox.value = true;
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
    console.error('camsbankdatacheck error:', error.message);
  }
};

const camsbankdata = async () => {

  const headertoken=htoken
  const mydata = await getServerData();
  const ifscvalue = mydata?.payload?.metaData?.bank?.bank1IFSC;

  const apiurl = `${baseurl.value}cams`;
  const user = await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: 'csmspdf',
    camsAction: 'createCams',
    bankIfsc: ifscvalue,
    redirecUrl: 'https://nkcynewone.vercel.app/main',

   
  });



  try {
    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        Authorization: headertoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: user }),
    });

    const decryptedData = await response.json();
    const data = await decryptionresponse(decryptedData);
    if (data.payload.status === 'ok') {
      window.location.href = data.payload.metaData.redirectionurl;
    }
    else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }

  } catch (error) {
    console.error('camsbankdata error:', error.message);
  }
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const uploadPDF = async (event) => {
  const file = event.target.files[0];
  if (!file || file.type !== 'application/pdf') {
    
    return;
  }

  // Create preview URL
  uploadedPDF.value = URL.createObjectURL(file);


  if (isNewUpload.value || selected.value === 'Upload Last 6 Months Bank Statement PDF') {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const pdfDataUrl = e.target.result;
      await bankstatement(pdfDataUrl);
    };
    reader.readAsDataURL(file);
  }

  // Reset the flag after upload
  isNewUpload.value = false;
  event.target.value = ''; // Clear for re-selection
};


const bankstatement = async (pdfval) => {
  const apiurl = `${baseurl.value}proofFormUpload`;

  try {
    const response = await fetch(pdfval);
    const blob = await response.blob();

    const user =await encryptionrequestdata({
      userToken: localStorage.getItem('userkey'),
      pageCode: 'thankyou'
    });
    
    const headertoken=htoken
    const formData = new FormData();
    formData.append('bankStatement', blob, 'bankstatement.pdf');
    formData.append('payload', JSON.stringify({ payload: user }));

    const uploadResponse = await fetch(apiurl, {
      method: 'POST',
      headers: {
        Authorization: headertoken,
      },
      body: formData,
    });

    const decryptedData = await uploadResponse.json();
    const data = await decryptionresponse(decryptedData);
    if (data.payload.status === 'ok') {
      const pageroute = await pagestatus('thankyou');
      if (pageroute.payload.status === 'ok') {
        pdferrorbox.value = false;
        emit('updateDiv', 'thankyou');
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
    console.error('bankstatement error:', error.message);
  }
};
const handleButtonClick = async (event) => {
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
    
    // If PDF already exists, directly move to thank you page
    if (uploadedPDF.value) {
      const pageroute = await pagestatus('thankyou');
      if (pageroute.payload.status === 'ok') {
        emit('updateDiv', 'thankyou');
      }

      else if (pageroute.payload.status == 'error') {
      if (pageroute.payload.code == '1002' || pageroute.payload.code=='1004'){
    alert(pageroute.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}

    } 
    // Else trigger upload
    else {
      triggerUpload();
    }
  }, 600);
};


const back = async () => {
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
   const data = await pagestatus('esign')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'esign');
  isBack.value = false;
}
  }, 600);
};
</script>