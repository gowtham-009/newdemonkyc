let data = {}; 

export function encryptionrequestdata(newData) {
  const mergedData = {
    ...data,
    ...newData
  };
  return mergedData;
}



