<template>
  <div class="primary_color">
    <div class="flex justify-between primary_color items-center px-3" :style="{ height: deviceHeight * 0.08 + 'px' }">
      <logo style="width: 40px; height: 40px;" />
      <profile />
    </div>

    <div class="flex justify-between p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
      :style="{ height: deviceHeight * 0.92 + 'px' }">
      <div class="w-full mt-1 px-2 ">
        <div class="w-full flex">
          <div class="w-full flex justify-center">
            <img src="https://cdn-icons-png.flaticon.com/128/2830/2830289.png" class="w-20 h-20" alt="" />
          </div>
        </div>

        <h1 class="text-center mt-3 text-lg font-medium flex items-center justify-center gap-2" :class="{
          'text-red-500': bankerror,
          'text-blue-950 dark:text-gray-400': !bankerror
        }">
          {{ successtext }}
          <span v-if="bankerror">
            <i class="pi pi-times-circle text-xl"></i>
          </span>
        </h1>
        <p class="text-sm text-center mt-1 font-normal text-gray-500">{{ verifiedtext }}</p>

        <div class="mt-1 w-full px-2 py-3 bg-gray-100 rounded-lg dark:bg-gray-900">
          <div class="w-full flex items-center gap-2">
            <div
              class="p-2 px-2 flex justify-center items-center w-10 h-10 bg-blue-200 dark:bg-slate-900 rounded-full flex-shrink-0">
              <i class="pi pi-building-columns text-blue-900 text-xl "></i>
            </div>
            <p class="text-medium text-md text-gray-500">{{ bankname }}</p>
          </div>

          <div class="w-full flex mt-2 p-1">
            <div class="w-full p-1">
              <p class="text-sm text-left text-gray-500 font-normal">Acc.No</p>
            </div>
            <div class="w-full p-1">
              <p class="text-sm text-right text-blue-900 font-medium dark:text-gray-400">{{ accno }}</p>
            </div>
          </div>

          <div class="w-full flex p-1">
            <div class="w-full p-1">
              <p class="text-sm text-left text-gray-500 font-normal">IFSC Code</p>
            </div>
            <div class="w-full p-1">
              <p class="text-sm text-right text-blue-900 font-medium dark:text-gray-400">{{ ifsccode }}</p>
            </div>
          </div>

          <div class="w-full flex p-1">
            <div class="w-full p-1">
              <p class="text-sm text-left text-gray-500 font-normal">MICR CODE</p>
            </div>
            <div class="w-full p-1">
              <p class="text-sm text-right text-blue-900 font-medium dark:text-gray-400">{{ MICR }}</p>
            </div>
          </div>

          <div class="w-full flex p-1">
            <div class="w-full p-1">
              <p class="text-sm text-left text-gray-500 font-normal">Address</p>
            </div>
            <div class="w-full p-1">
              <p class="text-sm text-right text-blue-900 font-medium dark:text-gray-400">{{ address }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full flex gap-2">
        <Button @click="back" ref="rippleBtnback" :disabled="!isBack"
          class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
          <i class="pi pi-angle-left text-3xl dark:text-white"></i>
        </Button>
        <Button @click="handleButtonClick" ref="rippleBtn" :disabled="!isStatusValid"
          class="primary_color text-white w-5/6 py-3 text-xl border-0">
          {{ buttonText }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['updateDiv']);
import { useRouter } from 'vue-router';
const router = useRouter();
const bankerror = ref(false)
const isBack = ref(true);
const bankname = ref("");
const accno = ref("");
const ifsccode = ref("");
const MICR = ref("");
const address = ref("");

const successtext = ref('')
const verifiedtext = ref('')

const buttonText = ref('Next');

const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const deviceHeight = ref(window.innerHeight);

const isStatusValid = ref(true);

const profilesetinfo = async () => {
  const mydata = await getServerData();
  const statuscheck = mydata?.payload?.metaData?.bank || '';
  if (statuscheck) {
    const holdername = mydata?.payload?.metaData?.bank?.bank1HolderName || '';
    if (holdername) {
      successtext.value = 'Bank account added'
      verifiedtext.value = 'Your bank details have been verified.'


      bankname.value = mydata?.payload?.metaData?.bank?.bank1Name || ''
      accno.value = mydata?.payload?.metaData?.bank?.bank1AccNo || ''
      ifsccode.value = mydata?.payload?.metaData?.bank?.bank1IFSC || ''
      MICR.value = mydata?.payload?.metaData?.bank?.bank1MICR || ''
      address.value = mydata?.payload?.metaData?.bank?.bank1Address || ''
    }
    else {
      successtext.value = 'Bank account failed'
      verifiedtext.value = ''
      bankerror.value = true
      bankname.value = mydata?.payload?.metaData?.bank?.bank1Name || ''
      accno.value = mydata?.payload?.metaData?.bank?.bank1AccNo || ''
      ifsccode.value = mydata?.payload?.metaData?.bank?.bank1IFSC || ''
      MICR.value = mydata?.payload?.metaData?.bank?.bank1MICR || ''
      address.value = mydata?.payload?.metaData?.bank?.bank1Address || ''
    }
  }

 

};
await profilesetinfo()




onMounted(() => {
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

    const mydata = await pagestatus('segment1')
    if (mydata.payload.status == 'ok') {
      emit('updateDiv', 'segment1');
    }
    else if (mydata.payload.status == 'error') {
        if (mydata.payload.code == '1002' || mydata.payload.code=='1004'){
             alert(mydata.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }
isStatusValid.value=false

    

  },

    600)
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
       circle.remove()

 const data = await pagestatus('bank1')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'bank1');
  isBack.value = false;
}

},
    600)

};




</script>
