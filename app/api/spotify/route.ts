
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import axios from 'axios'

const apiKey = process.env.NEXT_PUBLIC_API_KEY
const userName = process.env.NEXT_PUBLIC_USER_NAME

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function GET(){
  try {
    const response = await axios.get(
      `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${userName}&api_key=${apiKey}&limit=1&nowplaying=true&format=json`
    );

    const mostRecentSong = {
      'title': response.data.recenttracks.track[0].name,
      'artist': response.data.recenttracks.track[0].artist['#text']
    }
    return NextResponse.json(mostRecentSong)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ title: '', artist: '' }, { status: 500 })
  }
}
