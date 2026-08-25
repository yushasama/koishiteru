import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ITERATIONS = 210_000;
const LOCAL_ENV_PATH = fileURLToPath(new URL('../.env.local', import.meta.url));
const WRITE_LOCAL = process.argv.includes('--write-local');

function base64url(value) {
  return value.toString('base64url');
}

function dotenvValue(value) {
  return value.replace(/\$/g, '\\$');
}

async function readHiddenLine(prompt) {
  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  return await new Promise((resolve, reject) => {
    let value = '';
    const finish = () => {
      process.stdin.off('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
    };
    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === '\u0003') {
          finish();
          reject(new Error('Cancelled'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          resolve(value);
          return;
        }
        if (character === '\u007f') {
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write('\b \b');
          }
          continue;
        }
        value += character;
        process.stdout.write('*');
      }
    };
    process.stdin.on('data', onData);
  });
}

async function readPasswords() {
  if (process.stdin.isTTY) return [await readHiddenLine('ASIC article password: '), await readHiddenLine('Confirm password: ')];
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const [password = '', confirmation = ''] = Buffer.concat(chunks).toString('utf8').split(/\r?\n/);
  return [password, confirmation];
}

async function writeLocalEnvironment(passwordRecord, sessionSecret) {
  let existing = '';
  try {
    existing = await readFile(LOCAL_ENV_PATH, 'utf8');
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
  }

  const ownedNames = new Set(['ASIC_ACCESS_PASSWORD_RECORD', 'ASIC_ACCESS_SESSION_SECRET']);
  const retainedLines = existing.split(/\r?\n/).filter((line) => !ownedNames.has(line.split('=', 1)[0]));
  while (retainedLines.at(-1) === '') retainedLines.pop();
  const output = [...retainedLines, `ASIC_ACCESS_PASSWORD_RECORD=${dotenvValue(passwordRecord)}`, `ASIC_ACCESS_SESSION_SECRET=${dotenvValue(sessionSecret)}`, ''].join('\n');
  await writeFile(LOCAL_ENV_PATH, output, { encoding: 'utf8', mode: 0o600 });
}

const [password, confirmation] = await readPasswords();
if (password.length < 16) throw new Error('Use a password with at least 16 characters');
if (password !== confirmation) throw new Error('The password confirmation did not match');

const salt = randomBytes(16);
const digest = pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256');
const sessionSecret = randomBytes(32);
const passwordRecord = `v1$${ITERATIONS}$${base64url(salt)}$${base64url(digest)}`;
const encodedSessionSecret = base64url(sessionSecret);

if (WRITE_LOCAL) {
  await writeLocalEnvironment(passwordRecord, encodedSessionSecret);
  console.log('\nUpdated .env.local with the ASIC article access settings.');
} else {
  console.log('\nAdd these encrypted values to your local .env.local and Vercel environment:');
  console.log(`ASIC_ACCESS_PASSWORD_RECORD=${passwordRecord}`);
  console.log(`ASIC_ACCESS_SESSION_SECRET=${encodedSessionSecret}`);
}
