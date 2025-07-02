let data = {};

function hexToBytes(hex) {
  if (typeof hex !== 'string') {
    throw new Error('hexToBytes: Input must be a string');
  }
  if (!hex.match(/^[0-9a-fA-F]+$/)) {
    throw new Error('hexToBytes: Input must be a valid hexadecimal string');
  }
  if (hex.length % 2 !== 0) {
    throw new Error('hexToBytes: Hex string must have an even length');
  }
  return Uint8Array.from(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

const encKeyHex = "71EDFC7A15740605432CA4D6488367E264AC73A426C76A1C1AB0A87673BB5BF1";

export async function encryptionrequestdata(newData) {
 
  const mergedData = {
    ...data,
    ...newData
  };



  const jsonData = JSON.stringify(mergedData);
  const encoded = new TextEncoder().encode(jsonData);
  const encKey = hexToBytes(encKeyHex);
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const aesKey = await crypto.subtle.importKey(
    'raw',
    encKey,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    aesKey,
    encoded
  );

  const hmacKey = await crypto.subtle.importKey(
    'raw',
    encKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const hmacBuffer = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    new Uint8Array([...iv, ...new Uint8Array(cipherBuffer)])
  );

  const finalBuffer = new Uint8Array([
    ...iv,
    ...new Uint8Array(cipherBuffer),
    ...new Uint8Array(hmacBuffer)
  ]);

  return bytesToHex(finalBuffer);
}

export async function decryptionresponse(hexString) {

 
  try {
    const encKey = hexToBytes(encKeyHex);
    const fullData = hexToBytes(hexString.payload);

    // Check if data is large enough to contain IV (16) + HMAC (32) + at least 1 byte ciphertext
    if (fullData.length < 49) {
      throw new Error('Invalid data length - too short to contain valid encrypted data');
    }

    const iv = fullData.slice(0, 16);
    const hmac = fullData.slice(-32); // SHA-256 HMAC is 32 bytes
    const cipherBytes = fullData.slice(16, -32);

    // Validate HMAC
    const hmacKey = await crypto.subtle.importKey(
      'raw',
      encKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      hmacKey,
      hmac,
      new Uint8Array([...iv, ...cipherBytes])
    );

    if (!isValid) {
      throw new Error('HMAC verification failed – data may be tampered with!');
    }

    // Decrypt AES-CBC
    const aesKey = await crypto.subtle.importKey(
      'raw',
      encKey,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      aesKey,
      cipherBytes
    );

    const decoded = new TextDecoder().decode(plainBuffer);
  
    const responseData = JSON.parse(decoded);
    return{ payload: responseData}
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}