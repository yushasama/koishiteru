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
  contentPath: string;
  sections: readonly BlogSection[];
}

export const blogPosts: readonly BlogPost[] = [
  {
    slug: 'from-homework-assignment-to-low-latency-benchmarking-engine',
    title: 'From Homework Assignment to Low-Latency Benchmarking Engine',
    excerpt: 'A systems programming assignment became a deep dive into memory allocation, SIMD, bitmasking, profiling, and the hidden costs of fast code.',
    category: 'Systems',
    publishedAt: '2025-06-20T04:49:21.000Z',
    displayDate: 'Jun 20, 2025',
    readingMinutes: 18,
    thumbnail: '/blog/blog-flow.jpg',
    contentPath: 'content/blog/from-homework-assignment-to-low-latency-benchmarking-engine.md',
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
