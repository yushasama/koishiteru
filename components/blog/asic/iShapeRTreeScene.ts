import scenePayload from './iShapeRTreeScene.json';

export interface IShapePoint { x: number; y: number; }
export interface IShapeBox { xMin: number; yMin: number; xMax: number; yMax: number; }
export interface IShapeRectangle { id: string; label: string; box: IShapeBox; }

export interface IShapeRTreeReceipt {
  implementation: string;
  implementationSha256: string;
  layer: 'i-shape-decomposition';
  maxEntries: number;
  dbuPerMicrometer: number;
  signatures: readonly string[];
  selectedChildren: readonly (number | null)[];
}

export interface IShapeRTreeScene {
  schemaVersion: 1;
  name: string;
  sourceSha256: string;
  dbuPerMicrometer: number;
  bounds: IShapeBox;
  outline: readonly IShapePoint[];
  rectangles: readonly IShapeRectangle[];
  rTreeReceipt: IShapeRTreeReceipt;
}

function parseScene(value: unknown): IShapeRTreeScene {
  const scene = record(value, 'I-shape scene');
  if (scene.schemaVersion !== 1) throw new Error(`Unsupported I-shape scene schema ${String(scene.schemaVersion)}`);
  const result: IShapeRTreeScene = {
    schemaVersion: 1,
    name: string(scene.name, 'scene.name'),
    sourceSha256: string(scene.sourceSha256, 'scene.sourceSha256'),
    dbuPerMicrometer: positive(scene.dbuPerMicrometer, 'scene.dbuPerMicrometer'),
    bounds: box(scene.bounds, 'scene.bounds'),
    outline: array(scene.outline, 'scene.outline').map((item, index) => point(item, `scene.outline[${index}]`)),
    rectangles: array(scene.rectangles, 'scene.rectangles').map((item, index) => rectangle(item, `scene.rectangles[${index}]`)),
    rTreeReceipt: receipt(scene.rTreeReceipt, 'scene.rTreeReceipt'),
  };
  validateDecomposition(result);
  return result;
}

function validateDecomposition(scene: IShapeRTreeScene): void {
  if (scene.outline.length < 4) throw new Error('I-shape outline must contain at least four points');
  if (scene.rectangles.length !== 3) throw new Error('I-shape decomposition must contain exactly R0, R1, and R2');
  if (new Set(scene.rectangles.map((rectangle) => rectangle.id)).size !== scene.rectangles.length) throw new Error('I-shape rectangle ids must be unique');
  const polygonArea = Math.abs(scene.outline.reduce((sum, current, index) => { const next = scene.outline[(index + 1) % scene.outline.length]; return sum + current.x * next.y - next.x * current.y; }, 0)) / 2;
  const rectangleArea = scene.rectangles.reduce((sum, rectangle) => sum + area(rectangle.box), 0);
  if (Math.abs(polygonArea - rectangleArea) > 1e-9) throw new Error('R0, R1, and R2 do not exactly cover the I-shape area');
  for (let left = 0; left < scene.rectangles.length; left += 1) for (let right = left + 1; right < scene.rectangles.length; right += 1) if (overlapArea(scene.rectangles[left].box, scene.rectangles[right].box) > 0) throw new Error('I-shape decomposition rectangles overlap');
  if (scene.rTreeReceipt.signatures.length !== scene.rectangles.length || scene.rTreeReceipt.selectedChildren.length !== scene.rectangles.length) throw new Error('I-shape R-tree receipt must cover every decomposition rectangle');
}

function receipt(value: unknown, owner: string): IShapeRTreeReceipt {
  const item = record(value, owner);
  if (item.layer !== 'i-shape-decomposition') throw new Error(`${owner}.layer must be i-shape-decomposition`);
  return { implementation: string(item.implementation, `${owner}.implementation`), implementationSha256: string(item.implementationSha256, `${owner}.implementationSha256`), layer: 'i-shape-decomposition', maxEntries: positive(item.maxEntries, `${owner}.maxEntries`), dbuPerMicrometer: positive(item.dbuPerMicrometer, `${owner}.dbuPerMicrometer`), signatures: array(item.signatures, `${owner}.signatures`).map((entry, index) => string(entry, `${owner}.signatures[${index}]`)), selectedChildren: array(item.selectedChildren, `${owner}.selectedChildren`).map((entry, index) => nullableInteger(entry, `${owner}.selectedChildren[${index}]`)) };
}

function rectangle(value: unknown, owner: string): IShapeRectangle { const item = record(value, owner); return { id: string(item.id, `${owner}.id`), label: string(item.label, `${owner}.label`), box: box(item.box, `${owner}.box`) }; }
function point(value: unknown, owner: string): IShapePoint { const item = record(value, owner); return { x: number(item.x, `${owner}.x`), y: number(item.y, `${owner}.y`) }; }
function box(value: unknown, owner: string): IShapeBox { const item = record(value, owner); const result = { xMin: number(item.xMin, `${owner}.xMin`), yMin: number(item.yMin, `${owner}.yMin`), xMax: number(item.xMax, `${owner}.xMax`), yMax: number(item.yMax, `${owner}.yMax`) }; if (area(result) <= 0) throw new Error(`${owner} must have positive area`); return result; }
function area(value: IShapeBox): number { return (value.xMax - value.xMin) * (value.yMax - value.yMin); }
function overlapArea(left: IShapeBox, right: IShapeBox): number { return Math.max(0, Math.min(left.xMax, right.xMax) - Math.max(left.xMin, right.xMin)) * Math.max(0, Math.min(left.yMax, right.yMax) - Math.max(left.yMin, right.yMin)); }
function record(value: unknown, owner: string): Record<string, unknown> { if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${owner} must be an object`); return value as Record<string, unknown>; }
function array(value: unknown, owner: string): readonly unknown[] { if (!Array.isArray(value)) throw new Error(`${owner} must be an array`); return value; }
function string(value: unknown, owner: string): string { if (typeof value !== 'string' || !value) throw new Error(`${owner} must be a non-empty string`); return value; }
function number(value: unknown, owner: string): number { if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${owner} must be a finite number`); return value; }
function positive(value: unknown, owner: string): number { const result = number(value, owner); if (result <= 0) throw new Error(`${owner} must be positive`); return result; }
function nullableInteger(value: unknown, owner: string): number | null { if (value === null) return null; const result = number(value, owner); if (!Number.isInteger(result) || result < 0) throw new Error(`${owner} must be a non-negative integer or null`); return result; }

export const I_SHAPE_RTREE_SCENE: IShapeRTreeScene = parseScene(scenePayload as unknown);
