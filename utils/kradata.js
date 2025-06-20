let data = {};

export function kradatares(newData) {
  data = {
    ...data,
    ...newData
  };
  return data;
}

export function getEncryptionData() {
  return data;
}
