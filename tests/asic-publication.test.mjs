import assert from 'node:assert/strict';
import test from 'node:test';
import { ASIC_ARTICLE_SLUG } from '../lib/asic-access/config.ts';
import { ASIC_PUBLICIZE_AT, blogPostRequiresAccess, getBlogPost } from '../lib/blog/posts.ts';

const publicizeAt = Date.parse(ASIC_PUBLICIZE_AT);

test('ASIC article remains protected until its Pacific publicize date', () => {
  assert.equal(blogPostRequiresAccess(ASIC_ARTICLE_SLUG, publicizeAt - 1), true);
  assert.equal(getBlogPost(ASIC_ARTICLE_SLUG, publicizeAt - 1)?.requiresAccess, true);
});

test('ASIC article becomes public at its Pacific publicize date', () => {
  assert.equal(ASIC_PUBLICIZE_AT, '2026-09-05T00:00:00-07:00');
  assert.equal(blogPostRequiresAccess(ASIC_ARTICLE_SLUG, publicizeAt), false);
  assert.equal(getBlogPost(ASIC_ARTICLE_SLUG, publicizeAt)?.requiresAccess, false);
});

test('invalid clocks fail closed', () => {
  assert.equal(blogPostRequiresAccess(ASIC_ARTICLE_SLUG, Number.NaN), true);
  assert.equal(blogPostRequiresAccess(ASIC_ARTICLE_SLUG, new Date(Number.NaN)), true);
});
