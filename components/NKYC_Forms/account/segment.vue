<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <div class="flex justify-between  p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">

      <!-- Income Selection -->
      <div class="w-full mt-1 px-2 p-1">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Segments
        </p>
        <p class="text-sm  text-gray-500 font-normal leading-5">
          These details are required by SEBI to open your Demat account.
        </p>


        <div class="grid grid-cols-1 gap-2 mt-2">
          <button v-for="option in options" :key="option.value" @click="toggleSelection(option.value)" :class="[
            'w-full text-left px-3 py-2 rounded-2xl border-2 transition-all shadow-sm relative',
            selected.includes(option.value)
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-300 text-black dark:bg-gray-800 dark:text-white'
          ]">
            <!-- Top row: label and check icon -->
            <div class="flex justify-between items-center">
              <p class="text-md font-semibold">
                {{ option.label }}
              </p>
              <i v-if="selected.includes(option.value)"
                class="pi pi-check text-green-500 text-xl rounded-full bg-green-100 p-2"></i>
            </div>

            <!-- Subtext -->
            <p class="text-sm  opacity-70">
              {{ option.subtext }}
            </p>
          </button>
        </div>
             <span class="text-red-500">{{ segmenterror }}</span>


      </div>

      <!-- Submit Button -->
      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" ref="rippleBtn" @click="handleButtonClick" :disabled="selected.length === 0 || !isStatusValid"
          class="primary_color wave-btn text-white w-5/6 py-3 text-xl border-0">
          {{ buttonText }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const emit = defineEmits(['updateDiv']);
const { baseurl } = globalurl();
const {htoken}=headerToken()
const selected = ref(['equity', 'fno', 'commodities']);
const isStatusValid = ref(true); 
const isBack = ref(true); 
const segmenterror=ref('')
const options = [
  {
    label: 'Equity',
    value: 'equity',
    subtext: 'NSE CASH, BSE CASH'
  },
  {
    label: 'F&O',
    value: 'fno',
    subtext: 'NSE F&O, BSE F&O'
  },
  {
    label: 'Commodities',
    value: 'commodities',
    subtext: 'NSE, BSE, MCX'
  }
];

const toggleSelection = (value) => {
  segmenterror.value=''
  const index = selected.value.indexOf(value);
  if (index > -1) {
    selected.value.splice(index, 1);
  } else {
    selected.value.push(value);
  }
};


const getsegmentdata = async () => {
  const mydata = await getServerData();

  const segments = mydata?.payload?.metaData?.segments || {};

  const segmentToInternalMap = {
    nseCASH: 'equity',
    bseCASH: 'equity',
    nseFO: 'fno',
    bseFO: 'fno',
    nseCOM: 'commodities',
    bseCOM: 'commodities',
    MCX: 'commodities'
  };

  const internalSelectionSet = new Set();

  const statuscheck = mydata?.payload?.metaData?.kraPan?.APP_KRA_INFO;
  const hasAadhaar = mydata?.payload?.metaData?.digi_info?.aadhaarUID &&
    mydata?.payload?.metaData?.digi_docs?.aadhaarDocument;

  if (statuscheck || hasAadhaar) {
    Object.entries(segments).forEach(([key, value]) => {
      if (value === "YES" && segmentToInternalMap[key]) {
        internalSelectionSet.add(segmentToInternalMap[key]);
      }
    });

    // Override only if there's data; otherwise keep the default
    if (internalSelectionSet.size > 0) {
      selected.value = Array.from(internalSelectionSet);
    }
  }
};


await getsegmentdata()
const deviceHeight = ref(0);
const buttonText = ref("Next");
const rippleBtn = ref(null);
const rippleBtnback = ref(null)


const segmentdata = async () => {
  const apiurl = `${baseurl.value}segments`;

  // Map from selected options (e.g., equity, fno, commodities) to segment flags
  const segmentFlags = {
    nseCASH: "NO",
    bseCASH: "NO",
    nseFO: "NO",
    bseFO: "NO",
    nseCOM: "NO",
    bseCOM: "NO",
    nseCD: "NO",
    nseMF: "NO",
    bseCD: "NO",
    bseMF: "NO",
    MCX: "NO",
    ICEX: "NO",
    mseCD: "NO"
  };

  if (selected.value.includes('equity')) {
    segmentFlags.nseCASH = "YES";
    segmentFlags.bseCASH = "YES";
  }

  if (selected.value.includes('fno')) {
    segmentFlags.nseFO = "YES";
    segmentFlags.bseFO = "YES";
  }

  if (selected.value.includes('commodities')) {
    segmentFlags.nseCOM = "YES";
    segmentFlags.bseCOM = "YES";
    segmentFlags.MCX = "YES";
  }

  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: "brokerage",
    ...segmentFlags
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
    segmenterror.value=''
    if (data.payload.status === 'ok') {
      emit('updateDiv', 'brokerage');
    }
     else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }

         else if (data.payload.status == 'error' && data.payload.code=='I1001') {
       
      segmenterror.value=data.payload.message
}
       
      }

     

  } catch (error) {
    console.error(error.message);
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

  setTimeout(async () => {
    circle.remove()

 const data = await pagestatus('bank4')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'bank4');
  isBack.value = false;
}
  }, 600)

};

onMounted(() => {
  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});

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
    segmentdata()
    isStatusValid.value = false;
  }, 600)
};
</script>
