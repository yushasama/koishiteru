## About
This is the codebase for my developer portfolio. Built with NextJS, TailwindCSS, Typecript, and love.

## Private ASIC article

The ASIC article, its route bundle, image-optimized variants, and its files under `public/blog/asic-reverse-engineering` are protected by server middleware, except for the public `thumbnail-microscope.webp` cover. The password page includes Open Graph and Twitter image tags for that public cover so shared links can display its thumbnail. Its public text remains the existing password-page notice, and no crawler receives special article access. Generate the deployment values without storing the plaintext password:

```bash
npm run asic:secrets
```

Use `npm run asic:secrets -- --write-local` to update the gitignored `.env.local` file directly without printing either generated value. For production, add the two generated values to the Vercel project environment. The gate fails closed with `503` when either value is missing or invalid. Redeploy after changing the password record or session secret; rotating the session secret immediately invalidates existing sessions.
