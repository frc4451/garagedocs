/**
 * A small orbiting 3D view for the pose-chain diagrams in the Vision group.
 *
 * Everything is drawn on a 2D canvas with one orthographic projection, which is
 * enough for arrows between frames and keeps the whole thing dependency-free.
 * Coordinates are WPILib robot/field convention throughout: +X forward, +Y left,
 * +Z up, metres, angles counterclockwise-positive.
 */

export type Vec3 = [number, number, number];
export type Mat3 = [Vec3, Vec3, Vec3];

/** A rigid transform, named as an arrow from one frame to another. */
export interface Transform {
  t: Vec3;
  r: Mat3;
}

export const DEG = Math.PI / 180;

/** Rz(yaw) · Ry(pitch) · Rx(roll), the order WPILib's Rotation3d applies. */
export function rotation(rollDeg: number, pitchDeg: number, yawDeg: number): Mat3 {
  const sr = Math.sin(rollDeg * DEG);
  const cr = Math.cos(rollDeg * DEG);
  const sp = Math.sin(pitchDeg * DEG);
  const cp = Math.cos(pitchDeg * DEG);
  const sy = Math.sin(yawDeg * DEG);
  const cy = Math.cos(yawDeg * DEG);
  return [
    [cy * cp, cy * sp * sr - sy * cr, cy * sp * cr + sy * sr],
    [sy * cp, sy * sp * sr + cy * cr, sy * sp * cr - cy * sr],
    [-sp, cp * sr, cp * cr],
  ];
}

export function apply(r: Mat3, v: Vec3): Vec3 {
  return [
    r[0][0] * v[0] + r[0][1] * v[1] + r[0][2] * v[2],
    r[1][0] * v[0] + r[1][1] * v[1] + r[1][2] * v[2],
    r[2][0] * v[0] + r[2][1] * v[1] + r[2][2] * v[2],
  ];
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function norm(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

/** Point in the parent frame for a point given in the child frame. */
export function toParent(x: Transform, local: Vec3): Vec3 {
  return add(x.t, apply(x.r, local));
}

/** Compose two arrows: AToB then BToC gives AToC, exactly as the names cancel. */
export function compose(aToB: Transform, bToC: Transform): Transform {
  const r: Mat3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      r[i][j] = aToB.r[i][0] * bToC.r[0][j] + aToB.r[i][1] * bToC.r[1][j] + aToB.r[i][2] * bToC.r[2][j];
    }
  }
  return { t: toParent(aToB, bToC.t), r };
}

/** The same arrow pointing the other way, which is what `inverse()` returns. */
export function invert(x: Transform): Transform {
  const r: Mat3 = [
    [x.r[0][0], x.r[1][0], x.r[2][0]],
    [x.r[0][1], x.r[1][1], x.r[2][1]],
    [x.r[0][2], x.r[1][2], x.r[2][2]],
  ];
  const t = apply(r, x.t);
  return { t: [-t[0], -t[1], -t[2]], r };
}

export interface Palette {
  /** Canvas background; label outlines are drawn in it so text stays legible. */
  surface: string;
  /** Floor grid lines, which must differ from `surface` or the grid vanishes. */
  grid: string;
  chassis: string;
  chassisFill: string;
  front: string;
  frontFill: string;
  text: string;
  muted: string;
  axisX: string;
  axisY: string;
  axisZ: string;
  camera: string;
  tag: string;
  robotToCamera: string;
  cameraToTag: string;
  robotToTag: string;
}

/** Reads the palette from CSS custom properties so the diagram follows the site theme. */
export function readPalette(root: Element): Palette {
  const s = getComputedStyle(root);
  const get = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    surface: get('--pv-surface', '#f4efeb'),
    grid: get('--pv-grid', '#d8d0ca'),
    chassis: get('--pv-chassis', '#6f8399'),
    chassisFill: get('--pv-chassis-fill', 'rgba(120,140,170,0.16)'),
    front: get('--pv-front', '#c85a00'),
    frontFill: get('--pv-front-fill', 'rgba(200,90,0,0.18)'),
    text: get('--pv-text', '#18110e'),
    muted: get('--pv-muted', '#76665e'),
    axisX: get('--pv-axis-x', '#e00020'),
    axisY: get('--pv-axis-y', '#2d7a4f'),
    axisZ: get('--pv-axis-z', '#2563eb'),
    camera: get('--pv-camera', '#7c3aed'),
    tag: get('--pv-tag', '#0f766e'),
    robotToCamera: get('--pv-arrow-rc', '#7c3aed'),
    cameraToTag: get('--pv-arrow-ct', '#c2410c'),
    robotToTag: get('--pv-arrow-rt', '#0f766e'),
  };
}

export interface Camera {
  az: number;
  el: number;
}

/** Drawing helpers bound to one canvas, one projection and one palette. */
export class Painter {
  readonly g: CanvasRenderingContext2D;
  readonly w: number;
  readonly h: number;
  readonly palette: Palette;
  private readonly scale: number;
  private readonly cx: number;
  private readonly cy: number;
  private readonly view: Camera;

  constructor(
    canvas: HTMLCanvasElement,
    view: Camera,
    extent: number,
    palette: Palette,
  ) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 640;
    const h = canvas.clientHeight || 340;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const g = canvas.getContext('2d');
    if (!g) throw new Error('2d context unavailable');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    this.g = g;
    this.w = w;
    this.h = h;
    this.view = view;
    this.palette = palette;
    this.scale = Math.min(h * 0.62, w * 0.42) / extent;
    this.cx = w * 0.5;
    this.cy = h * 0.6;
  }

  project([x, y, z]: Vec3): [number, number] {
    const x1 = x * Math.cos(this.view.az) - y * Math.sin(this.view.az);
    const y1 = x * Math.sin(this.view.az) + y * Math.cos(this.view.az);
    return [
      this.cx + this.scale * y1,
      this.cy - this.scale * (z * Math.cos(this.view.el) - x1 * Math.sin(this.view.el)),
    ];
  }

  line(a: Vec3, b: Vec3, stroke: string, width = 1, dash?: number[]) {
    const p = this.project(a);
    const q = this.project(b);
    this.g.save();
    if (dash) this.g.setLineDash(dash);
    this.g.strokeStyle = stroke;
    this.g.lineWidth = width;
    this.g.beginPath();
    this.g.moveTo(p[0], p[1]);
    this.g.lineTo(q[0], q[1]);
    this.g.stroke();
    this.g.restore();
  }

  poly(points: Vec3[], fill: string | null, stroke: string | null, width = 1) {
    this.g.save();
    this.g.beginPath();
    points.map((p) => this.project(p)).forEach(([x, y], i) => (i ? this.g.lineTo(x, y) : this.g.moveTo(x, y)));
    this.g.closePath();
    if (fill) {
      this.g.fillStyle = fill;
      this.g.fill();
    }
    if (stroke) {
      this.g.strokeStyle = stroke;
      this.g.lineWidth = width;
      this.g.stroke();
    }
    this.g.restore();
  }

  /** A labelled arrow, which is how every transform in these diagrams is drawn. */
  arrow(a: Vec3, b: Vec3, stroke: string, width = 2.5, label?: string) {
    const p = this.project(a);
    const q = this.project(b);
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy);
    this.g.save();
    this.g.strokeStyle = stroke;
    this.g.fillStyle = stroke;
    this.g.lineWidth = width;
    this.g.beginPath();
    this.g.moveTo(p[0], p[1]);
    this.g.lineTo(q[0], q[1]);
    this.g.stroke();
    if (len > 6) {
      const ux = dx / len;
      const uy = dy / len;
      const head = Math.min(11, len * 0.3);
      this.g.beginPath();
      this.g.moveTo(q[0], q[1]);
      this.g.lineTo(q[0] - head * ux + head * 0.45 * uy, q[1] - head * uy - head * 0.45 * ux);
      this.g.lineTo(q[0] - head * ux - head * 0.45 * uy, q[1] - head * uy + head * 0.45 * ux);
      this.g.closePath();
      this.g.fill();
    }
    this.g.restore();
    if (label) {
      this.labelAt([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], label, stroke, 11, 0, -8);
    }
  }

  text(at: Vec3, label: string, fill: string, size = 11, dx = 0, dy = 0) {
    this.labelAt(this.project(at), label, fill, size, dx, dy);
  }

  /** Outlined text, so labels stay readable over the grid in either theme. */
  labelAt([x, y]: [number, number], label: string, fill: string, size = 11, dx = 0, dy = 0) {
    this.g.save();
    this.g.font = `600 ${size}px var(--font-stack--body, sans-serif)`;
    this.g.textAlign = 'center';
    this.g.textBaseline = 'middle';
    this.g.lineWidth = 3.5;
    this.g.strokeStyle = this.palette.surface;
    this.g.strokeText(label, x + dx, y + dy);
    this.g.fillStyle = fill;
    this.g.fillText(label, x + dx, y + dy);
    this.g.restore();
  }

  corner(label: string) {
    this.g.save();
    this.g.font = '11px var(--font-stack--body, sans-serif)';
    this.g.fillStyle = this.palette.muted;
    this.g.textAlign = 'left';
    this.g.textBaseline = 'top';
    this.g.fillText(label, 10, 10);
    this.g.restore();
  }

  /** Floor grid at 0.25 m, centred on the origin. */
  floor(half: number) {
    const step = 0.25;
    const n = Math.ceil(half / step);
    for (let i = -n; i <= n; i++) {
      const v = i * step;
      this.line([v, -half, 0], [v, half, 0], this.palette.grid, 1);
      this.line([-half, v, 0], [half, v, 0], this.palette.grid, 1);
    }
  }

  /** A set of frame axes: X forward, Y left, Z up. */
  axes(at: Transform, length: number, labels: boolean) {
    const o = at.t;
    const x = toParent(at, [length, 0, 0]);
    const y = toParent(at, [0, length, 0]);
    const z = toParent(at, [0, 0, length]);
    this.line(o, x, this.palette.axisX, 2.5);
    this.line(o, y, this.palette.axisY, 2.5);
    this.line(o, z, this.palette.axisZ, 2.5);
    if (labels) {
      this.text(x, 'X forward', this.palette.axisX, 10, 0, 12);
      this.text(y, 'Y left', this.palette.axisY, 10, 0, 12);
      this.text(z, 'Z up', this.palette.axisZ, 10, 0, -10);
    }
  }

  /** The robot chassis, origin at the centre of the frame on the floor. */
  chassis(length: number, width: number, height: number) {
    const hx = length / 2;
    const hy = width / 2;
    const bottom: Vec3[] = [
      [hx, hy, 0],
      [hx, -hy, 0],
      [-hx, -hy, 0],
      [-hx, hy, 0],
    ];
    const top: Vec3[] = bottom.map(([x, y]) => [x, y, height] as Vec3);
    this.poly(top, this.palette.chassisFill, this.palette.chassis, 1.5);
    this.poly(bottom, null, this.palette.chassis, 1);
    for (let i = 0; i < 4; i++) this.line(bottom[i], top[i], this.palette.chassis, 1.5);
    this.poly(
      [
        [hx, hy, 0],
        [hx, -hy, 0],
        [hx, -hy, height],
        [hx, hy, height],
      ],
      this.palette.frontFill,
      this.palette.front,
      1.5,
    );
    this.text([hx, 0, height], 'FRONT', this.palette.front, 10, 0, -10);
    this.text([0, -hy, 0], `${length.toFixed(2)} m long`, this.palette.muted, 10, 0, 14);
    this.text([-hx, 0, 0], `${width.toFixed(2)} m wide`, this.palette.muted, 10, 0, 14);
  }

  /** A camera body at its mount, with the optical axis and view frustum. */
  cameraBody(mount: Transform, fovH: number, fovV: number, depth: number, color: string) {
    const local = (v: Vec3) => toParent(mount, v);
    const [bx, by, bz] = [0.03, 0.045, 0.03];
    const box: Vec3[] = (
      [
        [-bx, -by, -bz],
        [bx, -by, -bz],
        [bx, by, -bz],
        [-bx, by, -bz],
        [-bx, -by, bz],
        [bx, -by, bz],
        [bx, by, bz],
        [-bx, by, bz],
      ] as Vec3[]
    ).map(local);
    const edges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    this.poly([box[1], box[2], box[6], box[5]], color, null, 0);
    for (const [a, b] of edges) this.line(box[a], box[b], color, 1.4);

    const fw = depth * Math.tan((fovH / 2) * DEG);
    const fh = depth * Math.tan((fovV / 2) * DEG);
    const far: Vec3[] = (
      [
        [depth, fw, fh],
        [depth, -fw, fh],
        [depth, -fw, -fh],
        [depth, fw, -fh],
      ] as Vec3[]
    ).map(local);
    const apex = local([0, 0, 0]);
    for (const f of far) this.line(apex, f, color, 1, [4, 4]);
    this.poly(far, `${color}1f`, color, 1);
    this.line(apex, local([depth * 0.55, 0, 0]), color, 3);
    this.text(local([depth * 0.55, 0, 0]), 'optical axis', color, 10, 0, -10);
    this.text(local([depth, 0, -fh]), `FOV ${fovH.toFixed(0)}° × ${fovV.toFixed(0)}°`, color, 10, 0, 14);
  }

  /** An AprilTag as a square plate facing along its own +X, with a corner tick. */
  tagPlate(pose: Transform, size: number, color: string, label: string) {
    const h = size / 2;
    const face: Vec3[] = (
      [
        [0, h, h],
        [0, -h, h],
        [0, -h, -h],
        [0, h, -h],
      ] as Vec3[]
    ).map((v) => toParent(pose, v));
    this.poly(face, `${color}33`, color, 2);
    this.line(pose.t, toParent(pose, [size * 0.5, 0, 0]), color, 2);
    this.text(toParent(pose, [0, 0, h]), label, color, 10, 0, -10);
  }

  /** A vertical dashed drop to the floor, which is what sells the height. */
  dropLine(at: Vec3, label: string) {
    this.line([at[0], at[1], 0], at, this.palette.muted, 1, [3, 3]);
    if (label) this.text([at[0], at[1], 0], label, this.palette.muted, 10, 0, 12);
  }
}

/** Drag-to-orbit, shared by every viewer on the page. */
export function orbit(canvas: HTMLCanvasElement, view: Camera, redraw: () => void) {
  let dragging: { x: number; y: number; az: number; el: number } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = { x: e.clientX, y: e.clientY, az: view.az, el: view.el };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    view.az = dragging.az + (e.clientX - dragging.x) * 0.01;
    view.el = Math.max(0.05, Math.min(1.4, dragging.el + (e.clientY - dragging.y) * 0.01));
    redraw();
  });
  const stop = () => {
    dragging = null;
  };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  // Keyboard orbit, so the diagram is usable without a pointer.
  canvas.addEventListener('keydown', (e) => {
    const step = 0.12;
    if (e.key === 'ArrowLeft') view.az -= step;
    else if (e.key === 'ArrowRight') view.az += step;
    else if (e.key === 'ArrowUp') view.el = Math.min(1.4, view.el + step);
    else if (e.key === 'ArrowDown') view.el = Math.max(0.05, view.el - step);
    else return;
    e.preventDefault();
    redraw();
  });
}

export function fmt(v: number, digits = 2): string {
  const s = v.toFixed(digits);
  return s === `-${(0).toFixed(digits)}` ? (0).toFixed(digits) : s;
}
