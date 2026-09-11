import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

const LOCAL_ENV_PATH = fileURLToPath(new URL('../.env.local', import.meta.url))
const REDIRECT_URI = 'http://127.0.0.1:43821/callback'
const AUTHORIZATION_TIMEOUT_MS = 5 * 60_000

function readHiddenLine(prompt) {
  process.stdout.write(prompt)
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  return new Promise((resolve, reject) => {
    let value = ''
    const finish = () => {
      process.stdin.off('data', onData)
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdout.write('\n')
    }
    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === '\u0003') {
          finish()
          reject(new Error('Cancelled'))
          return
        }
        if (character === '\r' || character === '\n') {
          finish()
          resolve(value.trim())
          return
        }
        if (character === '\u007f' || character === '\b') {
          if (value.length > 0) value = value.slice(0, -1)
          continue
        }
        value += character
      }
    }
    process.stdin.on('data', onData)
  })
}

function isTokenResponse(value) {
  return Boolean(value && typeof value === 'object' && typeof value.refresh_token === 'string' && value.refresh_token.length > 0)
}

function dotenvValue(value) {
  return value.replace(/\\/g, '\\\\').replace(/\$/g, '\\$').replace(/\r?\n/g, '')
}

async function writeLocalEnvironment(clientId, clientSecret, refreshToken) {
  let existing = ''
  try {
    existing = await readFile(LOCAL_ENV_PATH, 'utf8')
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error
  }
  const ownedNames = new Set(['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REFRESH_TOKEN'])
  const retainedLines = existing.split(/\r?\n/).filter((line) => !ownedNames.has(line.split('=', 1)[0]))
  while (retainedLines.at(-1) === '') retainedLines.pop()
  const spotifyLines = [`SPOTIFY_CLIENT_ID=${dotenvValue(clientId)}`, `SPOTIFY_CLIENT_SECRET=${dotenvValue(clientSecret)}`, `SPOTIFY_REFRESH_TOKEN=${dotenvValue(refreshToken)}`]
  await writeFile(LOCAL_ENV_PATH, [...retainedLines, ...spotifyLines, ''].join('\n'), { encoding: 'utf8', mode: 0o600 })
}

async function exchangeAuthorizationCode(clientId, clientSecret, code) {
  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${authorization}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }),
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || !isTokenResponse(body)) throw new Error(`Spotify authorization failed with status ${response.status}`)
  return body.refresh_token
}

async function authorize(clientId, clientSecret) {
  const state = randomBytes(24).toString('base64url')
  const authorizationUrl = new URL('https://accounts.spotify.com/authorize')
  authorizationUrl.search = new URLSearchParams({ client_id: clientId, response_type: 'code', redirect_uri: REDIRECT_URI, state, scope: 'user-read-currently-playing' }).toString()

  return new Promise((resolve, reject) => {
    const server = createServer(async (request, response) => {
      try {
        const callbackUrl = new URL(request.url ?? '/', REDIRECT_URI)
        if (callbackUrl.pathname !== '/callback') {
          response.writeHead(404).end('Not found')
          return
        }
        if (callbackUrl.searchParams.get('state') !== state) throw new Error('Spotify authorization state did not match')
        const code = callbackUrl.searchParams.get('code')
        if (!code) throw new Error(callbackUrl.searchParams.get('error') ?? 'Spotify did not return an authorization code')
        const refreshToken = await exchangeAuthorizationCode(clientId, clientSecret, code)
        await writeLocalEnvironment(clientId, clientSecret, refreshToken)
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end('<h1>Spotify connected</h1><p>The credentials were saved to .env.local. You can close this tab.</p>')
        resolve()
      } catch (error) {
        response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end(error instanceof Error ? error.message : 'Spotify authorization failed')
        reject(error)
      } finally {
        server.close()
      }
    })
    server.on('error', reject)
    server.listen(43821, '127.0.0.1', () => console.log(`\nOpen this URL to authorize Spotify:\n${authorizationUrl}`))
    setTimeout(() => {
      server.close()
      reject(new Error('Spotify authorization timed out'))
    }, AUTHORIZATION_TIMEOUT_MS).unref()
  })
}

if (!process.stdin.isTTY) throw new Error('Run this command in an interactive terminal')
const clientId = await readHiddenLine('Spotify client ID: ')
const clientSecret = await readHiddenLine('Spotify client secret: ')
if (!clientId || !clientSecret) throw new Error('Spotify client ID and client secret are required')
await authorize(clientId, clientSecret)
console.log('Spotify authorization complete. Restart the development server to load the new values.')
