"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Segment {
  areaFt2: number;
  pitchDegrees: number;
  azimuthDegrees: number;
}

interface Section {
  W: number;         // ridge length (feet)
  D: number;         // front eave to back eave (feet)
  H: number;         // ridge height above wall plate (feet)
  wallH: number;     // wall height (feet)
  pitchDegrees: number;
  pitchOver12: number;
  frontAzLabel: string; // "NE", "SW", etc.
  ox: number;        // x offset in 3D world
  oy: number;        // y offset in 3D world
  idx: number;
}

interface Point2D { sx: number; sy: number }
type ProjectFn = (x: number, y: number, z: number) => Point2D;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DEG = Math.PI / 180;
const COS30 = Math.cos(30 * DEG);
const SIN30 = 0.5;
const SCALE = 3.6;

function azDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function azLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function projectNE(x: number, y: number, z: number): Point2D {
  return {
    sx: (x - y) * COS30 * SCALE,
    sy: -((x + y) * SIN30 + z) * SCALE,
  };
}

function projectSE(x: number, y: number, z: number): Point2D {
  return {
    sx: (y - x) * COS30 * SCALE,
    sy: -((y + x) * SIN30 + z) * SCALE,
  };
}

function pts(arr: Point2D[]): string {
  return arr.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(" ");
}

function computeViewBox(sections: Section[], project: ProjectFn, pad = 18): string {
  const all: Point2D[] = [];
  for (const s of sections) {
    const { ox, oy, W, D, wallH, H } = s;
    [
      [ox, oy, 0], [ox + W, oy, 0], [ox, oy + D, 0], [ox + W, oy + D, 0],
      [ox, oy, wallH], [ox + W, oy, wallH], [ox, oy + D, wallH], [ox + W, oy + D, wallH],
      [ox, oy + D / 2, wallH + H], [ox + W, oy + D / 2, wallH + H],
    ].forEach(([x, y, z]) => all.push(project(x, y, z)));
  }
  const xs = all.map((p) => p.sx);
  const ys = all.map((p) => p.sy);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
  const h = Math.max(...ys) - Math.min(...ys) + pad * 2;
  return `${minX.toFixed(1)} ${minY.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Model derivation
// ─────────────────────────────────────────────────────────────────────────────

function pairSegments(segs: Segment[]): [Segment, Segment][] {
  const sorted = [...segs].sort((a, b) => b.areaFt2 - a.areaFt2);
  const used = new Set<number>();
  const pairs: [Segment, Segment][] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;
    let bestJ = -1, bestScore = Infinity;
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue;
      const diff = azDiff(sorted[i].azimuthDegrees, sorted[j].azimuthDegrees);
      if (diff >= 150 && diff <= 210) {
        const score = Math.abs(diff - 180);
        if (score < bestScore) { bestScore = score; bestJ = j; }
      }
    }
    if (bestJ >= 0) {
      pairs.push([sorted[i], sorted[bestJ]]);
      used.add(i); used.add(bestJ);
    }
  }

  // If no pairs found at all, create a fake symmetric pair from largest segment
  if (pairs.length === 0 && segs.length > 0) {
    const largest = sorted[0];
    const fake: Segment = { ...largest, areaFt2: largest.areaFt2 * 0.7, azimuthDegrees: (largest.azimuthDegrees + 180) % 360 };
    pairs.push([largest, fake]);
  }

  return pairs;
}

function buildSections(pairs: [Segment, Segment][], wallH: number): Section[] {
  let offsetX = 0;
  return pairs.map(([front, back], idx) => {
    const totalSloped = front.areaFt2 + back.areaFt2;
    const avgPitchDeg = (front.pitchDegrees + back.pitchDegrees) / 2;
    const pitchRad = avgPitchDeg * DEG;
    const groundArea = totalSloped * Math.cos(pitchRad);
    const AR = idx === 0 ? 1.8 : 1.4;
    const D = Math.sqrt(groundArea / AR);
    const W = AR * D;
    const H = (D / 2) * Math.tan(pitchRad);
    const pitchOver12 = Math.round(Math.tan(pitchRad) * 12);

    // Front = segment closest to NE (45°) = what the NE camera sees
    const cameraAz = 45;
    const frontSeg = azDiff(front.azimuthDegrees, cameraAz) <= azDiff(back.azimuthDegrees, cameraAz) ? front : back;

    const sec: Section = {
      W, D, H, wallH, pitchDegrees: avgPitchDeg, pitchOver12,
      frontAzLabel: azLabel(frontSeg.azimuthDegrees),
      ox: offsetX, oy: 0, idx,
    };
    offsetX += W + 8;
    return sec;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Single section SVG renderer
// ─────────────────────────────────────────────────────────────────────────────

function GableSection({ s, project, viewId }: { s: Section; project: ProjectFn; viewId: string }) {
  const { ox, oy, W, D, H, wallH, pitchOver12, frontAzLabel, idx } = s;
  const id = `${viewId}-s${idx}`;

  // 10 key 3D vertices
  const FL  = project(ox,     oy,         0);
  const FR  = project(ox + W, oy,         0);
  const BR  = project(ox + W, oy + D,     0);
  const BL  = project(ox,     oy + D,     0);
  const FLw = project(ox,     oy,         wallH);
  const FRw = project(ox + W, oy,         wallH);
  const BRw = project(ox + W, oy + D,     wallH);
  const BLw = project(ox,     oy + D,     wallH);
  const RL  = project(ox,     oy + D / 2, wallH + H);
  const RR  = project(ox + W, oy + D / 2, wallH + H);

  // Shingle lines
  const frontShingles: [Point2D, Point2D][] = [];
  const backShingles: [Point2D, Point2D][] = [];
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    frontShingles.push([
      project(ox,     oy + t * (D / 2), wallH + t * H),
      project(ox + W, oy + t * (D / 2), wallH + t * H),
    ]);
    backShingles.push([
      project(ox,     oy + D - t * (D / 2), wallH + t * H),
      project(ox + W, oy + D - t * (D / 2), wallH + t * H),
    ]);
  }

  // Centroid of front slope for label
  const labelPt = project(ox + W / 2, oy + D / 6, wallH + H * 0.5);
  const wallLabelPt = project(ox + W / 2, oy, wallH * 0.5);
  const ridgeLabelPt = project(ox + W / 2, oy + D / 2, wallH + H + 3);

  // Ground shadow ellipse center
  const shadowCenter = project(ox + W / 2, oy + D / 2, 0);
  const shadowRx = W * COS30 * SCALE * 0.48;
  const shadowRy = shadowRx * 0.18;

  return (
    <g>
      {/* Ground shadow */}
      <ellipse
        cx={shadowCenter.sx} cy={shadowCenter.sy + 4}
        rx={shadowRx} ry={shadowRy}
        fill="rgba(0,0,0,0.13)"
        filter={`url(#${viewId}-shadow)`}
      />

      {/* Clip paths */}
      <defs>
        <clipPath id={`${id}-front`}>
          <polygon points={pts([FLw, FRw, RR, RL])} />
        </clipPath>
        <clipPath id={`${id}-back`}>
          <polygon points={pts([BLw, BRw, RR, RL])} />
        </clipPath>
      </defs>

      {/* Back wall */}
      <polygon points={pts([BL, BR, BRw, BLw])} fill="#1e293b" />

      {/* Back slope */}
      <polygon points={pts([BLw, BRw, RR, RL])} fill="#2d3f55" />

      {/* Back shingle lines */}
      <g clipPath={`url(#${id}-back)`}>
        {backShingles.map(([a, b], i) => (
          <line key={i}
            x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy}
            stroke="rgba(0,0,0,0.07)" strokeWidth={0.9}
          />
        ))}
      </g>

      {/* Left gable end */}
      <polygon points={pts([FLw, BLw, RL])} fill="#263242" />

      {/* Right gable end */}
      <polygon points={pts([FRw, BRw, RR])} fill="#263242" />

      {/* Front slope */}
      <polygon points={pts([FLw, FRw, RR, RL])} fill="#475569" />

      {/* Front shingle lines */}
      <g clipPath={`url(#${id}-front)`}>
        {frontShingles.map(([a, b], i) => (
          <line key={i}
            x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy}
            stroke="rgba(255,255,255,0.07)" strokeWidth={0.9}
          />
        ))}
      </g>

      {/* Front slope subtle top highlight strip */}
      <polygon
        points={pts([
          project(ox,     oy + D / 2 * 0.75, wallH + H * 0.75),
          project(ox + W, oy + D / 2 * 0.75, wallH + H * 0.75),
          RR, RL,
        ])}
        fill="rgba(255,255,255,0.06)"
      />

      {/* Front wall */}
      <polygon points={pts([FL, FR, FRw, FLw])} fill="#18232f" />

      {/* Side wall (left) visible in SE view */}
      <polygon points={pts([FL, BL, BLw, FLw])} fill="#152030" />

      {/* Ridge line */}
      <line
        x1={RL.sx} y1={RL.sy} x2={RR.sx} y2={RR.sy}
        stroke="#f97316" strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Eave highlights */}
      <line x1={FL.sx} y1={FL.sy} x2={FR.sx} y2={FR.sy} stroke="#64748b" strokeWidth={1.2} />
      <line x1={FL.sx} y1={FL.sy} x2={BL.sx} y2={BL.sy} stroke="#64748b" strokeWidth={1.0} />
      <line x1={FR.sx} y1={FR.sy} x2={BR.sx} y2={BR.sy} stroke="#64748b" strokeWidth={0.8} />

      {/* Gable edge outlines */}
      <polyline points={pts([FLw, RL, BLw])} fill="none" stroke="#3d5270" strokeWidth={0.8} />
      <polyline points={pts([FRw, RR, BRw])} fill="none" stroke="#3d5270" strokeWidth={0.8} />

      {/* Ridge label */}
      <text
        x={ridgeLabelPt.sx} y={ridgeLabelPt.sy}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={7.5} fontFamily="monospace" fontWeight="bold"
        fill="#f97316" opacity={0.9}
      >
        {pitchOver12}/12
      </text>

      {/* Front slope direction label */}
      <text
        x={labelPt.sx} y={labelPt.sy}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={7} fontFamily="monospace"
        fill="rgba(255,255,255,0.65)"
      >
        {frontAzLabel}
      </text>

      {/* Wall label */}
      <text
        x={wallLabelPt.sx} y={wallLabelPt.sy}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={6} fontFamily="monospace"
        fill="rgba(255,255,255,0.35)"
      >
        {Math.round(W)}ft × {Math.round(D)}ft
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface RoofVisualizationProps {
  segments: Segment[];
  stories?: number;
}

export default function RoofVisualization({ segments, stories = 2 }: RoofVisualizationProps) {
  if (!segments || segments.length === 0) {
    return (
      <div className="mx-8 mt-5 bg-slate-100 rounded-xl p-6 text-center text-slate-400 text-sm">
        Roof geometry not available
      </div>
    );
  }

  const wallH = stories >= 3 ? 24 : stories >= 2 ? 16 : 9;
  const pairs = pairSegments(segments);
  const sections = buildSections(pairs, wallH);

  const vbA = computeViewBox(sections, projectNE);
  const vbB = computeViewBox(sections, projectSE);

  const defs = (viewId: string) => (
    <defs>
      <filter id={`${viewId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <linearGradient id={`${viewId}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#f1f5f9" />
      </linearGradient>
    </defs>
  );

  const renderView = (project: ProjectFn, viewId: string, vb: string) => {
    const [vbX, vbY, vbW, vbH] = vb.split(" ").map(Number);
    return (
      <svg
        viewBox={vb}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ maxHeight: 260 }}
      >
        {defs(viewId)}
        {/* Sky background */}
        <rect x={vbX} y={vbY} width={vbW} height={vbH} fill={`url(#${viewId}-sky)`} rx={8} />
        {/* Sections — paint back-to-front by x offset descending */}
        {[...sections].reverse().map((s) => (
          <GableSection key={s.idx} s={s} project={project} viewId={viewId} />
        ))}
      </svg>
    );
  };

  return (
    <div className="mt-5 mx-8">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        Roof Visualization — Isometric 3D
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* View A — NE camera */}
        <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-3">
          {renderView(projectNE, "a", vbA)}
          <p className="text-xs text-slate-400 text-center mt-1.5 font-medium">
            View A — From Northeast
          </p>
        </div>

        {/* View B — SE camera */}
        <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-3">
          {renderView(projectSE, "b", vbB)}
          <p className="text-xs text-slate-400 text-center mt-1.5 font-medium">
            View B — From Southeast
          </p>
        </div>
      </div>

      <p className="text-right text-xs text-slate-400 mt-1.5">
        Geometry derived from Google Solar API · Imagery {segments.length} segments
      </p>
    </div>
  );
}
