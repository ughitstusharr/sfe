// Encryption and decryption utilities using Web Cryptography API

/**
 * Derives a key from a password using PBKDF2
 * @param password - The password to derive the key from
 * @param salt - The salt to use for key derivation
 * @returns CryptoKey object
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // Convert password to key material
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Import the password as a key
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  // Derive a key using PBKDF2
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a file with a password
 * @param file - The file to encrypt
 * @param password - The password to encrypt with
 * @returns Object containing encrypted data and metadata
 */
export async function encryptFile(file: File, password: string): Promise<{
  encryptedData: ArrayBuffer;
  salt: Uint8Array;
  iv: Uint8Array;
  originalFileName: string;
  originalSize: number;
}> {
  try {
    // Generate a random salt and initialization vector
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    // Read file as ArrayBuffer
    const fileData = await readFileAsArrayBuffer(file);
    
    // Encrypt the file data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      fileData
    );
    
    return {
      encryptedData,
      salt,
      iv,
      originalFileName: file.name,
      originalSize: file.size
    };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt file: " + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Decrypts an encrypted file with a password
 * @param encryptedFile - The encrypted file blob
 * @param password - The password to decrypt with
 * @returns Object containing decrypted data and original filename
 */
export async function decryptFile(encryptedFile: File, password: string): Promise<{
  decryptedData: ArrayBuffer;
  originalFileName: string;
}> {
  try {
    // Read the encrypted file
    const encryptedData = await readFileAsArrayBuffer(encryptedFile);
    
    // Extract metadata from the encrypted file
    // First 16 bytes: salt
    // Next 12 bytes: IV
    // Next 4 bytes: filename length (uint32)
    // Next N bytes: filename (UTF-8 encoded)
    // Remaining bytes: encrypted content
    
    const salt = new Uint8Array(encryptedData.slice(0, 16));
    const iv = new Uint8Array(encryptedData.slice(16, 28));
    
    const fileNameLengthView = new DataView(encryptedData.slice(28, 32));
    const fileNameLength = fileNameLengthView.getUint32(0);
    
    const fileNameBytes = new Uint8Array(encryptedData.slice(32, 32 + fileNameLength));
    const decoder = new TextDecoder();
    const originalFileName = decoder.decode(fileNameBytes);
    
    const encryptedContent = encryptedData.slice(32 + fileNameLength);
    
    // Derive the key from the password
    const key = await deriveKey(password, salt);
    
    // Decrypt the data
    try {
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv
        },
        key,
        encryptedContent
      );
      
      return {
        decryptedData,
        originalFileName
      };
    } catch (decryptError) {
      throw new Error("Invalid password or corrupted file");
    }
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Prepares an encrypted file by combining the encrypted data with metadata
 * @param encryptedData - The encrypted file data
 * @param salt - The salt used for encryption
 * @param iv - The initialization vector used for encryption
 * @param originalFileName - The name of the original file
 * @returns Blob containing the encrypted file with metadata
 */
export function prepareEncryptedFile(
  encryptedData: ArrayBuffer,
  salt: Uint8Array,
  iv: Uint8Array,
  originalFileName: string
): Blob {
  // Store filename as UTF-8 bytes
  const encoder = new TextEncoder();
  const fileNameBytes = encoder.encode(originalFileName);
  
  // Create a buffer to store the filename length (4 bytes)
  const fileNameLengthBuffer = new ArrayBuffer(4);
  const fileNameLengthView = new DataView(fileNameLengthBuffer);
  fileNameLengthView.setUint32(0, fileNameBytes.length);
  
  // Combine all parts into a single ArrayBuffer
  const combinedBuffer = new Uint8Array(
    salt.length + iv.length + fileNameLengthBuffer.byteLength + fileNameBytes.length + encryptedData.byteLength
  );
  
  let offset = 0;
  combinedBuffer.set(salt, offset);
  offset += salt.length;
  
  combinedBuffer.set(iv, offset);
  offset += iv.length;
  
  combinedBuffer.set(new Uint8Array(fileNameLengthBuffer), offset);
  offset += fileNameLengthBuffer.byteLength;
  
  combinedBuffer.set(fileNameBytes, offset);
  offset += fileNameBytes.length;
  
  combinedBuffer.set(new Uint8Array(encryptedData), offset);
  
  return new Blob([combinedBuffer], { type: "application/octet-stream" });
}

/**
 * Helper function to read a file as ArrayBuffer
 * @param file - The file to read
 * @returns Promise that resolves with the file data as ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Creates a downloadable blob URL for a file
 * @param data - The file data
 * @param fileName - The name to give the file
 * @returns Object with download URL and file name
 */
export function createDownloadLink(data: ArrayBuffer | Blob, fileName: string): {
  url: string;
  fileName: string;
} {
  const blob = data instanceof Blob ? data : new Blob([data]);
  const url = URL.createObjectURL(blob);
  return { url, fileName };
}
