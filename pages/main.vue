<template>
  <div v-if="authenticated">
    <transition name="fade-slide" mode="out-in">
      <div v-if="currentForm === 'mobile'">
        <form2 :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'email'">
        <form3 :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'main'">
        <NKYCList @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'ekyc'">
        <EKYC :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'parmanentaddress'">
        <PARMANENTADDRESS :data="data" @updateDiv="handleUpdateDiv" />
      </div>
     
      <div v-else-if="currentForm === 'communicationaddress'">
        <COMMUNICATIONADDRESS :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      
      <div v-else-if="currentForm === 'info'">
        <MARRIEDSTATUS @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'clientinfo'">
        <CLIENTINFO @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'qualification'">
        <QUALIFICATION @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'occupation'">
        <OCCUPATION @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'tradingexperience'">
        <TRADINGEXPERIENCE @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'income'">
        <INCOME @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'nominee'">
        <NOMINEE @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'bank1'">
        <BANK1 @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'bank4'">
        <BANK4 :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'segment1'">
        <SEGMENT :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'brokerage'">
        <BROKERAGE :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'uploadproof'">
        <UPLOADPROOF :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'uploadbank'">
        <UPLOADBANK :data="data" @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'photosign1'">
        <PHOTOSIGN1 @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'takephoto'">
        <TAKEPHOTO @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'photoproceed'">
        <PHOTOPROCEED :data="data" @updateDiv="handleUpdateDiv" />
      </div>
     
      <div v-else-if="currentForm === 'signdraw'">
        <SIGNDRAWING :data="data" @updateDiv="handleUpdateDiv" />
      </div>
     
      <div v-else-if="currentForm === 'esign'">
        <ESIGN @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'bankfile'">
        <BANKFILE @updateDiv="handleUpdateDiv" />
      </div>
      <div v-else-if="currentForm === 'thankyou'">
        <THANKYOU @updateDiv="handleUpdateDiv" />
      </div>
    </transition>
  </div>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getServerData } from '~/utils/serverdata.js'

// Import components
import form2 from '~/components/signup/form2.vue';
import form3 from '~/components/signup/form3.vue';
import NKYCList from '~/components/NKYC_Forms/nkyclist.vue'
import EKYC from '~/components/NKYC_Forms/pandetails/e-kyc.vue'
import PARMANENTADDRESS from '~/components/NKYC_Forms/pandetails/parmanentaddress.vue'
import COMMUNICATIONADDRESS from '~/components/NKYC_Forms/pandetails/communicationaddress.vue'
import MARRIEDSTATUS from '~/components/NKYC_Forms/profiledetails/marridestatus.vue'
import CLIENTINFO from '~/components/NKYC_Forms/profiledetails/clientinfo.vue'
import QUALIFICATION from '~/components/NKYC_Forms/profiledetails/qualification.vue'
import OCCUPATION from '~/components/NKYC_Forms/profiledetails/occupationstatus.vue'
import TRADINGEXPERIENCE from '~/components/NKYC_Forms/profiledetails/tradingexperience.vue'
import INCOME from '~/components/NKYC_Forms/profiledetails/incomestatus.vue'
import NOMINEE from '~/components/NKYC_Forms/profiledetails/nominee.vue'
import BANK1 from '~/components/NKYC_Forms/bankdetails/bank1.vue'
import BANK4 from '~/components/NKYC_Forms/bankdetails/bank4.vue'

import SEGMENT from '~/components/NKYC_Forms/account/segment.vue'
import BROKERAGE from '~/components/NKYC_Forms/account/brokerage.vue'
import UPLOADPROOF from '~/components/NKYC_Forms/account/uploadpan.vue'
import UPLOADBANK from '~/components/NKYC_Forms/account/uploadbank.vue'
import PHOTOSIGN1 from '~/components/NKYC_Forms/photo&sign/photosign.vue'
import TAKEPHOTO from '~/components/NKYC_Forms/photo&sign/takephoto.vue'
import PHOTOPROCEED from '~/components/NKYC_Forms/photo&sign/pictureproceed.vue'
import SIGNDRAWING from '~/components/NKYC_Forms/photo&sign/signdraw.vue'

import ESIGN from '~/components/NKYC_Forms/esign/esign.vue'
import BANKFILE from '~/components/NKYC_Forms/finalstatementpage/bankfile.vue'

import THANKYOU from '~/components/NKYC_Forms/thankyou.vue'
const authenticated = ref(true) 
const route = useRoute()
const router = useRouter()
const currentForm = ref('nkyclist')
const data = ref({})
const formMap = {
  '$@mobile1': 'mobile',
  '$@email1': 'email',
  '$@main1': 'main',
  '$@ekyc1': 'ekyc',
  '$@parmanent1': 'parmanentaddress',
  '$@comm1': 'communicationaddress',
  '$@info1': 'info',
  '$@clientinfo1': 'clientinfo',
  '$@qual1': 'qualification',
  '$@occup1': 'occupation',
  '$@trade1': 'tradingexperience',
  '$@income1': 'income',
  '$@nominee1': 'nominee',
  '$@bank1': 'bank1',
  '$@bank4': 'bank4',
  '$@segments1': 'segment1',
  '$@brokerage1': 'brokerage',
  '$@uploadproof1': 'uploadproof',
  '$@uploadincome1': 'uploadincome',
  '$@uploadbank1': 'uploadbank',
  '$@photosign1': 'photosign1',
  '$@takephoto1': 'takephoto',
  '$@photoproceed1': 'photoproceed',
  '$@signdraw1': 'signdraw',
 
  '$@esign1': 'esign',
  '$@bankfile1': 'bankfile',
  '$@thankyou1': 'thankyou',
}


const handleUpdateDiv = (value, newData = {}) => {
  currentForm.value = value
  data.value = newData
}

// ⚡️ Watch the form query param
watch(() => route.query.form, (newForm) => {
  if (newForm && formMap[newForm]) {
    currentForm.value = formMap[newForm]
    data.value = {}
  }
})

onMounted(async () => {
  const token = localStorage.getItem('userkey');
  
  // 🔴 No token? Redirect to "/"
  if (!token) {
    authenticated.value = false;
    router.push('/');
    return;
  }

  authenticated.value = true; // 🟢 Mark user as authenticated

  const queryForm = route.query.form;

  try {
    // First get the server data
    const mydata = await getServerData();
    
    // Check if the server returned an error
    if (mydata.payload && mydata.payload.status === 'error') {
      localStorage.removeItem('userkey');
      router.push('/');
      return;
    }

    // 🟢 If query param exists and is valid, show that form
    if (queryForm && formMap[queryForm]) {
      currentForm.value = formMap[queryForm];
      data.value = {};
      return;
    }

    // 🔵 Otherwise, load server data to get default page
    const activePage = mydata?.payload?.metaData?.profile?.pageStatus || 'main';
    currentForm.value = activePage;
  

    // Optional: clean URL
    router.replace({ path: '/main' });

  } catch (error) {
    console.error('Error fetching server data:', error);
    localStorage.removeItem('userkey');
    router.push('/');
  }
});


</script>
<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
