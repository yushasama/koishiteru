import { DEMO_ASIC_SCENE, type DemoShape, type SceneBox } from './demoAsicScene';

export interface RTreeEntry {
  label: string;
  shape: DemoShape;
}

export interface PlotFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SvgBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const RTREE_LEFT_COLOR = '#63d6ff';
export const RTREE_RIGHT_COLOR = '#bd75ff';
export const RTREE_QUERY_COLOR = '#f0c557';
export const RTREE_LEFT_ENTRIES: readonly RTreeEntry[] = [
  { label: 'VDD DROP', shape: getMet2Shape('m2-vdd-drop') },
  { label: 'A SRC', shape: getMet2Shape('m2-a-source') },
  { label: 'B SRC', shape: getMet2Shape('m2-b-source') },
];
export const RTREE_RIGHT_ENTRIES: readonly RTreeEntry[] = [
  { label: 'A SINK', shape: getMet2Shape('m2-a-sink') },
  { label: 'B SINK', shape: getMet2Shape('m2-b-sink') },
  { label: 'Y SINK', shape: getMet2Shape('m2-y-sink') },
];
export const RTREE_CANDIDATE: RTreeEntry = { label: 'Y SRC', shape: getMet2Shape('m2-y-source') };
export const RTREE_MET2_SHAPES = DEMO_ASIC_SCENE.shapes.filter((shape) => shape.layer === 'met2');
export const RTREE_LEFT_BOUND = unionSceneBoxes(RTREE_LEFT_ENTRIES.map((entry) => entry.shape.box));
export const RTREE_RIGHT_BOUND = unionSceneBoxes(RTREE_RIGHT_ENTRIES.map((entry) => entry.shape.box));
export const RTREE_ROOT_BOUND = unionSceneBoxes([...RTREE_LEFT_ENTRIES, ...RTREE_RIGHT_ENTRIES, RTREE_CANDIDATE].map((entry) => entry.shape.box));

export function getMet2Shape(id: string): DemoShape {
  const shape = DEMO_ASIC_SCENE.shapes.find((candidate) => candidate.id === id);
  if (!shape) throw new Error(`Demo ASIC scene is missing R-tree entry ${id}`);
  if (shape.layer !== 'met2') throw new Error(`R-tree entry ${id} must be on MET2`);
  return shape;
}

export function unionSceneBoxes(boxes: readonly SceneBox[]): SceneBox {
  if (!boxes.length) throw new Error('Cannot create an R-tree bound from zero rectangles');
  return boxes.reduce((bound, box) => ({ xMin: Math.min(bound.xMin, box.xMin), yMin: Math.min(bound.yMin, box.yMin), xMax: Math.max(bound.xMax, box.xMax), yMax: Math.max(bound.yMax, box.yMax) }));
}

export function sceneBoxArea(box: SceneBox): number {
  return (box.xMax - box.xMin) * (box.yMax - box.yMin);
}

export function toRTreeSvgBox(box: SceneBox, frame: PlotFrame): SvgBox {
  const bounds = DEMO_ASIC_SCENE.bounds;
  const scaleX = frame.width / (bounds.xMax - bounds.xMin);
  const scaleY = frame.height / (bounds.yMax - bounds.yMin);
  return { x: frame.x + (box.xMin - bounds.xMin) * scaleX, y: frame.y + (bounds.yMax - box.yMax) * scaleY, width: (box.xMax - box.xMin) * scaleX, height: (box.yMax - box.yMin) * scaleY };
}
