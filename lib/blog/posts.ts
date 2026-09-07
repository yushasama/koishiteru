export interface BlogSection {
  id: string;
  title: string;
}

export interface BlogPost {
  slug: string;
  contentFile: 'article.md' | 'content.md';
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  displayDate: string;
  readingMinutes: number;
  thumbnail: string;
  thumbnailAlt: string;
  heroImage?: string;
  visualStory?: 'asic-reverse-engineering' | 'systems-optimization';
  requiresAccess?: boolean;
  publicizeAt?: string;
  sections: readonly BlogSection[];
}

const BLOG_READING_MINUTES = {
  asicReverseEngineering: 19,
  systemsOptimization: 18,
} as const;

export const ASIC_PUBLICIZE_AT = '2026-09-05T00:00:00-07:00';

export const blogPosts: readonly BlogPost[] = [
  {
    slug: 'reincarnated-as-an-unemployed-cs-student-who-reversed-engineered-an-asic',
    contentFile: 'content.md',
    title: 'That Time I Was Reincarnated as an Unemployed CS Student and Jane Street Gave Me An ASIC To Reverse Engineer',
    excerpt: 'Reverse engineering an ASIC with geometry, graph theory, and more graph theory.',
    category: 'Hardware',
    publishedAt: '2026-08-23T12:00:00.000Z',
    displayDate: 'Aug 23, 2026',
    readingMinutes: BLOG_READING_MINUTES.asicReverseEngineering,
    thumbnail: '/blog/asic-reverse-engineering/thumbnail-microscope.webp',
    thumbnailAlt: 'Recovered ASIC die viewed under a wafer-inspection microscope',
    visualStory: 'asic-reverse-engineering',
    requiresAccess: true,
    publicizeAt: ASIC_PUBLICIZE_AT,
    sections: [
      { id: 'le-challenge', title: 'Le Challenge' },
      { id: 'what-is-an-asic', title: 'What is an ASIC and Can I Eat It?' },
      { id: 'sky130-not-skynet', title: 'SKY130, Not Skynet' },
      { id: 'hardware-in-a-gds', title: 'So What Does Hardware Look Like in a GDS?' },
      { id: 'r-tree-dfs', title: 'R-Tree + DFS Go BRRRR' },
      { id: 'debugging-cache', title: 'Debugging When Compiler.exe Has Stopped Responding' },
      { id: 'geometry-to-circuit', title: 'f(Geometry) = Circuit??' },
      { id: 'success-and-sat', title: 'success = 1 & SAT = Free ELO' },
      { id: 'sat-verification', title: "SAT Can't Be Wrong Right??" },
      { id: 'the-solution', title: 'The Solution' },
      { id: 'afterthoughts', title: 'Afterthoughts' },
      { id: 'relevant-links', title: 'Relevant Links' },
    ],
  },
  {
    slug: 'from-homework-assignment-to-low-latency-benchmarking-engine',
    contentFile: 'article.md',
    title: 'From Homework Assignment to Low-Latency Benchmarking Engine',
    excerpt: 'A systems programming assignment became a deep dive into memory allocation, SIMD, bitmasking, profiling, and the hidden costs of fast code.',
    category: 'Systems',
    publishedAt: '2025-06-20T04:49:21.000Z',
    displayDate: 'Jun 20, 2025',
    readingMinutes: BLOG_READING_MINUTES.systemsOptimization,
    thumbnail: '/blog/from-homework-assignment/systems-cover.png',
    thumbnailAlt: 'Glowing cyan and pink SIMD lanes, a particle field, and an arena memory slab with a bright allocation boundary',
    heroImage: '/blog/from-homework-assignment/systems-cover.png',
    visualStory: 'systems-optimization',
    sections: [
      { id: 'debriefing-intro-optimization', title: 'Debriefing + Intro Optimization' },
      { id: 'pre-allocating-memory-bump-allocator', title: 'Pre-allocating Memory & Bump Allocator' },
      { id: 'maximizing-your-cpu-using-simd', title: 'Maximizing Your CPU Using SIMD' },
      { id: 'who-is-bitmask', title: "Who is Bitmask and What's Under the Mask?" },
      { id: 'other-optimizations', title: 'Other Optimizations' },
      { id: 'experience-working-on-project', title: 'Experience During Working on This Project' },
    ],
  },
];

function resolveBlogPostAccess(post: BlogPost, now: number | Date): BlogPost {
  if (!post.requiresAccess || !post.publicizeAt) return post;
  const timestamp = now instanceof Date ? now.getTime() : now;
  const publicizeAt = Date.parse(post.publicizeAt);
  if (!Number.isFinite(timestamp) || !Number.isFinite(publicizeAt) || timestamp < publicizeAt) return post;
  return { ...post, requiresAccess: false };
}

export function getBlogPosts(now: number | Date = Date.now()): readonly BlogPost[] {
  return blogPosts.map((post) => resolveBlogPostAccess(post, now));
}

export function getBlogPost(slug: string, now: number | Date = Date.now()): BlogPost | undefined {
  const post = blogPosts.find((candidate) => candidate.slug === slug);
  return post ? resolveBlogPostAccess(post, now) : undefined;
}

export function blogPostRequiresAccess(slug: string, now: number | Date = Date.now()): boolean {
  return getBlogPost(slug, now)?.requiresAccess ?? true;
}

export function getBlogPostContentPath(post: Pick<BlogPost, 'contentFile' | 'slug'>): string {
  return `content/blog/${post.slug}/${post.contentFile}`;
}
