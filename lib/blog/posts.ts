export interface BlogSection {
  id: string;
  title: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  displayDate: string;
  readingMinutes: number;
  thumbnail: string;
  thumbnailAlt: string;
  visualStory?: 'asic-reverse-engineering' | 'systems-optimization';
  sections: readonly BlogSection[];
}

export const blogPosts: readonly BlogPost[] = [
  {
    slug: 'reverse-engineering-an-asic-with-geometry-graph-theory-and-cigarette-breaks',
    title: 'That Time I Was Reincarnated as an Unemployed CS Student and Jane Street Gave Me An ASIC To Reverse Engineer',
    excerpt: 'Reverse engineering an ASIC with geometry, graph theory, and cigarette breaks.',
    category: 'Reverse Engineering',
    publishedAt: '2026-08-23T12:00:00.000Z',
    displayDate: 'Aug 23, 2026',
    readingMinutes: 19,
    thumbnail: '/blog/asic-reverse-engineering/layout.png',
    thumbnailAlt: 'Recovered ASIC layout rendered as dense routing geometry',
    visualStory: 'asic-reverse-engineering',
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
    title: 'From Homework Assignment to Low-Latency Benchmarking Engine',
    excerpt: 'A systems programming assignment became a deep dive into memory allocation, SIMD, bitmasking, profiling, and the hidden costs of fast code.',
    category: 'Systems',
    publishedAt: '2025-06-20T04:49:21.000Z',
    displayDate: 'Jun 20, 2025',
    readingMinutes: 18,
    thumbnail: '/blog/from-homework-assignment/cache-observation-thumbnail.svg',
    thumbnailAlt: 'Cache observation map showing L1 cache sets, the pooled hits counter, and uncollected L2 and L3 levels',
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

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPostContentPath(post: Pick<BlogPost, 'slug'>): string {
  return `content/blog/${post.slug}/article.md`;
}
