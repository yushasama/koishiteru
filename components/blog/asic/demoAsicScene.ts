import scenePayload from './demoAsicScene.json';

export type ConductorLayerId = 'li1' | 'met1' | 'met2' | 'met3' | 'met4' | 'met5';
export type ContactLayerId = 'mcon' | 'via' | 'via2' | 'via3' | 'via4';
export type NetId = 'sig_a' | 'sig_b' | 'sig_y' | 'vdd' | 'gnd';

export interface SceneBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface DemoCell {
  id: string;
  cellName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sites: number;
}

export interface DemoShape {
  id: string;
  layer: ConductorLayerId;
  net: NetId;
  kind: 'local' | 'rail' | 'routing' | 'global' | 'pad';
  box: SceneBox;
}

export interface DemoContact {
  id: string;
  layer: ContactLayerId;
  net: NetId;
  lower: ConductorLayerId;
  upper: ConductorLayerId;
  box: SceneBox;
}

export interface DemoPin {
  id: string;
  name: string;
  displayName: string | null;
  net: NetId;
  layer: ConductorLayerId;
  role: 'source' | 'destination' | 'power';
  box: SceneBox;
}

export interface DemoAsicScene {
  schemaVersion: 1;
  name: string;
  sourceSha256: string;
  siteWidth: number;
  rowHeight: number;
  bounds: SceneBox;
  cells: readonly DemoCell[];
  shapes: readonly DemoShape[];
  contacts: readonly DemoContact[];
  pins: readonly DemoPin[];
}

const CONDUCTOR_LAYERS = new Set<ConductorLayerId>(['li1', 'met1', 'met2', 'met3', 'met4', 'met5']);
const CONTACT_LAYERS = new Set<ContactLayerId>(['mcon', 'via', 'via2', 'via3', 'via4']);
const NETS = new Set<NetId>(['sig_a', 'sig_b', 'sig_y', 'vdd', 'gnd']);
const SHAPE_KINDS = new Set<DemoShape['kind']>(['local', 'rail', 'routing', 'global', 'pad']);
const PIN_ROLES = new Set<DemoPin['role']>(['source', 'destination', 'power']);

function parseDemoAsicScene(value: unknown): DemoAsicScene {
  const scene = record(value, 'scene');
  const schemaVersion = number(scene.schemaVersion, 'scene.schemaVersion');
  if (schemaVersion !== 1) throw new Error(`Unsupported demo ASIC scene schema ${schemaVersion}`);
  const result: DemoAsicScene = {
    schemaVersion: 1,
    name: string(scene.name, 'scene.name'),
    sourceSha256: string(scene.sourceSha256, 'scene.sourceSha256'),
    siteWidth: number(scene.siteWidth, 'scene.siteWidth'),
    rowHeight: number(scene.rowHeight, 'scene.rowHeight'),
    bounds: box(scene.bounds, 'scene.bounds'),
    cells: array(scene.cells, 'scene.cells').map((item, index) => cell(item, `scene.cells[${index}]`)),
    shapes: array(scene.shapes, 'scene.shapes').map((item, index) => shape(item, `scene.shapes[${index}]`)),
    contacts: array(scene.contacts, 'scene.contacts').map((item, index) => contact(item, `scene.contacts[${index}]`)),
    pins: array(scene.pins, 'scene.pins').map((item, index) => pin(item, `scene.pins[${index}]`)),
  };
  if (!result.cells.length || !result.shapes.length || !result.contacts.length) throw new Error('Demo ASIC scene must contain cells, conductors, and contacts');
  return result;
}

function cell(value: unknown, owner: string): DemoCell {
  const item = record(value, owner);
  return { id: string(item.id, `${owner}.id`), cellName: string(item.cellName, `${owner}.cellName`), x: number(item.x, `${owner}.x`), y: number(item.y, `${owner}.y`), width: positive(item.width, `${owner}.width`), height: positive(item.height, `${owner}.height`), sites: positive(item.sites, `${owner}.sites`) };
}

function shape(value: unknown, owner: string): DemoShape {
  const item = record(value, owner);
  return { id: string(item.id, `${owner}.id`), layer: member(item.layer, CONDUCTOR_LAYERS, `${owner}.layer`), net: member(item.net, NETS, `${owner}.net`), kind: member(item.kind, SHAPE_KINDS, `${owner}.kind`), box: box(item.box, `${owner}.box`) };
}

function contact(value: unknown, owner: string): DemoContact {
  const item = record(value, owner);
  return { id: string(item.id, `${owner}.id`), layer: member(item.layer, CONTACT_LAYERS, `${owner}.layer`), net: member(item.net, NETS, `${owner}.net`), lower: member(item.lower, CONDUCTOR_LAYERS, `${owner}.lower`), upper: member(item.upper, CONDUCTOR_LAYERS, `${owner}.upper`), box: box(item.box, `${owner}.box`) };
}

function pin(value: unknown, owner: string): DemoPin {
  const item = record(value, owner);
  return { id: string(item.id, `${owner}.id`), name: string(item.name, `${owner}.name`), displayName: optionalString(item.displayName, `${owner}.displayName`), net: member(item.net, NETS, `${owner}.net`), layer: member(item.layer, CONDUCTOR_LAYERS, `${owner}.layer`), role: member(item.role, PIN_ROLES, `${owner}.role`), box: box(item.box, `${owner}.box`) };
}

function box(value: unknown, owner: string): SceneBox {
  const item = record(value, owner);
  const result = { xMin: number(item.x_min, `${owner}.x_min`), yMin: number(item.y_min, `${owner}.y_min`), xMax: number(item.x_max, `${owner}.x_max`), yMax: number(item.y_max, `${owner}.y_max`) };
  if (result.xMin >= result.xMax || result.yMin >= result.yMax) throw new Error(`${owner} must have positive area`);
  return result;
}

function record(value: unknown, owner: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${owner} must be an object`);
  return value as Record<string, unknown>;
}

function array(value: unknown, owner: string): readonly unknown[] {
  if (!Array.isArray(value)) throw new Error(`${owner} must be an array`);
  return value;
}

function string(value: unknown, owner: string): string {
  if (typeof value !== 'string' || !value) throw new Error(`${owner} must be a non-empty string`);
  return value;
}

function optionalString(value: unknown, owner: string): string | null {
  if (value === null) return null;
  return string(value, owner);
}

function number(value: unknown, owner: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${owner} must be a finite number`);
  return value;
}

function positive(value: unknown, owner: string): number {
  const result = number(value, owner);
  if (result <= 0) throw new Error(`${owner} must be positive`);
  return result;
}

function member<T extends string>(value: unknown, values: ReadonlySet<T>, owner: string): T {
  if (typeof value !== 'string' || !values.has(value as T)) throw new Error(`${owner} has unsupported value ${String(value)}`);
  return value as T;
}

export const DEMO_ASIC_SCENE: DemoAsicScene = parseDemoAsicScene(scenePayload as unknown);
