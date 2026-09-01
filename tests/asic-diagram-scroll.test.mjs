import assert from 'node:assert/strict';
import test from 'node:test';
import { getDiagramPositionProgress, getDiagramScrollCapture, isDiagramTouchCaptureNear } from '../components/blog/asic/diagramScroll.ts';

const stop = { anchor: 500, progress: 0, distance: 1200 };

test('arrival stops the page at the first frame, even after a large fling', () => {
  assert.deepEqual(getDiagramScrollCapture([stop], 100, 2000), { index: 0, progress: 0, scrollY: 500 });
  assert.equal(getDiagramScrollCapture([stop], 100, 100), null);
});

test('scrolling advances and reverses frames without moving the page', () => {
  assert.deepEqual(getDiagramScrollCapture([{ ...stop, progress: 0.5 }], 500, 120), { index: 0, progress: 0.6, scrollY: 500 });
  assert.deepEqual(getDiagramScrollCapture([{ ...stop, progress: 0.5 }], 500, -120), { index: 0, progress: 0.4, scrollY: 500 });
});

test('completion consumes its final input and releases the next input', () => {
  const complete = getDiagramScrollCapture([{ ...stop, progress: 0.95 }], 500, 120);
  assert.deepEqual(complete, { index: 0, progress: 1, scrollY: 500 });
  assert.equal(getDiagramScrollCapture([{ ...stop, progress: complete.progress }], 500, 120), null);
  assert.deepEqual(getDiagramScrollCapture([{ ...stop, progress: 0.05 }], 500, -120), { index: 0, progress: 0, scrollY: 500 });
  assert.equal(getDiagramScrollCapture([stop], 500, -120), null);
});

test('reverse entry starts from the final frame and stops before rewinding', () => {
  assert.deepEqual(getDiagramScrollCapture([stop], 1000, -900), { index: 0, progress: 1, scrollY: 500 });
});

test('the nearest diagram owns a crossing in either direction regardless of mount order', () => {
  const stops = [{ ...stop, anchor: 900 }, stop, { ...stop, anchor: 1500 }];
  assert.equal(getDiagramScrollCapture(stops, 100, 3000).index, 1);
  assert.equal(getDiagramScrollCapture(stops, 2000, -3000).index, 2);
});

test('large wheel deltas cannot jump through a whole sequence', () => {
  assert.equal(getDiagramScrollCapture([stop], 500, 100000).progress, 0.1);
  assert.equal(getDiagramScrollCapture([{ ...stop, progress: 0.5 }], 500, -100000).progress, 0.4);
});

test('native jumps and unrelated input do not trap page navigation', () => {
  assert.equal(getDiagramScrollCapture([stop], 550, 80), null);
  assert.equal(getDiagramScrollCapture([stop], 450, -80), null);
  for (const delta of [0, NaN, Infinity, -Infinity]) assert.equal(getDiagramScrollCapture([stop], 500, delta), null);
  assert.equal(getDiagramScrollCapture([], 500, 80), null);
});

test('touch capture starts before a nearby diagram can enter native panning', () => {
  assert.equal(isDiagramTouchCaptureNear([stop], 0, 600), true);
  assert.equal(isDiagramTouchCaptureNear([stop], 1100, 600), true);
  assert.equal(isDiagramTouchCaptureNear([stop], -101, 600), false);
  assert.equal(isDiagramTouchCaptureNear([stop], 1101, 600), false);
  assert.equal(isDiagramTouchCaptureNear([], 500, 600), false);
});

test('a small mobile overshoot does not complete the animation', () => {
  assert.equal(getDiagramPositionProgress(0, 40, 667, true), 0);
  assert.equal(getDiagramPositionProgress(0.35, 40, 667, true), 0.35);
  assert.equal(getDiagramPositionProgress(0, 668, 667, true), 1);
  assert.equal(getDiagramPositionProgress(0, 40, 667, false), 1);
  assert.equal(getDiagramPositionProgress(1, -40, 667, true), 0);
});
