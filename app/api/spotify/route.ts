import axios from 'axios'

export async function GET(){
  try {
    const response = await axios.get(
      `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${process.env.NEXT_PUBLIC_USER_NAME}&api_key=${process.env.NEXT_PUBLIC_API_KEY}&limit=1&nowplaying=true&format=json`
    );

    const mostRecentSong = {
      'title': response.data.recenttracks.track[0].name,
      'artist': response.data.recenttracks.track[0].artist['#text']
    }

    return Response.json(mostRecentSong)
  } catch (error) {
    console.error(error)
  }
}
