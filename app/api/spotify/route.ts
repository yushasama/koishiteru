import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const userName = process.env.NEXT_PUBLIC_USER_NAME;

export async function GET(req:NextApiRequest, res:NextApiResponse) {
  try {
    const response = await axios.get(
      `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${userName}&api_key=${apiKey}&limit=1&nowplaying=true&format=json`
    );

    const mostRecentSong = {
      title: response.data.recenttracks.track[0].name,
      artist: response.data.recenttracks.track[0].artist['#text'],
    };

    return Response.json(mostRecentSong); // Use res.json() to send the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' }); // Handle errors and send an error response
  }
}
