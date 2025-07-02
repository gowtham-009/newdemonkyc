<template>
  <div class="primary_color">
    <!-- Header Section -->
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <!-- Main Content Area -->
    <div class="flex justify-between p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full px-2 p-1">
        <!-- Title and Location Status -->
        <div class="w-full flex">
          <div class="w-full">
            <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
              Take a selfie
            </p>
          </div>
          <div class="w-full flex justify-center items-center">
            <div v-if="locationEnabled" class="flex flex-col justify-center rounded">
              <p class="text-gray-500 text-sm">{{ latitude.toFixed(4) }} - {{ longitude.toFixed(4) }}</p>
            </div>

            <div v-if="locationLoading" class="w-full rounded-lg bg-blue-50">
              <div class="flex items-center gap-2 p-1 justify-center">
                <i class="pi pi-spinner pi-spin text-xl text-blue-500"></i>
                <span class="text-blue-500 text-sm">Fetching location...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <p class="text-sm text-gray-500 font-normal leading-4 mt-1">
          Ensure your nose is positioned at the center of the cross
        </p>

        <!-- Location Permission Alert -->
        <div v-if="showLocationAlert" class="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg">
          <div class="flex items-start">
            <i class="pi pi-exclamation-triangle text-xl mr-3 mt-0.5"></i>
            <div>
              <p class="font-bold">Location Access Required</p>
              <p class="mt-1">We need your location to verify your identity. Please enable location services in your {{ device }} settings.</p>
              <div class="flex gap-2 mt-3">
                <button @click="requestLocation" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  <i class="pi pi-refresh mr-1"></i> Try Again
                </button>
              
              </div>
            </div>
          </div>
        </div>

        <!-- Camera Component -->
        <div v-if="locationEnabled" class="w-full mt-3 flex justify-center flex-col">
          <CMAIDENTIFY 
      ref="cameraComponent"
      @captured="onImageCaptured" 
      @error="onCameraError" 
    />
        </div>

        <div v-if="ipverror" class="w-100 p-1 bg-red-100 mt-2 px-2 rounded-lg" >
          <p class="text-sm text-red-500 text-center leading-5">{{ ipvlimiterror }}</p>
        </div>
       
        <div v-if="loadingprogress" class="max-w-md mx-auto p-2 px-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg ">
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

        <!-- Camera Error Alert -->
        <div v-if="cameraError" class="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          <div class="flex items-center">
          
            <div>
              <p class="font-bold">Camera Error</p>
              <p>{{ cameraError }}</p>
            </div>
          </div>
        </div>
      </div>
 <Dialog v-model:visible="visible" modal header="Failed" :style="{ width: '25rem' }">
      <p>Hi, Your Image Quality is 0%</p>
      <p>Hi, We could not verify your face.</p>
      <p>1. Ensure your face is facing towards light source</p>
      <p>2. Click 'Take Picture'</p>
      <p>We will verify and move you to Next Step</p>

      <p>Note: We need your image quality to meet minimum 85% and above for succesfull verfication</p>

      <div class="w-full flex justify-end">
        <Button type="button" @click="retake()" class="bg-blue-500 border-0 text-md text-white">Retake</Button>
      </div>
 </Dialog>
      <!-- Action Buttons -->
        <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" :disabled="!imageCaptured || !isStatusValid" ref="rippleBtn" @click="handleButtonClick"
          class=" primary_color  text-white w-5/6 py-3 text-xl border-0  ">
          {{ buttonText }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import CMAIDENTIFY from '~/components/NKYC_Forms/photo&sign/cameraidentification/cmaidentify.vue';
const emit = defineEmits(['updateDiv']);
// Component References
const rippleBtn = ref(null);
const rippleBtnback = ref(null);
const router = useRouter();
const cameraComponent = ref(null);
// Device & UI State
const deviceHeight = ref(window.innerHeight);

const buttonText = ref("Next");
const isBack = ref(true);

const ipverror=ref(false)
const ipvlimiterror=ref('')
// Location State
const locationEnabled = ref(false);
const locationLoading = ref(true);
const showLocationAlert = ref(false);
const latitude = ref(null);
const longitude = ref(null);

const locationInterval = ref(null);

// Camera & Image State
const imageCaptured = ref(null);
const cameraError = ref(null);
const isStatusValid = ref(true);
const loadingprogress = ref(false)

const visible=ref(false)

// Configuration
const { baseurl } = globalurl();
const {htoken}=headerToken()
const device=ref('Desktop')


onMounted(() => {
  locationLoading.value = true;
  setupResizeListener();
  checkLocationPermission();

  // 🔁 Start location polling every 5 seconds
  locationInterval.value = setInterval(() => {
    if (!locationEnabled.value) {
      getLocationWithTimeout(true);
    }
  }, 5000);
});


function retake() {
  visible.value = false;
  imageCaptured.value = null; // Clear the captured image
  isStatusValid.value = true; // Reset validation status
  
  // Call the retake method on the camera component if it exists
  if (cameraComponent.value && cameraComponent.value.retakePhoto) {
    cameraComponent.value.retakePhoto();
  }
}
onUnmounted(() => {
  if (locationInterval.value) {
    clearInterval(locationInterval.value);
    locationInterval.value = null;
  }
});


// Methods
function setupResizeListener() {
  const updateDeviceInfo = () => {
    deviceHeight.value = window.innerHeight;
    device.value = window.innerWidth <= 992 ? 'Mobile' : 'Desktop';
  };

  // Set initial values
  updateDeviceInfo();

  // Add resize listener
  window.addEventListener('resize', updateDeviceInfo);
}

async function checkLocationPermission() {
  try {
    locationLoading.value = true;
    showLocationAlert.value = false;

    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    // Modern permission API check
    if (navigator.permissions) {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      handlePermissionState(permissionStatus.state);
      
      permissionStatus.onchange = () => {
        handlePermissionState(permissionStatus.state);
      };
    } else {
      // Fallback for older browsers
      getLocationWithTimeout();
    }
  } catch (err) {
    handleLocationError(err);
  }
}

function handlePermissionState(state) {
  if (state === 'granted') {
    getLocationWithTimeout();
  } else if (state === 'prompt') {
    getLocationWithTimeout();
  } else {
    locationLoading.value = true;
    showLocationAlert.value = true;
  }
}

function getLocationWithTimeout(isRepeated = false) {
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      handleLocationSuccess(position);
      if (isRepeated && locationInterval.value) {
        clearInterval(locationInterval.value); // ✅ Stop interval after successful location fetch
        locationInterval.value = null;
      }
    },
    (err) => {
      handleLocationError(err);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}


function handleLocationSuccess(position) {
  latitude.value = position.coords.latitude;
  longitude.value = position.coords.longitude;
  locationEnabled.value = true;
  locationLoading.value = false;
  showLocationAlert.value = false;
}

function handleLocationError(error) {
  console.error('Location error:', error);
  locationLoading.value = true;
  showLocationAlert.value = true;
  locationEnabled.value = false;
}

function requestLocation() {
  showLocationAlert.value = false;
  locationLoading.value = true;
  getLocationWithTimeout();
}



function onImageCaptured(imageData) {
  imageCaptured.value = imageData;
  cameraError.value = null;
}

function onCameraError(error) {
  cameraError.value = error.message || 'Failed to access camera';
}

const getCountry = async () => {
  if (!latitude.value || !longitude.value) {
    console.error('Latitude or longitude is missing')
    return
  }

  const apiKey = 'R2ey6sqmfP210eJgVXX-NvmoUgrKlDAW4JwVXgVEaHs'
  const apiUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude.value},${longitude.value}&lang=en-US&apiKey=${apiKey}`

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`)
    }
    const data = await response.json()
    // const data = await decryptionresponse(decryptedData);
    if (data) {
      const geolocation = {
        latitute: data.items[0].position.lat,
        longitude: data.items[0].position.lng,
        conuntryname: data.items[0].address.countryName,
        countrycode: data.items[0].address.countryCode,
      }
      return geolocation
    }


  } catch (error) {
    console.error('Error fetching location:', error.message)
  }
}



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
      title: 'Syncing!',
      message: 'IPV uploaded successfully!'
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
    loadingprogress.value = false;
  }, 500);
};

const resetProgress = () => {
  clearInterval(progressInterval.value);
  loadingprogress.value = false;
  progress.value = 0;
};

const ipvfunction = async () => {
   ipverror.value=false
  if(!imageCaptured.value){
    ipverror.value=true
    ipvlimiterror.value="Ipv image invalid"
    return
  }
  loadingprogress.value = true
  startProgressAnimation();

  const apiurl = `${baseurl.value}ipv`;
  const location = await getCountry();

  try {
    // Fetch binary blob of the captured image
    const response = await fetch(imageCaptured.value); // imageCaptured should be a blob URL (e.g., from canvas)
    const blob = await response.blob();
const headertoken=htoken
    // Encrypt metadata
    const user =await encryptionrequestdata({
      userToken: localStorage.getItem('userkey'),
      pageCode: "photoproceed",
      location: `${location.latitute},${location.longitude}`,
      country: location.conuntryname
    });

    // Prepare FormData
    const formData = new FormData();
    formData.append('ipvImage', blob, 'ipv.jpg'); // Binary image file
    formData.append('payload', JSON.stringify({ payload: user }));



    const uploadResponse = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization': headertoken,
        // DO NOT set Content-Type for FormData
      },
      body: formData,
    });



    if (!uploadResponse.ok) {
      throw new Error(`Network error: ${uploadResponse.status}`);
    }

    const decryptedData = await uploadResponse.json();
    console.log('Decrypted Data:', decryptedData);
    const data = await decryptionresponse(decryptedData);
    if (data.payload.status == 'ok' ) {
     completeProgress();
      if (data.payload.metaData.is_real === 'true' && data.payload.metaData.realValue >= 0.6) {
        pagestatus('photoproceed');
        emit('updateDiv', 'photoproceed');
      } else {
       visible.value=true
      }
    }


    else if(data.payload.status == 'error'&& data.payload.code == 'L1002'){
      loadingprogress.value=false
      ipvlimiterror.value=data.payload.message
      ipverror.value=true
     
    }

   else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             loadingprogress.value=false
          alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }



  } catch (error) {
   resetProgress();
    console.error('IPv Upload Failed:', error.message);
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

  setTimeout(() => {
    circle.remove()
 ipvfunction();
      isStatusValid.value = false;
   
    // if (!loadingprogress.value && imageCaptured.value && isStatusValid.value) {
    //   ipvfunction();
    //   isStatusValid.value = false;
    // }

  }, 600)
};


</script>

<style>
.pi-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>