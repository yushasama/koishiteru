import { DEMO_ASIC_SCENE, type DemoShape, type SceneBox } from './demoAsicScene';

export type RTreeBBox = readonly [number, number, number, number];
export type RTreeSplitAxis = 'x' | 'y';

export interface RTreeSourceEntry {
  index: number;
  id: string;
  label: string;
  shape: DemoShape;
  bbox: RTreeBBox;
}

export interface RTreeDecisionCandidate {
  childIndex: number;
  enlargement: number;
  area: number;
  selected: boolean;
}

export interface RTreeDecisionLevel {
  nodeId: string;
  selectedChildIndex: number;
  candidates: readonly RTreeDecisionCandidate[];
}

export interface RTreeSplitRecord {
  nodeId: string;
  leaf: boolean;
  axis: RTreeSplitAxis;
  leftCount: number;
  rightCount: number;
}

export interface RTreeSnapshotNode {
  id: string;
  leaf: boolean;
  bbox: SceneBox | null;
  entryIndexes: readonly number[];
  children: readonly RTreeSnapshotNode[];
}

export interface RTreeConstructionStep {
  number: number;
  entry: RTreeSourceEntry;
  event: 'insert' | 'root-split' | 'leaf-split';
  decisionPath: readonly RTreeDecisionLevel[];
  splits: readonly RTreeSplitRecord[];
  snapshot: RTreeSnapshotNode;
  signature: string;
}

export interface RTreeConstructionTrace {
  implementation: string;
  implementationSha256: string;
  sceneSha256: string;
  layer: 'li1';
  maxEntries: number;
  dbuPerMicrometer: number;
  entries: readonly RTreeSourceEntry[];
  initial: RTreeSnapshotNode;
  steps: readonly RTreeConstructionStep[];
}

interface WorkingRectEntry {
  kind: 'rect';
  bbox: RTreeBBox;
  source: RTreeSourceEntry;
}

interface WorkingBranchEntry {
  kind: 'branch';
  bbox: RTreeBBox;
  child: WorkingNode;
}

type WorkingEntry = WorkingRectEntry | WorkingBranchEntry;

interface WorkingNode {
  id: string;
  leaf: boolean;
  entries: WorkingEntry[];
}

const MAX_ENTRIES = 8;
const DBU_PER_MICROMETER = 1000;
const IMPLEMENTATION_SHA256 = '79de9da273c5715b4f1e967f53071c172c7047b88f8c76fe431fdff2cbe48311';
const EXPECTED_SIGNATURES: readonly string[] = [
  'L[0]',
  'L[0,1]',
  'L[0,1,2]',
  'L[0,1,2,3]',
  'L[0,1,2,3,4]',
  'L[0,1,2,3,4,5]',
  'L[0,1,2,3,4,5,6]',
  'L[0,1,2,3,4,5,6,7]',
  'N[L[0,1,2,3]|L[4,5,6,7,8]]',
  'N[L[0,1,2,3]|L[4,5,6,7,8,9]]',
  'N[L[0,1,2,3]|L[4,5,6,7,8,9,10]]',
  'N[L[0,1,2,3]|L[4,5,6,7,8,9,10,11]]',
  'N[L[0,1,2,3]|L[4,5,6,7]|L[8,9,10,11,12]]',
  'N[L[0,1,2,3]|L[4,5,6,7]|L[8,9,10,11,12,13]]',
  'N[L[0,1,2,3]|L[4,5,6,7]|L[8,9,10,11,12,13,14]]',
  'N[L[0,1,2,3]|L[4,5,6,7]|L[8,9,10,11,12,13,14,15]]',
  'N[L[0,1,2,3,16]|L[4,5,6,7]|L[8,9,10,11,12,13,14,15]]',
  'N[L[0,1,2,3,16]|L[4,5,6,7]|L[9,11,13,15]|L[17,8,10,12,14]]',
  'N[L[0,1,2,3,16]|L[4,5,6,7,18]|L[9,11,13,15]|L[17,8,10,12,14]]',
  'N[L[0,1,2,3,16]|L[4,5,6,7,18]|L[9,11,13,15]|L[17,8,10,12,14,19]]',
  'N[L[0,1,2,3,16]|L[4,5,6,7,18,20]|L[9,11,13,15]|L[17,8,10,12,14,19]]',
  'N[L[0,1,2,3,16]|L[4,5,6,7,18,20]|L[9,11,13,15]|L[17,8,10,12,14,19,21]]',
];
const EXPECTED_SELECTED_CHILDREN: readonly (number | null)[] = [null, null, null, null, null, null, null, null, null, 1, 1, 1, 1, 2, 2, 2, 0, 2, 1, 3, 1, 3];

let nextNodeId = 0;

function createNode(leaf: boolean, entries: WorkingEntry[] = []): WorkingNode {
  return { id: `rtree-node-${nextNodeId++}`, leaf, entries };
}

function toDbu(box: SceneBox): RTreeBBox {
  return [Math.round(box.xMin * DBU_PER_MICROMETER), Math.round(box.yMin * DBU_PER_MICROMETER), Math.round(box.xMax * DBU_PER_MICROMETER), Math.round(box.yMax * DBU_PER_MICROMETER)];
}

function entryLabel(id: string): string {
  const tap = /^li1-u(\d+)-(vdd|gnd)$/.exec(id);
  if (tap) return `U${tap[1]} ${tap[2].toUpperCase()} TAP`;
  return id.replace(/^li1-/, '').replaceAll('-', ' ').toUpperCase();
}

function bboxArea(bbox: RTreeBBox): number {
  return (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]);
}

function bboxUnion(a: RTreeBBox, b: RTreeBBox): RTreeBBox {
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
}

function bboxEnlargement(current: RTreeBBox, added: RTreeBBox): number {
  return bboxArea(bboxUnion(current, added)) - bboxArea(current);
}

function bboxCenter(bbox: RTreeBBox): readonly [number, number] {
  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
}

function nodeBBox(node: WorkingNode): RTreeBBox {
  if (!node.entries.length) throw new Error('Cannot compute bbox of empty R-tree node');
  return node.entries.slice(1).reduce((bbox, entry) => bboxUnion(bbox, entry.bbox), node.entries[0].bbox);
}

function chooseSubtree(node: WorkingNode, bbox: RTreeBBox): WorkingBranchEntry {
  if (node.leaf) throw new Error('Cannot choose subtree from a leaf node');
  const branches = node.entries as WorkingBranchEntry[];
  let best = branches[0];
  let bestEnlargement = bboxEnlargement(best.bbox, bbox);
  let bestArea = bboxArea(best.bbox);
  for (const branch of branches.slice(1)) {
    const enlargement = bboxEnlargement(branch.bbox, bbox);
    const area = bboxArea(branch.bbox);
    if (enlargement < bestEnlargement || (enlargement === bestEnlargement && area < bestArea)) {
      best = branch;
      bestEnlargement = enlargement;
      bestArea = area;
    }
  }
  return best;
}

function decisionPath(root: WorkingNode, bbox: RTreeBBox): readonly RTreeDecisionLevel[] {
  const path: RTreeDecisionLevel[] = [];
  let node = root;
  while (!node.leaf) {
    const branches = node.entries as WorkingBranchEntry[];
    const selected = chooseSubtree(node, bbox);
    const selectedChildIndex = branches.indexOf(selected);
    path.push({ nodeId: node.id, selectedChildIndex, candidates: branches.map((branch, childIndex) => ({ childIndex, enlargement: bboxEnlargement(branch.bbox, bbox), area: bboxArea(branch.bbox), selected: childIndex === selectedChildIndex })) });
    node = selected.child;
  }
  return path;
}

function splitNode(node: WorkingNode, splits: RTreeSplitRecord[]): readonly [WorkingNode, WorkingNode] {
  const centers = node.entries.map((entry) => bboxCenter(entry.bbox));
  const xSpread = Math.max(...centers.map(([x]) => x)) - Math.min(...centers.map(([x]) => x));
  const ySpread = Math.max(...centers.map(([, y]) => y)) - Math.min(...centers.map(([, y]) => y));
  const axis: RTreeSplitAxis = xSpread >= ySpread ? 'x' : 'y';
  const axisIndex = axis === 'x' ? 0 : 1;
  const entries = [...node.entries].sort((a, b) => bboxCenter(a.bbox)[axisIndex] - bboxCenter(b.bbox)[axisIndex]);
  const mid = Math.floor(entries.length / 2);
  splits.push({ nodeId: node.id, leaf: node.leaf, axis, leftCount: mid, rightCount: entries.length - mid });
  return [createNode(node.leaf, entries.slice(0, mid)), createNode(node.leaf, entries.slice(mid))];
}

function insertInto(node: WorkingNode, entry: WorkingRectEntry, splits: RTreeSplitRecord[]): readonly [WorkingNode, WorkingNode] | null {
  if (node.leaf) {
    node.entries.push(entry);
    return node.entries.length > MAX_ENTRIES ? splitNode(node, splits) : null;
  }
  const subtree = chooseSubtree(node, entry.bbox);
  const split = insertInto(subtree.child, entry, splits);
  if (!split) {
    subtree.bbox = nodeBBox(subtree.child);
  } else {
    const subtreeIndex = node.entries.indexOf(subtree);
    node.entries.splice(subtreeIndex, 1);
    for (const child of split) node.entries.push({ kind: 'branch', bbox: nodeBBox(child), child });
  }
  return node.entries.length > MAX_ENTRIES ? splitNode(node, splits) : null;
}

function insert(root: WorkingNode, source: RTreeSourceEntry, splits: RTreeSplitRecord[]): WorkingNode {
  const split = insertInto(root, { kind: 'rect', bbox: source.bbox, source }, splits);
  if (!split) return root;
  return createNode(false, split.map((child) => ({ kind: 'branch' as const, bbox: nodeBBox(child), child })));
}

function toSceneBox(bbox: RTreeBBox): SceneBox {
  return { xMin: bbox[0] / DBU_PER_MICROMETER, yMin: bbox[1] / DBU_PER_MICROMETER, xMax: bbox[2] / DBU_PER_MICROMETER, yMax: bbox[3] / DBU_PER_MICROMETER };
}

function snapshot(node: WorkingNode): RTreeSnapshotNode {
  const entryIndexes = node.leaf ? (node.entries as WorkingRectEntry[]).map((entry) => entry.source.index) : [];
  const children = node.leaf ? [] : (node.entries as WorkingBranchEntry[]).map((entry) => snapshot(entry.child));
  return { id: node.id, leaf: node.leaf, bbox: node.entries.length ? toSceneBox(nodeBBox(node)) : null, entryIndexes, children };
}

function signature(node: RTreeSnapshotNode): string {
  return node.leaf ? `L[${node.entryIndexes.join(',')}]` : `N[${node.children.map(signature).join('|')}]`;
}

function buildTrace(): RTreeConstructionTrace {
  nextNodeId = 0;
  const entries = DEMO_ASIC_SCENE.shapes.filter((shape) => shape.layer === 'li1').map((shape, index): RTreeSourceEntry => ({ index, id: shape.id, label: entryLabel(shape.id), shape, bbox: toDbu(shape.box) }));
  let root = createNode(true);
  const initial = snapshot(root);
  const steps = entries.map((entry, index): RTreeConstructionStep => {
    const wasLeafRoot = root.leaf;
    const path = decisionPath(root, entry.bbox);
    const splits: RTreeSplitRecord[] = [];
    root = insert(root, entry, splits);
    const current = snapshot(root);
    const event = wasLeafRoot && !root.leaf ? 'root-split' : splits.length ? 'leaf-split' : 'insert';
    return { number: index + 1, entry, event, decisionPath: path, splits, snapshot: current, signature: signature(current) };
  });
  return { implementation: 'jsc_asic.physical.spatial_index.RTree', implementationSha256: IMPLEMENTATION_SHA256, sceneSha256: DEMO_ASIC_SCENE.sourceSha256, layer: 'li1', maxEntries: MAX_ENTRIES, dbuPerMicrometer: DBU_PER_MICROMETER, entries, initial, steps };
}

function sameBox(a: SceneBox | null, b: SceneBox): boolean {
  return !!a && a.xMin === b.xMin && a.yMin === b.yMin && a.xMax === b.xMax && a.yMax === b.yMax;
}

function validateNode(node: RTreeSnapshotNode, seen: number[]): SceneBox {
  const itemBoxes = node.leaf ? node.entryIndexes.map((index) => RTREE_CONSTRUCTION.entries[index].shape.box) : node.children.map((child) => validateNode(child, seen));
  if (node.leaf) seen.push(...node.entryIndexes);
  if (!itemBoxes.length) throw new Error(`R-tree node ${node.id} cannot be empty after insertion`);
  if ((node.leaf ? node.entryIndexes.length : node.children.length) > MAX_ENTRIES) throw new Error(`R-tree node ${node.id} exceeds capacity ${MAX_ENTRIES}`);
  const bound = itemBoxes.slice(1).reduce((result, box) => ({ xMin: Math.min(result.xMin, box.xMin), yMin: Math.min(result.yMin, box.yMin), xMax: Math.max(result.xMax, box.xMax), yMax: Math.max(result.yMax, box.yMax) }), itemBoxes[0]);
  if (!sameBox(node.bbox, bound)) throw new Error(`R-tree node ${node.id} has an invalid MBB`);
  return bound;
}

function validateTrace(trace: RTreeConstructionTrace): void {
  if (trace.entries.length !== 22 || trace.steps.length !== EXPECTED_SIGNATURES.length) throw new Error('R-tree construction must contain all 22 LI1 rectangles');
  trace.steps.forEach((step, index) => {
    if (step.signature !== EXPECTED_SIGNATURES[index]) throw new Error(`R-tree step ${step.number} diverges from the Python implementation: ${step.signature}`);
    const selected = step.decisionPath[0]?.selectedChildIndex ?? null;
    if (selected !== EXPECTED_SELECTED_CHILDREN[index]) throw new Error(`R-tree step ${step.number} selected child ${String(selected)} instead of ${String(EXPECTED_SELECTED_CHILDREN[index])}`);
    const seen: number[] = [];
    validateNode(step.snapshot, seen);
    const expected = Array.from({ length: step.number }, (_, entryIndex) => entryIndex);
    if ([...seen].sort((a, b) => a - b).join(',') !== expected.join(',')) throw new Error(`R-tree step ${step.number} lost or duplicated an entry`);
  });
}

export const RTREE_CONSTRUCTION = buildTrace();
validateTrace(RTREE_CONSTRUCTION);
