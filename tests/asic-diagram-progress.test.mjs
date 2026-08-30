import assert from 'node:assert/strict';
import test from 'node:test';
import { getDiagramProgress } from '../components/blog/asic/diagramProgress.ts';

test('progress reaches the end when the diagram completes, not after its hold', () => {
  for (const end of [0.75, 0.7772, 0.85, 0.88, 0.9, 0.91, 0.98]) {
    assert.equal(getDiagramProgress(0, end), 0);
    assert.equal(getDiagramProgress(end / 2, end), 0.5);
    assert.ok(getDiagramProgress(end - 0.01, end) < 1);
    assert.equal(getDiagramProgress(end, end), 1);
    assert.equal(getDiagramProgress((end + 1) / 2, end), 1);
    assert.equal(getDiagramProgress(1, end), 1);
  }
});

test('reverse scrolling leaves the completed hold without latching progress', () => {
  assert.deepEqual([1, 0.95, 0.9, 0.45, 0].map((progress) => getDiagramProgress(progress, 0.9)), [1, 1, 1, 0.5, 0]);
});

test('default and reduced-motion completion remain bounded', () => {
  assert.equal(getDiagramProgress(-1), 0);
  assert.equal(getDiagramProgress(0.6), 0.6);
  assert.equal(getDiagramProgress(1), 1);
  assert.equal(getDiagramProgress(2), 1);
});
