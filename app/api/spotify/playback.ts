import { getSpotifyConfig, type SpotifyConfig } from './config'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const CURRENTLY_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const IDLE_RECHECK_MS = 30_000
const MIN_RECHECK_MS = 5_000
const MAX_RECHECK_MS = 30_000

interface SpotifyAccessTokenResponse {
  access_token: string
  expires_in: number
}

interface SpotifyArtist {
  name: string
}

interface SpotifyTrack {
  type: 'track'
  name: string
  uri: string
  external_urls?: { spotify?: string }
  artists: SpotifyArtist[]
  duration_ms: number
}

interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean
  progress_ms: number | null
  item: SpotifyTrack | { type: string } | null
}

interface CachedAccessToken {
  value: string
  expiresAt: number
}

export interface PlaybackStatus {
  title: string
  artist: string
  isPlaying: boolean
  spotifyUrl: string | null
  durationMs: number | null
  progressMs: number | null
}

export type PlaybackListener = (status: PlaybackStatus) => void

export class SpotifyRateLimitError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super('Spotify rate limit reached')
  }
}

let cachedAccessToken: CachedAccessToken | null = null

function isAccessTokenResponse(value: unknown): value is SpotifyAccessTokenResponse {
  if (!value || typeof value !== 'object') return false
  const token = value as Partial<SpotifyAccessTokenResponse>
  return typeof token.access_token === 'string' && token.access_token.length > 0 && typeof token.expires_in === 'number'
}

function isCurrentlyPlayingResponse(value: unknown): value is SpotifyCurrentlyPlayingResponse {
  if (!value || typeof value !== 'object') return false
  const playback = value as Partial<SpotifyCurrentlyPlayingResponse>
  return typeof playback.is_playing === 'boolean' && (playback.progress_ms === null || typeof playback.progress_ms === 'number') && ('item' in playback)
}

function isTrack(value: SpotifyCurrentlyPlayingResponse['item']): value is SpotifyTrack {
  if (!value || value.type !== 'track') return false
  const track = value as Partial<SpotifyTrack>
  return typeof track.name === 'string' && typeof track.uri === 'string' && typeof track.duration_ms === 'number' && Array.isArray(track.artists) && track.artists.every((artist) => typeof artist?.name === 'string')
}

function emptyPlaybackStatus(): PlaybackStatus {
  return { title: '', artist: '', isPlaying: false, spotifyUrl: null, durationMs: null, progressMs: null }
}

async function requestAccessToken(config: SpotifyConfig): Promise<CachedAccessToken> {
  const authorization = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${authorization}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: config.refreshToken }),
    cache: 'no-store',
  })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok || !isAccessTokenResponse(body)) throw new Error(`Spotify token refresh failed with status ${response.status}`)
  return { value: body.access_token, expiresAt: Date.now() + Math.max(body.expires_in - 60, 60) * 1000 }
}

async function getAccessToken(config: SpotifyConfig): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) return cachedAccessToken.value
  cachedAccessToken = await requestAccessToken(config)
  return cachedAccessToken.value
}

async function requestCurrentlyPlaying(config: SpotifyConfig, retryUnauthorized: boolean): Promise<PlaybackStatus> {
  const accessToken = await getAccessToken(config)
  const response = await fetch(CURRENTLY_PLAYING_URL, { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
  if (response.status === 204) return emptyPlaybackStatus()
  if (response.status === 401 && retryUnauthorized) {
    cachedAccessToken = null
    return requestCurrentlyPlaying(config, false)
  }
  if (response.status === 429) {
    const retryAfterSeconds = Number.parseInt(response.headers.get('retry-after') ?? '30', 10)
    throw new SpotifyRateLimitError((Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 30) * 1000)
  }
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok || !isCurrentlyPlayingResponse(body)) throw new Error(`Spotify playback request failed with status ${response.status}`)
  if (!body.is_playing || !isTrack(body.item)) return emptyPlaybackStatus()
  return {
    title: body.item.name,
    artist: body.item.artists.map((artist) => artist.name).join(', '),
    isPlaying: true,
    spotifyUrl: body.item.external_urls?.spotify ?? null,
    durationMs: body.item.duration_ms,
    progressMs: body.progress_ms,
  }
}

export async function getCurrentPlayback(): Promise<PlaybackStatus> {
  return requestCurrentlyPlaying(getSpotifyConfig(), true)
}

function playbackIdentity(status: PlaybackStatus): string {
  return `${status.isPlaying}:${status.title}:${status.artist}:${status.spotifyUrl ?? ''}`
}

function nextRecheckDelay(status: PlaybackStatus): number {
  if (!status.isPlaying || status.durationMs === null || status.progressMs === null) return IDLE_RECHECK_MS
  return Math.min(Math.max(status.durationMs - status.progressMs + 750, MIN_RECHECK_MS), MAX_RECHECK_MS)
}

class SpotifyPlaybackMonitor {
  private readonly listeners = new Set<PlaybackListener>()
  private timer: ReturnType<typeof setTimeout> | null = null
  private checking = false
  private current: PlaybackStatus | null = null

  subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener)
    if (this.current) listener(this.current)
    if (!this.timer && !this.checking) void this.check()
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size > 0 || !this.timer) return
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private async check(): Promise<void> {
    this.checking = true
    let delay = IDLE_RECHECK_MS
    try {
      const status = await getCurrentPlayback()
      delay = nextRecheckDelay(status)
      if (!this.current || playbackIdentity(this.current) !== playbackIdentity(status)) {
        this.current = status
        this.listeners.forEach((listener) => listener(status))
      }
    } catch (error) {
      delay = error instanceof SpotifyRateLimitError ? error.retryAfterMs : IDLE_RECHECK_MS
      console.error('Spotify playback monitor failed', error instanceof Error ? error.message : error)
    } finally {
      this.checking = false
      if (this.listeners.size === 0) return
      this.timer = setTimeout(() => {
        this.timer = null
        void this.check()
      }, delay)
    }
  }
}

export const spotifyPlaybackMonitor = new SpotifyPlaybackMonitor()
