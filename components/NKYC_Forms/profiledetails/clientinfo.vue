<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>
    <div class="flex justify-between p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full mt-1 px-2 p-1">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
          Client information
        </p>

        <div class="w-full mt-1 ">
          <Father v-model="father" />
            <span class="text-red-500">{{ fathererror }}</span>

        </div>
        <div class="w-full mt-1">
          <Mother v-model="mother" />
                      <span class="text-red-500">{{ mothererror }}</span>

        </div>








      </div>

      <div class="w-full flex gap-2">
        <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button type="button" ref="rippleBtn" @click="handleButtonClick" :disabled="!father || !mother || !isStatusValid"
          class=" primary_color  text-white w-5/6 py-3 text-xl border-0  ">
          {{ buttonText }}
        </Button>
      </div>


    </div>

  </div>






</template>
<script setup>

import Father from '~/components/NKYC_Forms/profiledetails/profileinputs/father.vue'
import Mother from '~/components/NKYC_Forms/profiledetails/profileinputs/mother.vue'
import { ref, onMounted } from 'vue';
import { pagestatus } from '~/utils/pagestatus.js'
import { useRouter } from 'vue-router';
const router = useRouter();
const { baseurl } = globalurl();
const {htoken}=headerToken()
const emit = defineEmits(['updateDiv']);

const deviceHeight = ref(0);
const buttonText = ref("Next");
const rippleBtn = ref(null);
const rippleBtnback = ref(null)

const father = ref("");
const mother = ref("");

const fathererror=ref('')
const mothererror=ref('')

const isStatusValid = ref(true);
const isBack = ref(true);
const profilesetinfo = async () => {
  try {
    const mydata = await getServerData();
    
    // Safely access nested properties with optional chaining
    const kraPan = mydata?.payload?.metaData?.kraPan || {};
    const personal = mydata?.payload?.metaData?.personal || {};
    const digiInfo = mydata?.payload?.metaData?.digi_info || {};
    const digiDocs = mydata?.payload?.metaData?.digi_docs || {};

    // Check if personal data is empty or missing
    if (!personal || Object.keys(personal).length === 0) {
      if (kraPan.APP_KRA_INFO) {
        // Use KRA data as primary source
        father.value = kraPan.APP_F_NAME || '';
        mother.value = kraPan.APP_M_NAME || personal.motherName || '';
      } 
      else if (digiInfo.aadhaarUID && digiDocs.aadhaarDocument) {
        // Fall back to digi info if available
        father.value = personal.fatherName || '';
        mother.value = personal.motherName || '';
      }
    } 
    else {
      // Use personal data if available (checking both father and mother names)
      father.value = personal.fatherName || '';
      mother.value = personal.motherName || '';
      
      // If either name is missing, try to fall back to other sources
      if (!father.value && kraPan.APP_KRA_INFO) {
        father.value = kraPan.APP_F_NAME || '';
      }
      if (!mother.value) {
        mother.value = kraPan.APP_M_NAME || personal.motherName || '';
      }
    }
    
  } catch (error) {
    console.error('Error processing profile info:', error);
    // Set default empty values in case of error
    father.value = '';
    mother.value = '';
  }
};

await profilesetinfo()


onMounted(() => {
  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});

const personalinfo = async () => {
  const apiurl = `${baseurl.value}personal_info`;
  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: "qualification",
    fatherName: father.value,
    motherName: mother.value,

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
      const decryptedData = await response.json()
      const data = await decryptionresponse(decryptedData);
          fathererror.value=""
     mothererror.value =""
      if (data.payload.status == 'ok') {
        emit('updateDiv', 'qualification');
      }

        else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }

         else if(data.payload.status=='error' && data.payload.errors.length>0){
  
   
    
  data.payload.errors.forEach((err) => {
    

    if (err.field === 'fatherName' && !father.value) {
      fathererror.value = err.message || ' ';
    }
    if (err.field === 'motherName' && !mother.value) {
      mothererror.value = err.message || ' ';
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
    personalinfo()
    isStatusValid.value = false;
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


    const data = await pagestatus('info')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'info');
  isBack.value = false;
}
  }, 600)

};
</script>
