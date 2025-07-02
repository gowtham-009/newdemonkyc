import { encryptionrequestdata } from '~/utils/globaldata.js';

export async function pagestatus(pagecode) {
  const apiUrl = "https://nnkyc.w3webtechnologies.co.in/api/v1/update_pagestatus";
  const userkey = localStorage.getItem('userkey');

  // Define profileCode mapping based on pagecode
  const profileCodeMap = {
   mobile:3,
   email:6,
   main:9,
   ekyc:12,
  parmanentaddress:15,
  communicationaddress:18,
  info:21,
  clientinfo:24,
  qualification:27,
   tradingexperience:30,
  occupation:33,
  
   income:36,
  nominee:39,
   bank1:42,
 bank4:45,
   segment1:48,
  brokerage:50,
  uploadproof:55,
  uploadincome:60,
   uploadbank:65,
  photosign1:70,
  takephoto:75,
   photoproceed:80,
  signdraw:85,
  
  esign:90,
  bankfile:95,
   thankyou:100,
  };

  const profilecode = profileCodeMap[pagecode] || 0; // fallback to 0 if not matched

  const encryptedUser = await encryptionrequestdata({
    userToken: userkey,
    pageCode: pagecode,
    profileCode: profilecode
  });

  const payload = { payload: encryptedUser };
  const jsonString = JSON.stringify(payload);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'C58EC6E7053B95AEF7428D9C7A5DB2D892EBE2D746F81C0452F66C8920CDB3B1',
      },
      body: jsonString,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
     const decryptedData = await decryptionresponse(data);
    return decryptedData;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
