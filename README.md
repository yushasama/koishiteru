## About
This is the codebase for my developer portfolio. Built with NextJS, TailwindCSS, Typecript, and love.

## Spotify playback status

The about page receives current-song changes over a server-sent event stream. The server reads Spotify's official `GET /v1/me/player/currently-playing` endpoint and refreshes its access token without exposing credentials to the browser.

Create a Spotify developer app with Web API enabled and add `http://127.0.0.1:43821/callback` as its redirect URI. Run `npm run spotify:authorize`, enter the app client ID and secret in the hidden terminal prompts, then approve the single `user-read-currently-playing` scope. The helper writes these server-only values directly to the gitignored `.env.local` file without printing them:

```dotenv
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

Spotify does not provide an account-wide playback webhook. The shared server monitor therefore reconciles at the expected end of a track, with a bounded 30-second check for pauses or skips, and emits an SSE message only when playback identity changes.

## Private ASIC article

The ASIC article, its route bundle, image-optimized variants, and its files under `public/blog/asic-reverse-engineering` are protected by server middleware, except for the public `thumbnail-microscope.webp` cover. The password page includes Open Graph and Twitter image tags for that public cover so shared links can display its thumbnail. Its public text remains the existing password-page notice, and no crawler receives special article access. Generate the deployment values without storing the plaintext password:

```bash
npm run asic:secrets
```

Use `npm run asic:secrets -- --write-local` to update the gitignored `.env.local` file directly without printing either generated value. For production, add the two generated values to the Vercel project environment. The gate fails closed with `503` when either value is missing or invalid. Redeploy after changing the password record or session secret; rotating the session secret immediately invalidates existing sessions.
