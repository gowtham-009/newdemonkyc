<template>
    <div class="primary_color">
        <div class="flex justify-between primary_color items-center px-3"
            :style="{ height: deviceHeight * 0.08 + 'px' }">
            <logo style="width: 40px; height: 40px;" />
            <profile />
        </div>
        <!--  -->
        <div v-if="content" class="flex justify-between  p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
            :style="{ height: deviceHeight * 0.92 + 'px' }">
            <div class="w-full mt-2 px-2">
                <p class="text-xl text-blue-900 font-medium dark:text-gray-400">
                    Complete your e-KYC
                </p>
                <p class="text-gray-500 leading-5 mt-3 font-normal text-sm">
                    Make sure your mobile number is linked to your Aadhaar card.
                </p>

                <li class="list-none mt-2"><a href="" class="text-blue-900 font-normal text-sm underline">How to link
                        Aadhaar with mobile?</a></li>


                <div class="w-full mt-3 px-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-900">


                    <div class="w-full flex items-center gap-3 p-1 mt-2">
                        <div
                            class="p-2 px-2 flex justify-center items-center static w-10 h-10 bg-gray-200 rounded-md flex-shrink-0 dark:bg-gray-800">
                            <i class="pi pi-file-arrow-up text-xl text-blue-600"></i>
                        </div>
                        <div class="p-2">
                            <p class="font-normal leading-5 text-sm text-gray-500">
                                You will be redirected to Digilocker for e-KYC.
                            </p>
                        </div>
                    </div>

                    <div class="w-full flex items-center gap-3 p-1 mt-2">
                        <div
                            class="p-2 px-2 flex justify-center items-center static w-10 h-10 bg-gray-200 rounded-md flex-shrink-0 dark:bg-gray-800">
                            <i class="pi pi-users text-xl text-blue-600"></i>
                        </div>
                        <div class="p-2">
                            <p class="font-normal leading-5 text-sm text-gray-500">
                                It is a Govt of India initiative with more than 176.75 million trusted users.
                            </p>
                        </div>
                    </div>

                    <div class="w-full flex items-center gap-3 p-1 mt-2">
                        <div
                            class="p-2 px-2 flex justify-center items-center static w-10 h-10 bg-gray-200 rounded-md flex-shrink-0 dark:bg-gray-800">
                            <i class="pi pi-id-card text-xl text-blue-600"></i>
                        </div>
                        <div class="p-2">
                            <p class="font-normal leading-5 text-sm text-gray-500">
                                You won't need to enter your details manually as the required documents will be fetched
                                from Digilocker.
                            </p>
                        </div>
                    </div>
                </div>


            </div>

            <div class="w-full flex gap-2">
                <Button @click="back()" ref="rippleBtnback" :disabled="!isBack"
                    class="primary_color cursor-pointer border-0 text-white w-1/6 dark:bg-slate-900">
                    <i class="pi pi-angle-left text-3xl dark:text-white"></i>
                </Button>
                <Button type="button" ref="rippleBtn" @click="handleButtonClick" :disabled="!isFormdisabled"
                    class=" primary_color text-white w-5/6 py-3 text-xl border-0  ">
                    {{ buttonText }}

                </Button>
            </div>


        </div>

        <div v-if="loading" class="flex justify-center items-center  p-2 flex-col bg-white rounded-t-3xl dark:bg-black"
            :style="{ height: deviceHeight * 0.92 + 'px' }">
            <ProgressSpinner />

        </div>



    </div>


</template>
<script setup>


import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
const router = useRouter();

const route = useRoute()
const { baseurl } = globalurl();
const {htoken}=headerToken()
const deviceHeight = ref(0);
const rippleBtn = ref(null);
const rippleBtnback = ref(null)
const buttonText = ref("Start e-KYC");
const content = ref(true)
const loading = ref(false)
const isFormdisabled = ref(true)
const isBack = ref(true);
onMounted(() => {
    deviceHeight.value = window.innerHeight;
    window.addEventListener('resize', () => {
        deviceHeight.value = window.innerHeight;
    });
    if (route.query.requestId) {
        digilocker_request()
        content.value = false
        loading.value = true
    }
});


const emit = defineEmits(['updateDiv']);
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
       
 const data = await pagestatus('main')
    if (data.payload.status == 'error') {
      if (data.payload.code == '1002' || data.payload.code=='1004'){
    alert(data.payload.message);
    localStorage.removeItem('userkey')
    router.push('/')
  }
}
 else if (data.payload.status == 'ok') {
  emit('updateDiv', 'main');
  isBack.value = false;
}
    }, 600)

}


const digilocker_create = async () => {
    const apiurl = baseurl.value + 'digilocker';
     const headertoken=htoken
    const authorization = headertoken;
    const user =await encryptionrequestdata({
        userToken: localStorage.getItem('userkey'),
        digilockerAction: "createUrl",
        redirecUrl: "https://nkcynewone.vercel.app/main"
    });

    const payload = { payload: user };
    const jsonString = JSON.stringify(payload);

    try {
        const response = await fetch(apiurl, {
            method: 'POST',
            headers: {
                'Authorization': authorization,
            },
            body: jsonString
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const decryptedData = await response.json();
        const data = await decryptionresponse(decryptedData);
        if (data.payload.status == 'ok') {

            const url = data.payload.metaData.url
            window.location.href = url;
        }
        else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }
    } catch (error) {
        console.error('Error:', error.message);

    }

    finally {
        content.value = true
        loading.value = false
    }

};


const digilocker_request = async () => {
    const apiurl = baseurl.value + 'digilocker';
 const headertoken=htoken
    const authorization = headertoken;
        const user =await encryptionrequestdata({
        userToken: localStorage.getItem('userkey'),
        digilockerAction: "getDetails",
        digilockerReqId: route.query.requestId
    });

    const payload = { payload: user };
    const jsonString = JSON.stringify(payload);

    try {
        const response = await fetch(apiurl, {
            method: 'POST',
            headers: {
                'Authorization': authorization,
            },
            body: jsonString
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

           const decryptedData = await response.json();
        const data = await decryptionresponse(decryptedData);
        if (data.payload.status == 'ok') {
            digilocker_getfiles(data)

        }
        else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }

        else {
            content.value = true
            loading.value = false
        }



    } catch (error) {
        console.error('Error:', error.message);
    }
    finally {

    }
};


const digilocker_getfiles = async (requestid) => {
    const apiurl = baseurl.value + 'digilocker';
 const headertoken=htoken
    const authorization = headertoken;
        const files = requestid.payload.metaData.fileIds;




    const user =await encryptionrequestdata({
        userToken: localStorage.getItem('userkey'),
        digilockerAction: "getFiles",
        digilockerReqId: requestid.payload.metaData.requestId,
        filesIds: files
    });

    const payload = { payload: user };
    const jsonString = JSON.stringify(payload);

    try {
        const response = await fetch(apiurl, {
            method: 'POST',
            headers: {
                'Authorization': authorization,
            },
            body: jsonString
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

       
             const decryptedData = await response.json();
        const data = await decryptionresponse(decryptedData);
        if (data.payload.status == 'ok') {

            digilocker_getaadhardoc(requestid.payload.metaData.requestId)
        }
        else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }

    } catch (error) {
        console.error('Error:', error.message);
    }
    finally {

    }
};



const digilocker_getaadhardoc = async (requestid) => {

    const apiurl = baseurl.value + 'digilocker';
 const headertoken=htoken
    const authorization = headertoken;

    const user =await encryptionrequestdata({
        userToken: localStorage.getItem('userkey'),
        digilockerAction: "createAadhaar",
        digilockerReqId: requestid,

    });

    const payload = { payload: user };
    const jsonString = JSON.stringify(payload);

    try {
        const response = await fetch(apiurl, {
            method: 'POST',
            headers: {
                'Authorization': authorization,
            },
            body: jsonString
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

            const decryptedData = await response.json();
        const data = await decryptionresponse(decryptedData);
        if (data.payload.status == 'ok') {

            pagestatus('parmanentaddress')
            emit('updateDiv', 'parmanentaddress');
        }
        else if (data.payload.status == 'error') {
        if (data.payload.code == '1002' || data.payload.code=='1004'){
             alert(data.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }

       


    } catch (error) {
        console.error('Error:', error.message);
    }
    finally {

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

    setTimeout(async() => {
        circle.remove()
        const mydata = await getServerData();
        if(mydata.payload.status=='ok'){
            digilocker_create()
        isFormdisabled.value = false
        }
      else if (mydata.payload.status == 'error') {
        if (mydata.payload.code == '1002' || mydata.payload.code=='1004'){
             alert(mydata.payload.message);
              localStorage.removeItem('userkey')
              router.push('/')
        }
       
      }
      
       
    }, 600)
};








</script>
