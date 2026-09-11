import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const aboutPage = await readFile(new URL('../app/about/page.tsx', import.meta.url), 'utf8')
const spotifyRoute = await readFile(new URL('../app/api/spotify/route.ts', import.meta.url), 'utf8')
const spotifyEventsRoute = await readFile(new URL('../app/api/spotify/events/route.ts', import.meta.url), 'utf8')
const spotifyConfig = await readFile(new URL('../app/api/spotify/config.ts', import.meta.url), 'utf8')
const spotifyPlayback = await readFile(new URL('../app/api/spotify/playback.ts', import.meta.url), 'utf8')
const spotifyAuthorize = await readFile(new URL('../scripts/authorize-spotify.mjs', import.meta.url), 'utf8')

test('about page consumes playback events without interval polling', () => {
  assert.match(aboutPage, /new EventSource\('\/api\/spotify\/events'\)/)
  assert.doesNotMatch(aboutPage, /setInterval|fetchCurrentSong/)
  assert.match(aboutPage, /events\.close\(\)/)
})

test('Spotify integration uses the official playback and refresh-token endpoints', () => {
  assert.match(spotifyPlayback, /https:\/\/api\.spotify\.com\/v1\/me\/player\/currently-playing/)
  assert.match(spotifyPlayback, /https:\/\/accounts\.spotify\.com\/api\/token/)
  assert.doesNotMatch(`${spotifyRoute}\n${spotifyPlayback}`, /audioscrobbler|last\.fm/i)
})

test('Spotify credentials remain server-only and the event route streams SSE', () => {
  assert.match(spotifyConfig, /SPOTIFY_CLIENT_ID/)
  assert.match(spotifyConfig, /SPOTIFY_CLIENT_SECRET/)
  assert.match(spotifyConfig, /SPOTIFY_REFRESH_TOKEN/)
  assert.doesNotMatch(spotifyConfig, /NEXT_PUBLIC_/)
  assert.match(spotifyEventsRoute, /text\/event-stream/)
  assert.match(spotifyEventsRoute, /spotifyPlaybackMonitor\.subscribe/)
  assert.match(spotifyEventsRoute, /maxDuration = 60/)
  assert.match(spotifyEventsRoute, /setTimeout\(\(\) => close\(\), 55_000\)/)
})

test('local authorization requests the narrow playback scope and never prints credentials', () => {
  assert.match(spotifyAuthorize, /scope: 'user-read-currently-playing'/)
  assert.match(spotifyAuthorize, /http:\/\/127\.0\.0\.1:43821\/callback/)
  assert.match(spotifyAuthorize, /writeLocalEnvironment\(clientId, clientSecret, refreshToken\)/)
  assert.doesNotMatch(spotifyAuthorize, /console\.log\([^\n]*(clientSecret|refreshToken)/)
})
