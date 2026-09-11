
import { NextResponse } from 'next/server'
import { getCurrentPlayback } from './playback'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await getCurrentPlayback(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Spotify playback request failed', error instanceof Error ? error.message : error)
    return NextResponse.json({ title: '', artist: '', isPlaying: false, spotifyUrl: null, durationMs: null, progressMs: null }, { status: 503 })
  }
}
