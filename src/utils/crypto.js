/**
 * ========= CRYPTO HELPERS (WebCrypto, AES-GCM, PBKDF2) =========
 */

export const STORAGE_KEY = "privacyNotes_encrypted_v2"; // encrypted payload lives here
export const KDF_ITERATIONS = 150_000; // PBKDF2 iterations (security vs. speed)
export const SALT_BYTES = 16; // 128-bit salt
export const IV_BYTES = 12; // 96-bit IV for AES-GCM
export const AUTO_LOCK_MS = 5 * 60 * 1000; // 5 minutes inactivity lock

const enc = new TextEncoder();
const dec = new TextDecoder();

// tiny utils
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (str) =>
  Uint8Array.from(atob(str), (c) => c.charCodeAt(0)).buffer;
const randomBytes = (n) => crypto.getRandomValues(new Uint8Array(n));

export async function deriveKey(password, saltBytes) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: KDF_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJson(obj, password) {
  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = await deriveKey(password, salt);

  const data = enc.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  return {
    v: 2,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iter: KDF_ITERATIONS,
    salt: b64(salt),
    iv: b64(iv),
    ciphertext: b64(ct),
  };
}

export async function decryptJson(payload, password) {
  const salt = new Uint8Array(fromB64(payload.salt));
  const iv = new Uint8Array(fromB64(payload.iv));
  const key = await deriveKey(password, salt);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    fromB64(payload.ciphertext)
  );
  return JSON.parse(dec.decode(pt));
}
