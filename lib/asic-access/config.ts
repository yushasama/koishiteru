export const ASIC_ARTICLE_SLUG = 'reverse-engineering-an-asic-with-geometry-graph-theory-and-cigarette-breaks';
export const ASIC_ARTICLE_PATH = `/blog/${ASIC_ARTICLE_SLUG}`;
export const ASIC_ACCESS_PATH = '/asic-access';
export const ASIC_ACCESS_ENDPOINT = '/api/asic-access';
export const ASIC_ACCESS_COOKIE = 'asic_access';
export const ASIC_ACCESS_SESSION_SECONDS = 8 * 60 * 60;

export interface PasswordRecord {
  iterations: number;
  salt: Uint8Array;
  digest: Uint8Array;
}

export interface AsicAccessConfig {
  password: PasswordRecord;
  sessionSecret: Uint8Array;
  secureCookies: boolean;
}

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const PASSWORD_RECORD_PATTERN = /^v1\$(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/;

export function decodeBase64Url(value: string): Uint8Array {
  if (!BASE64URL_PATTERN.test(value)) throw new Error('ASIC access configuration contains invalid base64url data');
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + padding);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function readRequiredEnvironmentValue(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`Missing required ASIC access setting: ${name}`);
  return value;
}

function parsePasswordRecord(value: string): PasswordRecord {
  const match = PASSWORD_RECORD_PATTERN.exec(value);
  if (!match) throw new Error('ASIC_ACCESS_PASSWORD_RECORD has an invalid format');

  const iterations = Number.parseInt(match[1], 10);
  const salt = decodeBase64Url(match[2]);
  const digest = decodeBase64Url(match[3]);
  if (!Number.isSafeInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) throw new Error('ASIC access PBKDF2 iterations must be between 100000 and 1000000');
  if (salt.byteLength < 16) throw new Error('ASIC access password salt must contain at least 16 bytes');
  if (digest.byteLength !== 32) throw new Error('ASIC access password digest must contain exactly 32 bytes');
  return { iterations, salt, digest };
}

export function loadAsicAccessConfig(environment: NodeJS.ProcessEnv = process.env): AsicAccessConfig {
  const password = parsePasswordRecord(readRequiredEnvironmentValue(environment, 'ASIC_ACCESS_PASSWORD_RECORD'));
  const sessionSecret = decodeBase64Url(readRequiredEnvironmentValue(environment, 'ASIC_ACCESS_SESSION_SECRET'));
  if (sessionSecret.byteLength < 32) throw new Error('ASIC access session secret must contain at least 32 bytes');
  return { password, sessionSecret, secureCookies: environment.NODE_ENV === 'production' };
}
