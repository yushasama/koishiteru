import assert from 'node:assert/strict';
import test from 'node:test';
import { ASIC_ACCESS_PATH, ASIC_ARTICLE_PATH, ASIC_ARTICLE_SLUG } from '../lib/asic-access/config.ts';
import { createBlogImageMetadata } from '../lib/blog/metadata.ts';
import { blogPosts, getBlogPost } from '../lib/blog/posts.ts';

const baseUrl = process.env.BLOG_PREVIEW_BASE_URL;
const asicPost = getBlogPost(ASIC_ARTICLE_SLUG);

test('preview metadata publishes only absolute public image URLs', () => {
  for (const post of blogPosts) {
    const metadata = createBlogImageMetadata(post.thumbnail);
    const image = `https://koishite.ru${post.thumbnail}`;
    assert.deepEqual(metadata, { openGraph: { images: [image] }, twitter: { card: 'summary_large_image', images: [image] } });
  }
});

for (const userAgent of ['Mozilla/5.0', 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)']) {
  test(`anonymous preview serves the publicized article: ${userAgent}`, { skip: !baseUrl }, async () => {
    assert.ok(asicPost);
    const headers = { 'User-Agent': userAgent };
    const article = await fetch(new URL(ASIC_ARTICLE_PATH, baseUrl), { headers, redirect: 'manual' });
    assert.equal(article.status, 200);
    assert.equal(article.headers.get('set-cookie'), null);
    const html = await article.text();
    assert.ok(html.includes('data-article-content'));
    assert.ok(html.includes(asicPost.excerpt));

    const gate = await fetch(new URL(ASIC_ACCESS_PATH, baseUrl), { headers, redirect: 'manual' });
    assert.equal(gate.status, 307);
    assert.equal(new URL(gate.headers.get('location'), baseUrl).pathname, ASIC_ARTICLE_PATH);
    assert.equal(gate.headers.get('set-cookie'), null);

    const thumbnail = await fetch(new URL(asicPost.thumbnail, baseUrl), { headers });
    assert.equal(thumbnail.status, 200);
    assert.match(thumbnail.headers.get('content-type'), /^image\//);
    assert.ok((await thumbnail.arrayBuffer()).byteLength > 1000);

    const privateAsset = await fetch(new URL('/blog/asic-reverse-engineering/jsc-asic-showcase-1080p.mp4', baseUrl), { headers, redirect: 'manual' });
    assert.equal(privateAsset.status, 200);
    assert.ok((await privateAsset.arrayBuffer()).byteLength > 1000);
  });
}
