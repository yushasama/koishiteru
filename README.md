## About
This is the codebase for my developer portfolio. Built with NextJS, TailwindCSS, Typecript, and love.

## Private ASIC article

The ASIC article, its route bundle, image-optimized variants, and its files under `public/blog/asic-reverse-engineering` and `public/media/jsc-asic-showcase.mp4` are protected by server middleware. Generate the deployment values without storing the plaintext password:

```bash
npm run asic:secrets
```

Use `npm run asic:secrets -- --write-local` to update the gitignored `.env.local` file directly without printing either generated value. For production, add the two generated values to the Vercel project environment. The gate fails closed with `503` when either value is missing or invalid. Redeploy after changing the password record or session secret; rotating the session secret immediately invalidates existing sessions.
