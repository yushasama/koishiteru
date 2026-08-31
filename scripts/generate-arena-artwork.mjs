import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { arenaArtworkPaths, renderArenaArtwork } from '../lib/blog/arenaArtwork.ts';

const outputRoot = new URL('../public/', import.meta.url);

for (const [variant, assetPath] of Object.entries(arenaArtworkPaths)) {
  const destination = new URL(assetPath.slice(1), outputRoot);
  await writeFile(destination, renderArenaArtwork(variant));
  console.log(fileURLToPath(destination));
}
