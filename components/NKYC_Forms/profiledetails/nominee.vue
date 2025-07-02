<template>
  <div class="primary_color">
    <!-- Top bar -->
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <!-- Main Content -->
    <div class="flex justify-between p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">

      <!-- Nominee Info -->
      <div class="w-full mt-1 px-2 ">
        <p class="text-xl text-blue-900 font-medium dark:text-gray-400">Add nominee</p>
        <p class="text-sm text-gray-500 font-normal leading-5">Relationship with nominee</p>

        <!-- Outer container (fixed height, rounded border) -->
        <div class="w-full flex flex-col justify-end gap-2 mt-1 rounded-lg h-[450px]">
          <!-- Scrollable content only inside this div -->
          <div  v-if="nomineescard" class="flex-1 overflow-y-auto ">
            <div class="w-full py-1" v-if="nomineecontainer">
            <Button @click="openNomineeDialog" class="w-full py-2 primary_color text-white" size="small">
              {{ nomineetext }}
            </Button>

           
          </div>
            <div>
              <!-- Nominee list -->
              <div class="w-full p-1 cursor-pointer mb-1 bg-blue-50 rounded-lg dark:bg-gray-600"  v-for="nomineeshare in nomine">
                <div class="w-full flex">
                  <div class="w-4/5">
                    <span class="text-blue-500 text-sm">
                      Nominee Name: {{ nomineeshare.name }}
                    </span><br>
                    <span class="text-blue-500 text-sm">
                      Relationship: {{ nomineeshare.relation }}
                    </span>
                  </div>
                  <div class="w-1/5 flex justify-center items-center">
                    <p class="text-blue-700 font-bold text-lg">{{ nomineeshare.share }} %</p>
                  </div>
                </div>
                <div class="w-full flex gap-2 mt-1">
                  <Button @click="dialogbox(nomineeshare)" type="button" class="w-full text-white"
                    size="small">Edit</Button>
                  <Button @click="nomineedelete(nomineeshare)" type="button" class="w-full text-white border-red-500 bg-red-500"
                    size="small">Delete</Button>
                </div>
              </div>
 <p class="text-red-500 text-md text-center">{{ errorpercent }}</p>
        
            </div>
          </div>

        
          
        </div>

      </div>

      <!-- Dialog Modal -->
      <Dialog class="p-0" v-model:visible="visible" modal header="Add Nominee" :style="{ width: '25rem' }">
        <input type="text" v-model="idval" class="hidden">
        <div class="w-full">
          <Name v-model="name" />
           <span class="text-red-500">{{ nameerror }}</span>

        </div>
        <div class="w-full mt-4">
          <span class="text-gray-500 ">Relationship*</span>
          <div class="input-wrapper dark:!bg-gray-800">
            <Select v-model="selectedStatement" :options="statementOptions" optionLabel="name"
              class="w-full prime-input " />
            <span class="bottom-border"></span>
          </div>
                     <span class="text-red-500">{{ relationshiperror }}</span>

        </div>
        <div class="w-full mt-2">
          <DOB v-model="dob" />
                     <span class="text-red-500">{{ doberror }}</span>

        </div>

        <div class="w-full mt-2">
          <Address v-model="address" />
                     <span class="text-red-500">{{ addresserror }}</span>

        </div>

        <div class="w-full mt-2">
          <Mobile v-model="mobileNo" />
                     <span class="text-red-500">{{ mobileerror }}</span>

        </div>

        <div class="w-full mt-2">
          <Email v-model="email" />
                     <span class="text-red-500">{{ emailerror }}</span>

        </div>
        <div class="w-full mt-2">
          <div class="flex gap-2">
            <div class="flex items-center gap-2">
                <RadioButton v-model="selected" inputId="pan" name="id" value="PAN" @change="emitSelection" />
              <label for="pan" class="text-gray-500">PAN</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton v-model="selected" inputId="aadhar" name="id" value="Aadhar Last 4 Digits" @change="emitSelection" />
              <label for="aadhar" class="text-gray-500">Aadhar</label>
            </div>
            <div class="flex items-center gap-2">
             <RadioButton v-model="selected" inputId="dl" name="id" value="Driving Licence" @change="emitSelection" />
              <label for="dl" class="text-gray-500">Driving Licence</label>
            </div>
          </div>

        



          <span class="block text-gray-500 text-md font-normal mt-2">{{ prooftype }}</span>

          <div v-if="pan" class="w-full " >
              <Pan v-model="paninput" />
                        <span class="text-red-500" v-if="panerror">{{ error }}</span>

          </div>
          <div v-if="aadhar" class="w-full " >
              <Aadhar v-model="aadharinput" />
                         

          </div>
          <div v-if="drivingLicence" class="w-full " >
              <Driving v-model="drivinginput" />
                        

          </div>

         <span class="text-red-500">{{ iderror }}</span>
        </div>


        <div class="w-full mt-2">
          <div :class="{ 'disabled-container': isDisabled }">
            <Guardian v-model="guardian" />
             <span class="text-red-500">{{ guardianerror }}</span>
          </div>

        </div>
        <div class="w-full mt-2">
          <Sharevalue v-model="shareval" />
                    <span class="text-red-500">{{ sharevalerror }}</span>

          <p class="text-right text-gray-500 text-md">Maximum limit:0 - {{ availabilelimit }}</p>
        </div>
        <div class="w-full mt-3">
          <Button :disabled="isSaveDisabled" label="Save" @click="nomineesavedata"
            class="primary_color w-full text-white py-2" />

        </div>
      </Dialog>

      <!-- Navigation Buttons -->
      <div class="w-full flex gap-2 mt-4">
        <Button @click="back" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button ref="rippleBtn" @click="handleButtonClick"
          :disabled="!canContinue || !isStatusValid"
          class="primary_color w-5/6 text-white py-3 text-xl border-0">
          {{ buttonText }}
        </Button>

      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';

import Name from '~/components/nomineeinputs/nameinput.vue';
import DOB from '~/components/nomineeinputs/dateinput.vue';
import Address from '~/components/nomineeinputs/address.vue';
import Mobile from '~/components/nomineeinputs/mobileinput.vue';
import Email from '~/components/nomineeinputs/emailinput.vue';
import Pan from '~/components/nomineeinputs/paninputn.vue';
import Aadhar from '~/components/nomineeinputs/aadharn.vue';
import Driving from '~/components/nomineeinputs/drivinglicencen.vue';

import RadioButton from 'primevue/radiobutton'

import Guardian from '~/components/nomineeinputs/guardian.vue';

import Sharevalue from '~/components/nomineeinputs/sharevalue.vue';
import { pagestatus } from '~/utils/pagestatus.js'

import { useRouter } from 'vue-router';
const router = useRouter();
const { baseurl } = globalurl();
const {htoken}=headerToken()
const emit = defineEmits(['updateDiv']);
const isDisabled = ref(true)
const nomineecontainer = ref(true)
const idval = ref('')

const shareval = ref('');

const visible = ref(false);
const deviceHeight = ref(0);
const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const buttonText = ref("Next");
const nomineetext = ref("Add Nominee");
const nomineeCount = ref(0);

const panerror = ref(false)
const error = ref('')

const sharevalue = ref('0')
const canContinue = ref(false)

const isBack = ref(true)

const selectedStatement = ref('')

const isStatusValid = ref(true);

const pan=ref(true)
const aadhar=ref(false)
const drivingLicence=ref(false)

const paninput = ref('')
const aadharinput = ref('')
const drivinginput = ref('')

const isPanValid = ref(false);
const isAadharValid = ref(false);
const isDrivingLicenceValid = ref(false);

// error
const nameerror=ref('')
const relationshiperror=ref('')
const doberror=ref('')
const addresserror=ref('')
const mobileerror=ref('')
const emailerror=ref('')
const sharevalerror=ref('')
const iderror=ref('')
const errorpercent=ref('')
const guardianerror = ref('')
const statementOptions = ref([
  { value: 'Son', name: 'Son' },
  { value: 'Daughter', name: 'Daughter' },
  { value: 'Spouse', name: 'Spouse' },
  { value: 'Father', name: 'Father' },
  { value: 'Mother', name: 'Mother' },
  { value: 'Brother', name: 'Brother' },
    { value: 'Sister', name: 'Sister' },
      { value: 'Grand-Son', name: 'Grand-Son' },
       { value: 'Grand-Daughter', name: 'Grand-Daughter' },
{ value: 'Grand-Father', name: 'Grand-Father' },
{ value: 'Grand-Mother', name: 'Grand-Mother' },
])

const name = ref('');
const dob = ref('');
const address = ref('');
const mobileNo = ref('')
const email = ref('')

const nomine = ref([]);

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
});




// Confirmation data
const nomineescard = ref(false);


const selected = ref('PAN')
const prooftype = ref('PAN')


const guardian = ref('')

const resetFormFields = () => {
  idval.value = '';
  name.value = '';
  selectedStatement.value = '';
  dob.value = '';
  address.value = '';
  mobileNo.value = '';
  email.value = '';
  selected.value = 'PAN';

  guardian.value = '';
  shareval.value = '';
  prooftype.value = 'PAN';
  paninput.value=''
  aadharinput.value=''
  drivinginput.value=''
};

const openNomineeDialog = async() => {
    errorpercent.value=''
 const mydata = await getServerData();

  if (mydata.payload.status == 'error') {
        if (mydata.payload.code == '1002' || mydata.payload.code=='1004'){
             alert(mydata.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }

  resetFormFields();
  visible.value = true;
};

  
const nomineedetails = async () => {
  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.nominee ;

  if (statuscheck) {
    const nominee = mydata?.payload?.metaData?.nominee;
    if (nominee) {

      nomineescard.value = true;

      

      const nomineeList = [];
      let totalShare = 0;

      for (let i = 1; i <= 10; i++) {
        const name = nominee[`nominee${i}Name`];
        if (name && name.trim() !== '') {
          const share = parseFloat(nominee[`nominee${i}Share`] || 0);
          totalShare += share;

          nomineeList.push({
            name,
            id: i,
            relation: nominee[`nominee${i}Relation`],
            address: nominee[`nominee${i}Address`],
            share,
            email: nominee[`nominee${i}Email`],
            mobile: nominee[`nominee${i}Mobile`],

            dob: nominee[`nominee${i}Dob`],
            idType: nominee[`nominee${i}IdType`],
            idNo: nominee[`nominee${i}IdNo`],
            guardian: nominee[`nominee${i}GuardianName`],
          });
        }
      }

      const nomineeid = mydata?.payload?.metaData?.nominee?.IncapacitationNominee;
      sharevalue.value = nominee[`nominee${nomineeid}Share`] || 0;

  
       let sharepercentage = 0
     
      nomineeList.forEach(item => {
        sharepercentage += item.share
      })

      if (sharepercentage == 100) {
  
        canContinue.value = true;
      }
      else {
        canContinue.value = false;
      }


      nomine.value = nomineeList;
      nomineeCount.value = nomineeList.length;
      nomineecontainer.value = totalShare < 100;
    }
  }
 };


await nomineedetails()

const availabilelimit = computed(() => {
  let total = 0;
  nomine.value.forEach(n => {
    // Exclude the current nominee when editing
    if (n.id !== idval.value) {
      total += parseFloat(n.share);
    }
  });
  return Math.max(100 - total, 0); // Prevent going below 0
});

watch(paninput, (newVal) => {
  if (newVal.length === 10) {
    const pattern = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
    isPanValid.value = pattern.test(newVal);
    panerror.value = !isPanValid.value;
    error.value = isPanValid.value ? '' : 'Please enter a valid PAN no';
  } else {
    isPanValid.value = false;
    panerror.value = false;
  }
});


watch(aadharinput, (newVal) => {
  isAadharValid.value = newVal.length === 4 && /^\d+$/.test(newVal);
});


watch(drivinginput, (newVal) => {
  
  isDrivingLicenceValid.value = newVal.length >= 16; // Example minimum length
});


const isSaveDisabled = computed(() => {
  const share = parseFloat(shareval.value) || 0;
  
 
  let isIdValid = false;
  if (selected.value === 'PAN') {
    isIdValid = isPanValid.value;
  } else if (selected.value === 'Aadhar Last 4 Digits') {
    isIdValid = isAadharValid.value;
  } else if (selected.value === 'Driving Licence') {
    isIdValid = isDrivingLicenceValid.value;
  }

  // Check if guardian is required (based on age)
  const requiresGuardian = !isDisabled.value; // isDisabled is false when under 18
  const guardianValid = !requiresGuardian || (requiresGuardian && guardian.value.trim() !== '');

  return (
    !selectedStatement.value ||
    !dob.value ||
    !selected.value ||
    !shareval.value ||
    !address.value ||
    mobileNo.value.length !== 10 ||
    !isValidEmail.value ||
    share > availabilelimit.value ||
    !isIdValid ||
    !guardianValid // Add guardian validation
  );
});
const dialogbox = (editdata) => {
  let formattedDOB = '';
  let dobDate = null;

  if (editdata.dob) {
    
    const isoDateMatch = editdata.dob.match(/^(\d{4})-(\d{2})-(\d{2})/);
    
    // Try DD/MM/YYYY format
    const slashDateMatch = editdata.dob.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    
    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      formattedDOB = `${day}/${month}/${year}`;
      dobDate = new Date(year, month - 1, day);
    } 
    else if (slashDateMatch) {
      const [, day, month, year] = slashDateMatch;
      formattedDOB = editdata.dob;
      dobDate = new Date(year, month - 1, day);
    }
    else {
      // Fallback - try to parse as Date object
      dobDate = new Date(editdata.dob);
      if (!isNaN(dobDate.getTime())) {
        const day = String(dobDate.getDate()).padStart(2, '0');
        const month = String(dobDate.getMonth() + 1).padStart(2, '0');
        const year = dobDate.getFullYear();
        formattedDOB = `${day}/${month}/${year}`;
      }
    }
  }

  // Calculate age if we have a valid date
  if (dobDate && !isNaN(dobDate.getTime())) {
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    // Enable guardian field only if under 18
    isDisabled.value = age >= 18;
    
    // Set guardian error only if under 18 and guardian is empty
     if (age >= 18) {
      guardian.value = '';
      guardianerror.value = '';
    } else if (!editdata.guardian) {
      guardianerror.value = 'Guardian is required for nominees under 18';
    }
  } 

  // Set form values
  visible.value = true;
  idval.value = editdata.id;
  name.value = editdata.name;

  selectedStatement.value = statementOptions.value.find(
    option => option.value === editdata.relation || option.name === editdata.relation
  ) || statementOptions.value[0];

  dob.value = formattedDOB;
  address.value = editdata.address;
  mobileNo.value = editdata.mobile;
  email.value = editdata.email;
  selected.value = editdata.idType;

  if(selected.value === 'PAN') {
    pan.value = true;
    aadhar.value = false;
    drivingLicence.value = false;
    paninput.value = editdata.idNo;
    isAadharValid.value = false;
    isDrivingLicenceValid.value = false;
  }
  else if(selected.value === 'Aadhar Last 4 Digits') {
    pan.value = false;
    aadhar.value = true;
    drivingLicence.value = false;
    aadharinput.value = editdata.idNo;
    isPanValid.value = false;
    isDrivingLicenceValid.value = false;
  }
  else if(selected.value === 'Driving Licence') {
    pan.value = false;
    aadhar.value = false;
    drivingLicence.value = true;
    drivinginput.value = editdata.idNo;
    isPanValid.value = false;
    isAadharValid.value = false;
  }

  guardian.value = editdata.guardian;
  shareval.value = editdata.share;
  prooftype.value = editdata.idType;
};
const nomineesavedata = async () => {
  visible.value = true;

  // Validate maximum nominees
  if (!idval.value && nomineeCount.value >= 10) {
   
    visible.value = false;
    return;
  }

  try {
    // Validate required fields
    if (!name.value || !selectedStatement.value || !dob.value || !address.value || 
        !mobileNo.value || !email.value || !selected.value || !shareval.value) {
      
    }

    // Parse date
    let formattedDate = '';
    const dateMatch = dob.value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    
    if (dateMatch) {
      // DD/MM/YYYY format
      const [, day, month, year] = dateMatch;
      formattedDate = `${year}-${month}-${day}`;
      
      // Validate date
      const dateObj = new Date(`${year}-${month}-${day}`);
      if (isNaN(dateObj.getTime())) {
       
      }
    } else {
      // Try parsing as Date object
      const dateObj = new Date(dob.value);
      if (isNaN(dateObj.getTime())) {
        
      }
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      formattedDate = `${yyyy}-${mm}-${dd}`;
    }

    // Validate share percentage
    const share = parseFloat(shareval.value);
    if (isNaN(share)) {
     
    }

    // Prepare request data
    const nomineeId = idval.value ? idval.value : nomineeCount.value + 1;
    const relationship = selectedStatement.value.name || selectedStatement.value.value;
    
    // Get ID number based on selected type
    let idNumber = '';
    if (selected.value === 'PAN') {
      if (!paninput.value || !isPanValid.value) {
       
      }
      idNumber = paninput.value;
    } else if (selected.value === 'Aadhar Last 4 Digits') {
      if (!aadharinput.value || !isAadharValid.value) {
        
      }
      idNumber = aadharinput.value;
    } else if (selected.value === 'Driving Licence') {
      if (!drivinginput.value || !isDrivingLicenceValid.value) {
        
      }
      idNumber = drivinginput.value;
    }

    const user =await encryptionrequestdata({
      userToken: localStorage.getItem('userkey'),
      pageCode: "nominee",
      nomineeName: name.value,
      nomineeRelation: relationship,
      nomineeAddress: address.value,
      nomineeMobile: mobileNo.value,
      nomineeEmail: email.value,
      nomineeIdType: selected.value,
      nomineeIdNo: idNumber,
      nomineeDob: formattedDate,
      nomineeGuardianName: guardian.value,
      nomineeShare: share,
      nomineeId: nomineeId,
    });
 const headertoken=htoken
    const payload = { payload: user };
    const apiurl = `${baseurl.value}nominee`;

    const response = await fetch(apiurl, {
      method: 'POST',
      headers: {
        'Authorization': headertoken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Network request failed with status ${response.status}`);
    }

    const decryptedData = await response.json();
     const data = await decryptionresponse(decryptedData);
       nameerror.value = ""
        relationshiperror.value = ""
        doberror.value = ""
        addresserror.value = ""
        mobileerror.value=""
        emailerror.value=""
        iderror.value=""
        guardianerror.value=""
        sharevalerror.value=""
        
    if (data.payload.status === 'ok') {
      visible.value = false;
      await nomineedetails();
      resetFormFields();
    } 

       

    else if (data.payload.status === 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004') {
       alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
      } 
      else if(data.payload.status=='error' && data.payload.errors.length>0) {
       
        data.payload.errors.forEach((err) => {


          if (err.field === 'nomineeName') {
            nameerror.value = err.message || ' ';
          }
          if (err.field === 'nomineeRelation') {
            relationshiperror.value = err.message || ' ';
          }
            if (err.field === 'nomineeDob') {
            doberror.value = err.message || ' ';
          }
          if (err.field === 'nomineeAddress') {
            addresserror.value = err.message || ' ';
          }
          if (err.field === 'nomineeMobile') {
            mobileerror.value = err.message || ' ';
          }
            if (err.field === 'nomineeEmail') {
            emailerror.value = err.message || ' ';
          }
            if (err.field === 'nomineeIdNo') {
            iderror.value = err.message || ' ';
          }
           if (err.field === 'nomineeGuardianName') {
            guardianerror.value = err.message || ' ';
          }
           if (err.field === 'nomineeShare') {
            sharevalerror.value = err.message || ' ';
          }
        });
      }
    }

  } catch (error) {
    console.error("Error saving nominee:", error.message);
    alert(error.message || "An error occurred while saving nominee");
    visible.value = false;
  }
};

const nomineedelete = async (deleteid) => {




  const user =await encryptionrequestdata({
    userToken: localStorage.getItem('userkey'),
    pageCode: "nominee",
    removeNominee: deleteid.id

  });
const headertoken=htoken
  const payload = { payload: user };
  const jsonString = JSON.stringify(payload);
  const apiurl = `${baseurl.value}nominee`;

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
      throw new Error(`Network request failed with status ${response.status}`);
    }

    const decryptedData = await response.json();
      const data = await decryptionresponse(decryptedData);
       if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }

    nomineedetails(); // Refresh the nominee list or details
  } catch (error) {
    console.error("Error saving nominee:", error.message);
    visible.value = false;
  }
};


const emitSelection = () => {
  prooftype.value = selected.value;

  paninput.value=''
  aadharinput.value=''
  drivinginput.value=''
  
  if(selected.value === 'PAN') {
    pan.value = true;
    aadhar.value = false;
    drivingLicence.value = false;

    isAadharValid.value = false;
    isDrivingLicenceValid.value = false;
  }
  else if(selected.value === 'Aadhar Last 4 Digits') {
    pan.value = false;
    aadhar.value = true;
    drivingLicence.value = false;
 
    isPanValid.value = false;
    isDrivingLicenceValid.value = false;
  }
  else if(selected.value === 'Driving Licence') {
    pan.value = false;
    aadhar.value = false;
    drivingLicence.value = true;
 
    isPanValid.value = false;
    isAadharValid.value = false;
  }
}

// Event Handlers
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

     const data = await pagestatus('income')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'income');
  isBack.value = false;
}

   
  },
  
  600)

};
const handleButtonClick = async (event) => {
  const button = rippleBtn.value;
  if (!button || !button.$el) return;

  // Create ripple effect
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

    try {
      const data = await getServerData();

      if (data?.payload?.status === 'ok' && data?.payload?.metaData?.nominee?.clientCode) {
        const nominee = data.payload.metaData.nominee;
        let totalShare = 0;

        for (let i = 1; i <= 10; i++) {
          const share = parseFloat(nominee[`nominee${i}Share`] || 0);
          totalShare += share;
        }

        console.log("Total nominee share:", totalShare);

        if (totalShare === 100) {
          const myData = await pagestatus('bank1');
          if (myData?.payload?.status === 'ok') {
            emit('updateDiv', 'bank1');
          }
        } else {
          errorpercent.value = 'Nominee 100 percentage not met';
        }

      } else if (data?.payload?.status === 'error') {
        if (data.payload.code === '1002' || data.payload.code === '1004') {
          alert(data.payload.message);
          localStorage.removeItem('userkey');
          router.push('/');
        }
      }

    } catch (err) {
      console.error('Error during server interaction:', err);
    } finally {
      isStatusValid.value = false;
    }

  }, 600);
};

// Lifecycle
onMounted(async () => {

  deviceHeight.value = window.innerHeight;
  window.addEventListener('resize', () => {
    deviceHeight.value = window.innerHeight;
  });
});


watch(dob, (newval) => {
 
  if (newval) {
    const dobval = new Date(newval);
    const today = new Date();
    let age = today.getFullYear() - dobval.getFullYear();
    const month = today.getMonth() - dobval.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < dobval.getDate())) {
      age--;
    }

    if (age < 18) {
    
      isDisabled.value = false;
      // When under 18, guardian becomes required
      if (!guardian.value) {
        guardianerror.value = '';
      }
    } else {
      
       guardian.value=''
      isDisabled.value = true;
      guardianerror.value = '';
    }
  }
});



</script>


<style scoped>
.disabled-container {
  pointer-events: none;
  opacity: 0.5;
}

.p-dialog-header {
  padding: 1% !important;
}

.uppercase {
  text-transform: uppercase;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #e0e0e0;
  border-radius: 10px;
  padding: 0 8px;
  overflow: hidden;
}

.country-code {
  font-size: 16px;
  color: #333;
  padding-right: 8px;
  white-space: nowrap;
  user-select: none;
}

.prime-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  flex: 1;
  padding: 8px 0;
  z-index: 1;
  box-shadow: none !important;
}

.prime-input::placeholder {
  color: #87909b;
}

.bottom-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 3px;
  width: 0;
  background-color: #007bff;
  border-radius: 10px;
  transition: width 0.4s ease-out, height 0.3s ease-in;
  z-index: 0;
}

.input-wrapper:focus-within .bottom-border {
  width: 100%;
  height: 4px;
}
</style>