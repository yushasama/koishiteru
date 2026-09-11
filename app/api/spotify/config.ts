export interface SpotifyConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
}

function requireEnvironmentValue(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

export function getSpotifyConfig(): SpotifyConfig {
  return {
    clientId: requireEnvironmentValue('SPOTIFY_CLIENT_ID'),
    clientSecret: requireEnvironmentValue('SPOTIFY_CLIENT_SECRET'),
    refreshToken: requireEnvironmentValue('SPOTIFY_REFRESH_TOKEN'),
  }
}
