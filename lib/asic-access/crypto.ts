import { decodeBase64Url, ASIC_ACCESS_SESSION_SECONDS, type AsicAccessConfig } from './config';

const encoder = new TextEncoder();

function ownedBuffer(value: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(value.byteLength);
  copy.set(value);
  return copy.buffer;
}

function encodeBase64Url(value: Uint8Array): string {
  let binary = '';
  value.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  const length = Math.max(left.byteLength, right.byteLength);
  let mismatch = left.byteLength ^ right.byteLength;
  for (let index = 0; index < length; index += 1) mismatch |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return mismatch === 0;
}

async function derivePasswordDigest(password: string, config: AsicAccessConfig): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: ownedBuffer(config.password.salt), iterations: config.password.iterations }, key, 256);
  return new Uint8Array(bits);
}

async function signSessionPayload(payload: string, config: AsicAccessConfig): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ownedBuffer(config.sessionSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

export async function verifyPassword(password: string, config: AsicAccessConfig): Promise<boolean> {
  const digest = await derivePasswordDigest(password, config);
  return constantTimeEqual(digest, config.password.digest);
}

export async function createSessionToken(config: AsicAccessConfig, nowMilliseconds: number = Date.now()): Promise<string> {
  const expiresAt = Math.floor(nowMilliseconds / 1000) + ASIC_ACCESS_SESSION_SECONDS;
  const payload = `v1.${expiresAt}`;
  const signature = await signSessionPayload(payload, config);
  return `${payload}.${encodeBase64Url(signature)}`;
}

export async function verifySessionToken(token: string, config: AsicAccessConfig, nowMilliseconds: number = Date.now()): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;

  const expiresAt = Number.parseInt(parts[1], 10);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(nowMilliseconds / 1000)) return false;

  let suppliedSignature: Uint8Array;
  try {
    suppliedSignature = decodeBase64Url(parts[2]);
  } catch {
    return false;
  }

  const expectedSignature = await signSessionPayload(`${parts[0]}.${parts[1]}`, config);
  return constantTimeEqual(suppliedSignature, expectedSignature);
}
