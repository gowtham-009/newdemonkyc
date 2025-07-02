

import { encryptionrequestdata } from '~/utils/globaldata.js';
import { decryptionresponse } from '~/utils/globaldata.js';

export async function getServerData() {

  const apiUrl = "https://nnkyc.w3webtechnologies.co.in/api/v1/nkyc_data";

  const userkey = localStorage.getItem('userkey') 

  const encryptedUser =await encryptionrequestdata({
    userToken: userkey,
  });
console.log("Encrypted User:", encryptedUser);
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
    console.log("Decrypted Datalkihoiho:", decryptedData);

    
  
    return decryptedData
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
