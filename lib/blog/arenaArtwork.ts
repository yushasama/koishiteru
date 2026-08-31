interface ArenaAllocation {
  type: string;
  offset: number;
  bytes: number;
  tint: string;
}

interface SlabLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  length: number;
  depth: number;
  skew: number;
  thickness: number;
}

type ArenaArtworkVariant = 'thumbnail' | 'hero' | 'mobileHero';

export const arenaArtworkPaths: Readonly<Record<ArenaArtworkVariant, string>> = {
  thumbnail: '/blog/from-homework-assignment/arena-slab-thumbnail.svg',
  hero: '/blog/from-homework-assignment/arena-slab-hero.svg',
  mobileHero: '/blog/from-homework-assignment/arena-slab-mobile.svg',
};

// The projection is conceptual; allocation widths preserve this aligned 64-byte layout.
const arena = {
  capacity: 64,
  allocations: [
    { type: 'u32', offset: 0, bytes: 4, tint: '#90d6de' },
    { type: 'f32[3]', offset: 4, bytes: 12, tint: '#8cb6db' },
    { type: 'u64[2]', offset: 16, bytes: 16, tint: '#b5bde5' },
  ] satisfies readonly ArenaAllocation[],
} as const;

const cursor = arena.allocations.reduce((end, allocation) => Math.max(end, allocation.offset + allocation.bytes), 0);

function topFace(left: number, right: number, layout: SlabLayout): string {
  return `${left},${layout.y} ${left + layout.skew},${layout.y - layout.depth} ${right + layout.skew},${layout.y - layout.depth} ${right},${layout.y}`;
}

function renderSlab(layout: SlabLayout, variant: ArenaArtworkVariant): string {
  const compact = variant !== 'hero';
  const thumbnail = variant === 'thumbnail';
  const { x, y, length, depth, skew, thickness } = layout;
  const unit = length / arena.capacity;
  const boundary = x + cursor * unit;
  const end = x + length;
  const pointerX = boundary + skew;
  const backY = y - depth;
  const arrowTop = thumbnail ? 48 : compact ? 55 : 105;
  const strokeWidth = compact ? 0.7 : 1.15;
  const allocations = arena.allocations.map((allocation, index) => {
    const left = x + allocation.offset * unit;
    const right = left + allocation.bytes * unit;
    const label = compact ? '' : `<text x="${(left + right + skew) / 2}" y="${y - depth / 2 + 6}" text-anchor="middle" fill="${allocation.tint}" font-size="18">${allocation.type}</text>`;
    return `<path d="M${left} ${y}h${right - left}v${thickness}H${left}z" fill="${allocation.tint}" fill-opacity=".065" stroke="${allocation.tint}" stroke-opacity=".24" stroke-width="${strokeWidth}"/><polygon points="${topFace(left, right, layout)}" fill="url(#allocation-${index})" stroke="${allocation.tint}" stroke-opacity=".6" stroke-width="${strokeWidth}"/>${label}`;
  }).join('');
  const freeFace = topFace(boundary, end, layout);
  const labels = compact
    ? `${thumbnail ? '<text x="7" y="22" fill="#dbe5eb" font-size="15" font-weight="600">arena</text>' : ''}<text x="${pointerX}" y="${arrowTop - 6}" text-anchor="middle" fill="#ff96b6" font-size="${thumbnail ? 13 : 20}">${thumbnail ? 'bump' : 'bump pointer'}</text><text x="${(x + boundary) / 2}" y="${y + thickness + 25}" text-anchor="middle" fill="#adbdcc" font-size="${thumbnail ? 13 : 18}">used</text><text x="${(boundary + end) / 2}" y="${y + thickness + 25}" text-anchor="middle" fill="#91a0ab" font-size="${thumbnail ? 13 : 18}">free</text>`
    : `<text x="${pointerX}" y="87" text-anchor="middle" fill="#ff96b6" font-size="22" font-weight="500">bump pointer</text><text x="${(boundary + end + skew) / 2}" y="${y - depth / 2 + 6}" text-anchor="middle" fill="#8698a5" font-size="19">unallocated</text><path d="M${x} ${y + thickness + 10}v8M${end} ${y + thickness + 10}v8" stroke="#71818d" stroke-opacity=".5"/><text x="${x}" y="${y + thickness + 43}" fill="#92a2ae" font-size="15">base</text><text x="${end}" y="${y + thickness + 43}" text-anchor="end" fill="#92a2ae" font-size="15">end</text>`;
  const frontier = `M${pointerX} ${backY}L${boundary} ${y}v${thickness}`;
  return `<path d="M${boundary} ${y}H${end}v${thickness}H${boundary}z" fill="#0b1016" stroke="#697e8e" stroke-opacity=".35" stroke-width="${strokeWidth}"/><path d="M${end} ${y}l${skew} -${depth}v${thickness}l-${skew} ${depth}z" fill="#101923" stroke="#718694" stroke-opacity=".4" stroke-width="${strokeWidth}"/><polygon points="${freeFace}" fill="#0c131b" stroke="#718694" stroke-opacity=".6" stroke-width="${strokeWidth}"/><polygon points="${freeFace}" fill="url(#free-hatch)"/>${allocations}<path d="${frontier}" fill="none" stroke="#fb4e7c" stroke-width="${compact ? 3 : 7}" opacity=".35" filter="url(#frontier-glow)"/><path d="${frontier}" fill="none" stroke="#ff719d" stroke-width="${compact ? 1.5 : 2}"/><path d="M${pointerX} ${arrowTop}V${backY - 5}" stroke="#ff96b6" stroke-width="${compact ? 1.2 : 1.5}"/><path d="M${pointerX - (compact ? 3 : 4)} ${backY - 7}l${compact ? 3 : 4} ${compact ? 5 : 7} ${compact ? 3 : 4}-${compact ? 5 : 7}z" fill="#ff96b6"/>${labels}`;
}

export function renderArenaArtwork(variant: ArenaArtworkVariant): string {
  const compact = variant !== 'hero';
  const layout: SlabLayout = variant === 'thumbnail'
    ? { width: 144, height: 140, x: 6, y: 88, length: 118, depth: 28, skew: 14, thickness: 8 }
    : compact ? { width: 400, height: 190, x: 20, y: 114, length: 326, depth: 35, skew: 25, thickness: 10 } : { width: 900, height: 440, x: 50, y: 246, length: 744, depth: 96, skew: 48, thickness: 22 };
  const gradients = arena.allocations.map((allocation, index) => `<linearGradient id="allocation-${index}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${allocation.tint}" stop-opacity=".36"/><stop offset=".44" stop-color="${allocation.tint}" stop-opacity=".2"/><stop offset="1" stop-color="${allocation.tint}" stop-opacity=".085"/></linearGradient>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-labelledby="arena-title arena-description"><title id="arena-title">Arena allocator and bump pointer</title><desc id="arena-description">A conceptual horizontal 64-byte arena. From left to right, a u32, three f32 values, and two u64 values occupy the first 32 bytes. The bump pointer marks the first unused byte. The remaining 32 bytes form one continuous free suffix. Depth is illustrative; no individual allocation is detached from the buffer.</desc><defs>${gradients}<pattern id="free-hatch" width="${compact ? 6 : 13}" height="${compact ? 6 : 13}" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><path d="M0 0V${compact ? 6 : 13}" stroke="#91a7b9" stroke-opacity=".1" stroke-width=".8"/></pattern><filter id="frontier-glow" x="-100%" y="-30%" width="300%" height="160%"><feGaussianBlur stdDeviation="${compact ? 1.5 : 4}"/></filter><radialGradient id="atmosphere"><stop stop-color="#213245" stop-opacity=".26"/><stop offset="1" stop-color="#070707" stop-opacity="0"/></radialGradient></defs><rect width="${layout.width}" height="${layout.height}" fill="#070707"/><ellipse cx="${layout.width * .5}" cy="${layout.height * .55}" rx="${layout.width * .48}" ry="${layout.height * .46}" fill="url(#atmosphere)"/><g font-family="ui-monospace, SFMono-Regular, Consolas, monospace">${renderSlab(layout, variant)}</g></svg>\n`;
}
