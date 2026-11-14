"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

/**
 * - `think`: a ring of swollen dots spreads from the center to the edge.
 * - `idle`: every dot grows and shrinks together, with optional center-to-edge ripple.
 * - `process`: the sheet breathes in a sweep from one side to the other.
 * - `load`: the think ring leaves every dot swollen until the sheet is full, then a second ring shrinks them back.
 * - `read`: a read head runs along each row in turn, like eyes across text, leaving a few rows fading behind it.
 * - `edit`: a few whole rows are typed in dot by dot, the cursor blinks, and the block lets go.
 * - `stream`: output lines of uneven length land row by row from the top, the newest brightest, like a terminal.
 * - `plan`: ticks forward to a stop, blinks, then carries on or steps back; at the end the sheet clears and starts over; or shows `progress`.
 */
export type DotSquareAnimation = "think" | "idle" | "process" | "load" | "read" | "edit" | "stream" | "plan";

export interface DotSquareProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /** Which animation the sheet runs. Changing it morphs the dots from the old animation into the new one; every other prop keeps its value. */
  animation?: DotSquareAnimation;
  /** Shape of each dot. */
  dotShape?: "round" | "square";
  /** Resting dot size in px. */
  dotSize?: number;
  /** How many times larger a dot grows at the peak of the animation. */
  scale?: number;
  /** Dots per row across the sheet. */
  density?: number;
  /** Canvas size in px (the sheet is square). */
  size?: number;
  /** Seconds for one ring to cross the sheet (think), one breath (idle), one dot's breath (process), one crossing of the fill or empty ring (load), one read of the sheet (read), one edit (edit), one pass of output lines down the sheet (stream) or ticking the whole sheet (plan). */
  duration?: number;
  /** Seconds to rest between loops (plan: seconds the full sheet holds before it clears). stream ignores it. */
  gap?: number;
  /** think and load: thickness of the ring of large (think) or changing (load) dots, as a fraction of the sheet radius. */
  ringWidth?: number;
  /** idle: seconds the edge lags behind the center. 0 breathes in sync. */
  ripple?: number;
  /** process: seconds the far side lags behind the near side. */
  spread?: number;
  /** read: rows the fading trail covers behind the read head. stream: older lines still lit behind the newest. */
  trail?: number;
  /** plan: how much of the plan is done (0–1), shown as that share of rows ticked; a change glides. Leave it out to tick and clear on a loop. */
  progress?: number;
  /** think and load: "out" or "in". process: "right" or "left". A value the animation doesn't take is ignored. */
  direction?: "out" | "in" | "right" | "left";
  /** Dot color, any CSS color. */
  color?: string;
  /** Opacity of resting dots (0–1). Dots at full size are always 1. */
  minOpacity?: number;
  /** Coast to a stop on the current frame. Turning it back off eases the animation back up to speed. */
  paused?: boolean;
  /** Accessible name; the wrapper is role="status". */
  label?: string;
}

type Motion = {
  duration: number;
  gap: number;
  ringWidth: number;
  ripple: number;
  spread: number;
  trail: number;
  progress: number | undefined;
  thinkDirection: "out" | "in";
  processDirection: "right" | "left";
};

const ANIMATIONS: DotSquareAnimation[] = ["think", "idle", "process", "load", "read", "edit", "stream", "plan"];

/** Used for any prop that isn't passed. The same for every animation, so switching animation changes nothing else. */
const DEFAULTS: Motion = { duration: 1.6, gap: 0.3, ringWidth: 0.35, ripple: 0, spread: 0.9, trail: 3, progress: undefined, thinkDirection: "out", processDirection: "right" };

/**
 * Where the shared default would break an animation, its own default for props that aren't passed: at 1.6s the
 * read head would race through the sheet faster than anything reads, and a plan's rows would tick off too fast to
 * read as items.
 */
const OWN: Partial<Record<DotSquareAnimation, Partial<Motion>>> = { read: { duration: 3.5, gap: 0.4 }, plan: { duration: 4, gap: 0.6 } };

type Settings = SheetSettings & Motion & { animation: DotSquareAnimation };

/** Every number any of the animations reads, plus how much of each is on screen. */
function targetsOf(s: Settings) {
  return {
    ...sheetTargets(s),
    ...thinkMotion.targets({ ...s, direction: s.thinkDirection }),
    ...idleMotion.targets(s),
    ...processMotion.targets({ ...s, direction: s.processDirection }),
    ...readMotion.targets(s),
    ...streamMotion.targets(s),
    ...planMotion.targets(s),
    ...mixTargets(ANIMATIONS, s.animation),
  };
}

function scene() {
  return sheetMixScene({ think: thinkMotion, idle: idleMotion, process: processMotion, load: loadMotion, read: readMotion, edit: editMotion, stream: streamMotion, plan: planMotion });
}

const shape = sheetShape("square");

export function DotSquare({
  animation = "think",
  dotShape = "round",
  dotSize = 2.5,
  scale = 1.5,
  density = 11,
  size = 160,
  duration,
  gap,
  ringWidth,
  ripple,
  spread,
  trail,
  progress,
  direction,
  color = "#e4e4e7",
  minOpacity = 0.25,
  paused = false,
  label = "Thinking",
  ...rest
}: DotSquareProps) {
  const active = ANIMATIONS.includes(animation) ? animation : "think";
  const motion = withDefaults({ ...DEFAULTS, ...OWN[active] }, {
    duration,
    gap,
    ringWidth,
    ripple,
    spread,
    trail,
    progress,
    thinkDirection: direction === "out" || direction === "in" ? direction : undefined,
    processDirection: direction === "right" || direction === "left" ? direction : undefined,
  });
  const settings: Settings = { animation: active, dotShape, dotSize, scale, density, size, color, minOpacity, paused, ...motion };
  return <LoaderCanvas settings={settings} targets={targetsOf} shape={shape} settle={sheetSettle} scene={scene} label={label} {...rest} />;
}

export default DotSquare;

/**
 * Glide times are a spring's time constant, not a duration: a glide is about 90% of the way to its target
 * after twice its time, so `SETTLE` reads as a ~240ms change.
 */

/** Seconds (roughly) a changed prop takes to glide to its new value: size, spacing, timing and the like. */
const SETTLE = 0.12;

/** Color and opacity: faster, since nothing moves (~150ms). */
const FADE_SETTLE = 0.075;

/** Changing animation: one motion blending into the next (~300ms). */
const BLEND_SETTLE = 0.15;

/** Pausing: seconds (roughly) the animation takes to coast to a stop (~300ms). */
const STOP_SETTLE = 0.15;

/** Resuming: seconds (roughly) the animation takes to get back up to speed (~400ms). */
const START_SETTLE = 0.2;

/** A value that glides toward its target on a critically damped spring: no jump, no overshoot. */
type Glide = { value: number; velocity: number; target: number };

function glide(value: number): Glide {
  return { value, velocity: 0, target: value };
}

function snap(g: Glide) {
  g.value = g.target;
  g.velocity = 0;
}

/** Moves `g` toward its target. Returns false once it has arrived and is at rest. */
function stepGlide(g: Glide, dt: number, time: number) {
  if (g.value === g.target && g.velocity === 0) return false;
  const omega = 2 / time;
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = g.value - g.target;
  const temp = (g.velocity + omega * change) * dt;
  g.velocity = (g.velocity - omega * temp) * decay;
  g.value = g.target + (change + temp) * decay;
  if (Math.abs(g.value - g.target) < 1e-3 && Math.abs(g.velocity) < 1e-3) snap(g);
  return true;
}

/** The glided value of every target, plus the canvas `size` and the pause `rate` (0 paused, 1 running). */
type Values<K extends string> = Record<K | "size" | "rate", number>;

/** What a scene sees each frame. `layers` holds every shape on screen; more than one while a change cross-fades. */
interface Frame<S, K extends string, L> {
  settings: S;
  v: Values<K>;
  layers: { shape: L; fade: number }[];
  size: number;
  /** The viewer asked for reduced motion: the clock holds still, so a scene that ends somewhere should jump there. */
  reduced: boolean;
}

interface Scene<S, K extends string, L> {
  /** Moves the scene's own clock on by `dt` seconds. Scale by `v.rate` so pausing coasts to a stop. */
  advance?(dt: number, frame: Frame<S, K, L>): void;
  /** Paints one frame onto a cleared canvas, already scaled to `size` px. */
  draw(ctx: CanvasRenderingContext2D, frame: Frame<S, K, L>): void;
}

interface LoaderCanvasProps<S extends { size: number; paused: boolean }, K extends string, L>
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /** The latest props. Read by `targets` and `shape` on every render, and by the scene every frame. */
  settings: S;
  /** Every number the scene reads, as the latest settings want it. Each glides to its new value. */
  targets: (s: NoInfer<S>) => Record<K, number>;
  /**
   * Geometry rebuilt when its key changes. The old shape's fade glides to 0 while the new one's glides to 1:
   * a plain cross-fade, unless `morph` links the two so the scene can move one into the other.
   */
  shape?: {
    key: (s: NoInfer<S>) => string;
    build: (s: NoInfer<S>) => L;
    /** Called when `to` replaces `from`, whose fade is `fade` at that moment. */
    morph?: (from: L, to: L, fade: number) => void;
    /** Seconds (roughly) a shape change takes. Defaults to `BLEND_SETTLE`. */
    settle?: number;
  };
  /** Seconds (roughly) each target takes to glide to a new value, by key. Unlisted keys take `SETTLE`. */
  settle?: Partial<Record<NoInfer<K> | "size", number>>;
  /** Seconds (roughly) pausing takes to coast to a stop, and resuming to get back up to speed. */
  pause?: { stop: number; start: number };
  /** Called once on mount; the returned scene keeps its own clock between frames. */
  scene: () => Scene<NoInfer<S>, K, L>;
  label: string;
}

/**
 * A square canvas that runs a scene: props glide instead of jumping, pausing coasts, shape changes
 * cross-fade or morph, reduced motion holds still, and the loop sleeps once nothing is moving.
 */
function LoaderCanvas<S extends { size: number; paused: boolean }, K extends string, L>({
  settings,
  targets,
  shape,
  settle,
  pause,
  scene,
  label,
  className,
  style,
  ...rest
}: LoaderCanvasProps<S, K, L>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Only the first size reaches the DOM through React; after that the loop glides it.
  const [initialSize] = useState(settings.size);
  const latest = useRef({ settings, targets, shape, settle, pause, scene });
  const wakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    latest.current = { settings, targets, shape, settle, pause, scene };
    wakeRef.current?.();
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrapper || !canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const { settings: first, shape: shapeOf, scene: makeScene } = latest.current;
    const sceneNow = makeScene();
    const glides = {} as Record<string, Glide>;
    const v = {} as Values<K>;
    let shapes = shapeOf ? [{ key: shapeOf.key(first), shape: shapeOf.build(first), fade: glide(1) }] : [];
    const frameInfo: Frame<S, K, L> = { settings: first, v, layers: [], size: 1, reduced: reduceMotion.matches };
    let shownSize = -1;
    let frame = 0;
    let last = 0;
    // Off screen or in a hidden tab, the loop sleeps; it picks up where it left off once seen again.
    // Starts asleep: the observer's first report wakes it, so a page of loaders only paints the ones in view.
    let onScreen = false;
    const visible = () => onScreen && document.visibilityState === "visible";

    const targetsNow = () => {
      const { settings: s, targets } = latest.current;
      return { ...targets(s), size: s.size, rate: s.paused ? 0 : 1 } as Record<string, number>;
    };
    for (const [k, value] of Object.entries(targetsNow())) glides[k] = glide(value);

    /** Refreshes what the scene reads from the glides and shapes. */
    const read = () => {
      for (const k in glides) (v as Record<string, number>)[k] = glides[k].value;
      frameInfo.settings = latest.current.settings;
      frameInfo.layers = shapes.map(({ shape, fade }) => ({ shape, fade: fade.value }));
      frameInfo.size = Math.max(1, v.size);
      frameInfo.reduced = reduceMotion.matches;
    };

    const sync = () => {
      const { settings: s, shape: shapeOf } = latest.current;
      for (const [k, value] of Object.entries(targetsNow())) glides[k].target = value;
      if (shapeOf) {
        const key = shapeOf.key(s);
        if (key !== shapes[shapes.length - 1].key) {
          for (const shape of shapes) shape.fade.target = 0;
          const fade = glide(0);
          fade.target = 1;
          const prev = shapes[shapes.length - 1];
          const next = { key, shape: shapeOf.build(s), fade };
          shapeOf.morph?.(prev.shape, next.shape, prev.fade.value);
          shapes.push(next);
        }
      }
      // Reduced motion: hold still and apply changes at once.
      if (reduceMotion.matches) {
        glides.rate.target = 0;
        for (const g of Object.values(glides)) snap(g);
        for (const shape of shapes) snap(shape.fade);
      }
    };

    const draw = () => {
      read();
      const size = frameInfo.size;
      if (size !== shownSize) {
        shownSize = size;
        wrapper.style.width = wrapper.style.height = `${size}px`;
        canvas.style.width = canvas.style.height = `${size}px`;
        const px = Math.round(size * dpr);
        if (canvas.width !== px) canvas.width = canvas.height = px;
      }
      ctx.setTransform(canvas.width / size, 0, 0, canvas.width / size, 0, 0);
      ctx.clearRect(0, 0, size, size);
      sceneNow.draw(ctx, frameInfo);
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      let moving = false;
      const times: Partial<Record<string, number>> = latest.current.settle ?? {};
      const pauseTimes = latest.current.pause;
      for (const [k, g] of Object.entries(glides)) {
        // Stopping and starting take their own times; every other target its own, else `SETTLE`.
        const time =
          k === "rate"
            ? g.target > 0
              ? (pauseTimes?.start ?? START_SETTLE)
              : (pauseTimes?.stop ?? STOP_SETTLE)
            : (times[k] ?? SETTLE);
        if (stepGlide(g, dt, time)) moving = true;
      }
      const shapeSettle = latest.current.shape?.settle ?? BLEND_SETTLE;
      for (const shape of shapes) if (stepGlide(shape.fade, dt, shapeSettle)) moving = true;
      shapes = shapes.filter((shape) => shape.fade.target > 0 || shape.fade.value > 0);

      if (sceneNow.advance) {
        read();
        sceneNow.advance(dt, frameInfo);
      }
      draw();
      // Sleep once everything has settled and the animation is paused, or nobody can see it.
      frame = visible() && (moving || glides.rate.value > 0) ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      sync();
      if (frame || !visible()) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const sleepOrWake = () => {
      if (visible()) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sleepOrWake();
      },
      { rootMargin: "64px" },
    );
    observer.observe(wrapper);

    wakeRef.current = wake;
    reduceMotion.addEventListener("change", wake);
    document.addEventListener("visibilitychange", sleepOrWake);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      wakeRef.current = null;
      observer.disconnect();
      reduceMotion.removeEventListener("change", wake);
      document.removeEventListener("visibilitychange", sleepOrWake);
    };
  }, []);

  const wrapperStyle: CSSProperties = { width: initialSize, height: initialSize, ...style };

  return (
    <div ref={wrapperRef} role="status" aria-label={label} className={className} style={wrapperStyle} {...rest}>
      <canvas ref={canvasRef} style={{ width: initialSize, height: initialSize, display: "block" }} />
    </div>
  );
}

let probe: CanvasRenderingContext2D | null = null;

/** Resolves any CSS color to sRGB [r, g, b, a] by painting it into one pixel, so it can be blended. */
function parseColor(color: string): [number, number, number, number] {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [228, 228, 231, 1];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000"; // An invalid color leaves fillStyle as it was, so start from a known one.
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/** A CSS color as glide targets, so a color change blends instead of jumping. */
function colorTargets(color: string) {
  const [red, green, blue, alpha] = parseColor(color);
  return { red, green, blue, alpha };
}

/** The blended color as an opaque CSS color; its alpha is applied per dot through globalAlpha. */
function rgb(v: { red: number; green: number; blue: number }) {
  return `rgb(${v.red} ${v.green} ${v.blue})`;
}

/** Glide key for how much of animation `A` is on screen: 1 while it is the active one, 0 when it is gone. */
type MixKey<A extends string> = `mix_${A}`;

/** One mix target per animation: 1 for the active one, 0 for the rest. They glide, so a switch cross-fades. */
function mixTargets<A extends string>(names: readonly A[], active: A) {
  const out = {} as Record<MixKey<A>, number>;
  for (const name of names) out[`mix_${name}`] = name === active ? 1 : 0;
  return out;
}

/** `defaults` with every prop that was actually passed laid over it; an `undefined` prop keeps the default. */
function withDefaults<T extends object>(defaults: T, props: { [P in keyof T]?: T[P] }): T {
  const out = { ...defaults };
  for (const key in props) {
    const value = props[key];
    if (value !== undefined) out[key] = value as T[typeof key];
  }
  return out;
}

/** Square lays the dots on a grid; circle on concentric rings, so the outline is a true circle. */
type SheetLayout = "square" | "circle";

/**
 * A dot in -1..1 plus its distance from the center, measured along the sheet's own outline. `row` is its line
 * (grid row from the top, or ring from the center), `col` how far along that line it sits (0–1), and `rows`
 * how many lines the sheet has, so motions can follow the pattern's own order.
 */
type SheetDot = { u: number; v: number; d: number; row: number; col: number; rows: number };

/** Props every flat dot sheet takes. */
interface SheetSettings {
  dotShape: "round" | "square";
  dotSize: number;
  scale: number;
  density: number;
  size: number;
  color: string;
  minOpacity: number;
  paused: boolean;
}

function buildSheet(layout: SheetLayout, n: number) {
  const dots: SheetDot[] = [];

  if (layout === "circle") {
    // Concentric rings with near-equal arc spacing, so the outline is a true circle.
    const rings = Math.max(1, Math.round((n - 1) / 2));
    dots.push({ u: 0, v: 0, d: 0, row: 0, col: 0, rows: rings + 1 });
    for (let k = 1; k <= rings; k++) {
      const r = k / rings;
      const count = Math.round(2 * Math.PI * k);
      for (let j = 0; j < count; j++) {
        const a = (j / count) * Math.PI * 2 - Math.PI / 2;
        dots.push({ u: Math.cos(a) * r, v: Math.sin(a) * r, d: r, row: k, col: j / count, rows: rings + 1 });
      }
    }
    return dots;
  }

  // A plain grid. Chebyshev distance makes rings square too.
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const u = (col / (n - 1)) * 2 - 1;
      const v = (row / (n - 1)) * 2 - 1;
      dots.push({ u, v, d: Math.max(Math.abs(u), Math.abs(v)), row, col: col / n, rows: n });
    }
  }
  return dots;
}

/** Fills one dot. `round` 0 is a square, 1 a circle, and anything between a rounded square. */
function fillDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, round: number) {
  if (round >= 1) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  } else if (round <= 0 || !ctx.roundRect) {
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  } else {
    ctx.beginPath();
    ctx.roundRect(x - r, y - r, r * 2, r * 2, r * round);
    ctx.fill();
  }
}

/** The sheet's own glide targets; spread these into a component's targets. */
function sheetTargets(s: SheetSettings) {
  return {
    ...colorTargets(s.color),
    dotSize: s.dotSize,
    scale: s.scale,
    minOpacity: s.minOpacity,
    round: s.dotShape === "round" ? 1 : 0,
  };
}

type SheetKey = keyof ReturnType<typeof sheetTargets>;

/**
 * Seconds (roughly) each sheet target takes to glide to a new value; anything unlisted (size, dot size,
 * scale, timing) takes `SETTLE`. Shared by the single loaders and DotSquare / DotCircle.
 */
const sheetSettle = {
  // Color and opacity: nothing moves, so they change quicker.
  red: FADE_SETTLE,
  green: FADE_SETTLE,
  blue: FADE_SETTLE,
  alpha: FADE_SETTLE,
  minOpacity: FADE_SETTLE,
  // Dot shape and direction morph the dots through an in-between, so they take as long as an animation switch.
  round: BLEND_SETTLE,
  inward: BLEND_SETTLE,
  leftward: BLEND_SETTLE,
  mix_think: BLEND_SETTLE,
  mix_idle: BLEND_SETTLE,
  mix_process: BLEND_SETTLE,
  mix_load: BLEND_SETTLE,
  mix_read: BLEND_SETTLE,
  mix_edit: BLEND_SETTLE,
  mix_ping: BLEND_SETTLE,
  mix_stream: BLEND_SETTLE,
  mix_plan: BLEND_SETTLE,
  mix_upload: BLEND_SETTLE,
  mix_await: BLEND_SETTLE,
  mix_search: BLEND_SETTLE,
};

/** The dots for `layout`. A density change cross-fades the old sheet out while the new one fades in. */
function sheetShape(layout: SheetLayout) {
  const rows = (s: SheetSettings) => Math.max(3, Math.round(s.density));
  return { key: (s: SheetSettings) => String(rows(s)), build: (s: SheetSettings) => buildSheet(layout, rows(s)) };
}

/**
 * One way a sheet can move. `cycle` is the seconds in one loop; `swell` returns, for time `t` into
 * that loop, each dot's swell (0 resting, 1 at full size).
 */
interface SheetMotion<K extends string> {
  cycle(v: Values<K | SheetKey>): number;
  swell(t: number, v: Values<K | SheetKey>): (dot: SheetDot) => number;
}

/** A motion's place in its own loop (0–1). Advancing it by rate keeps the motion continuous while the timing glides, and lets pausing coast to a stop. */
function sheetClock<K extends string>(motion: SheetMotion<K>) {
  let phase = 0;
  return {
    advance(dt: number, v: Values<K | SheetKey>) {
      phase = (phase + (dt * v.rate) / motion.cycle(v)) % 1;
    },
    swellOf(v: Values<K | SheetKey>) {
      return motion.swell(phase * motion.cycle(v), v);
    },
  };
}

/** Paints every sheet on screen, each dot swollen by `swellOf`. */
function drawSheet(ctx: CanvasRenderingContext2D, { v, layers, size }: Frame<SheetSettings, SheetKey, SheetDot[]>, swellOf: (dot: SheetDot) => number) {
  const dotSize = Math.max(0, v.dotSize);
  const scale = v.scale;
  const minOpacity = v.minOpacity;
  const round = v.round;
  const center = size / 2;
  // Inset by the largest dot so a fully scaled edge dot is never clipped.
  const reach = center - (dotSize * Math.max(1, scale)) / 2;

  ctx.fillStyle = rgb(v);
  for (const { shape, fade } of layers) {
    const alpha = v.alpha * fade;
    for (const dot of shape) {
      const s = swellOf(dot);
      const r = (dotSize / 2) * (1 + (scale - 1) * s);
      ctx.globalAlpha = alpha * (minOpacity + (1 - minOpacity) * s);
      fillDot(ctx, center + dot.u * reach, center + dot.v * reach, r, round);
    }
  }
}

/**
 * A sheet that runs several motions, each weighted by its `mix_<name>` glide. Each dot's swell is the
 * weighted blend, so switching the active motion morphs one into the other on the same dots.
 */
function sheetMixScene<A extends string, K extends string>(
  motions: Record<A, SheetMotion<K>>,
): Scene<SheetSettings, K | SheetKey | MixKey<A>, SheetDot[]> {
  const live = (Object.keys(motions) as A[]).map((name) => ({ key: `mix_${name}` as MixKey<A>, clock: sheetClock(motions[name]) }));
  return {
    advance(dt, { v }) {
      for (const { key, clock } of live) if (v[key] > 0) clock.advance(dt, v);
    },
    draw(ctx, frame) {
      const { v } = frame;
      const parts = live.filter(({ key }) => v[key] > 0).map(({ key, clock }) => ({ weight: v[key], swellOf: clock.swellOf(v) }));
      drawSheet(ctx, frame, (dot) => {
        let s = 0;
        for (const { weight, swellOf } of parts) s += weight * swellOf(dot);
        return s;
      });
    },
  };
}

/** A CSS `cubic-bezier(x1, y1, x2, y2)` as a function of progress 0..1. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const curveX = (s: number) => ((ax * s + bx) * s + cx) * s;
  const curveY = (s: number) => ((ay * s + by) * s + cy) * s;
  const slopeX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    // Newton's method finds the curve parameter whose x is `t`; bisection catches the flat spots.
    let s = t;
    for (let i = 0; i < 6; i++) {
      const dx = curveX(s) - t;
      const slope = slopeX(s);
      if (Math.abs(dx) < 1e-6) return curveY(s);
      if (Math.abs(slope) < 1e-6) break;
      s -= dx / slope;
    }
    let lo = 0;
    let hi = 1;
    s = t;
    for (let i = 0; i < 20; i++) {
      const x = curveX(s);
      if (Math.abs(x - t) < 1e-6) break;
      if (x < t) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return curveY(s);
  };
}

/** Strong ease-out, `cubic-bezier(0.23, 1, 0.32, 1)`: for things arriving or leaving. */
const easeOut = cubicBezier(0.23, 1, 0.32, 1);

/** Strong ease-in-out, `cubic-bezier(0.77, 0, 0.175, 1)`: for things moving or morphing on screen. */
const easeInOut = cubicBezier(0.77, 0, 0.175, 1);

/**
 * Every way a flat dot sheet can move. Each motion turns its props into glide targets and says how
 * much each dot swells over time, so single loaders and the switchable DotSquare / DotCircle agree.
 */

interface ThinkSettings {
  duration: number;
  gap: number;
  ringWidth: number;
  direction: "out" | "in";
}

/** A ring of swollen dots spreads from the center to the edge (or closes in). */
const thinkMotion = {
  targets(s: ThinkSettings) {
    return {
      duration: s.duration,
      gap: s.gap,
      ringWidth: s.ringWidth,
      // 0 spreads out from the center, 1 closes in from the edge; between, the ring flattens across.
      inward: s.direction === "in" ? 1 : 0,
    };
  },
  cycle: (v) => Math.max(0.05, v.duration) + Math.max(0, v.gap),
  swell: (t, v) => {
    const turn = Math.max(0.05, v.duration);
    const width = Math.max(0.05, v.ringWidth);
    const inward = v.inward;
    // The ring starts fully inside the center and ends fully past the edge, so
    // every dot gets one complete swell. During the gap it sits off-sheet.
    const ring = t < turn ? -width + (t / turn) * (1 + 2 * width) : Infinity;
    return ({ d }) => {
      const distance = d + (1 - 2 * d) * inward;
      const x = Math.abs(distance - ring) / width;
      // Cosine bump: 1 at the ring's center line, easing to 0 at its edges.
      return x < 1 ? 0.5 + 0.5 * Math.cos(Math.PI * x) : 0;
    };
  },
} satisfies SheetMotion<"duration" | "gap" | "ringWidth" | "inward"> & { targets: unknown };

/** The pulse's ring swells each dot and leaves it swollen until the whole sheet is full, then a second pass shrinks them back in the same order. */
const loadMotion = {
  targets: thinkMotion.targets,
  cycle: (v) => 2 * Math.max(0.05, v.duration) + Math.max(0, v.gap),
  swell: (t, v) => {
    const turn = Math.max(0.05, v.duration);
    const width = Math.max(0.05, v.ringWidth);
    const inward = v.inward;
    // The front crosses the sheet once to fill it, then again to empty it. During the gap every dot rests.
    const emptying = t >= turn;
    const local = emptying ? t - turn : t;
    const front = local < turn ? -width + (local / turn) * (1 + 2 * width) : -Infinity;
    return ({ d }) => {
      if (front === -Infinity) return 0;
      const distance = d + (1 - 2 * d) * inward;
      // How far the front has passed this dot: 0 not yet reached, 1 fully past. Each dot grows (or shrinks)
      // once and holds, so it takes the strong ease-in-out of an on-screen morph rather than a soft sine.
      const x = Math.min(1, Math.max(0, (front - distance) / width + 0.5));
      const passed = easeInOut(x);
      return emptying ? 1 - passed : passed;
    };
  },
} satisfies SheetMotion<"duration" | "gap" | "ringWidth" | "inward"> & { targets: unknown };

interface IdleSettings {
  duration: number;
  gap: number;
  ripple: number;
}

/** Every dot grows and shrinks together, with an optional center-to-edge lag. */
const idleMotion = {
  targets(s: IdleSettings) {
    return { duration: s.duration, gap: s.gap, ripple: s.ripple };
  },
  cycle: (v) => Math.max(0.05, v.duration) + Math.max(0, v.gap) + Math.max(0, v.ripple),
  swell: (t, v) => {
    const breath = Math.max(0.05, v.duration);
    const ripple = Math.max(0, v.ripple);
    const cycle = breath + Math.max(0, v.gap) + ripple;
    return ({ d }) => {
      // Each dot runs the same breath, delayed by its distance from the center.
      const local = (((t - d * ripple) % cycle) + cycle) % cycle;
      // One cosine swell 0 → 1 → 0 across the breath, then rest at 0.
      return local < breath ? 0.5 - 0.5 * Math.cos((2 * Math.PI * local) / breath) : 0;
    };
  },
} satisfies SheetMotion<"duration" | "gap" | "ripple"> & { targets: unknown };

interface ProcessSettings {
  duration: number;
  gap: number;
  spread: number;
  direction: "right" | "left";
}

/** The sheet breathes in a sweep from one side to the other. */
const processMotion = {
  targets(s: ProcessSettings) {
    return {
      duration: s.duration,
      gap: s.gap,
      spread: s.spread,
      // 0 travels right, 1 travels left; between, the sweep evens out before turning around.
      leftward: s.direction === "left" ? 1 : 0,
    };
  },
  cycle: (v) => Math.max(0.05, v.duration) + Math.max(0, v.gap) + Math.max(0, v.spread),
  swell: (t, v) => {
    const breath = Math.max(0.05, v.duration);
    const lag = Math.max(0, v.spread);
    const cycle = breath + Math.max(0, v.gap) + lag;
    const leftward = v.leftward;
    return ({ u }) => {
      // Each dot runs the same breath, delayed by how far across the sheet it sits.
      const across = (u + 1) / 2 - u * leftward;
      const local = (((t - across * lag) % cycle) + cycle) % cycle;
      // One cosine swell 0 → 1 → 0 across the breath, then rest at 0.
      return local < breath ? 0.5 - 0.5 * Math.cos((2 * Math.PI * local) / breath) : 0;
    };
  },
} satisfies SheetMotion<"duration" | "gap" | "spread" | "leftward"> & { targets: unknown };

/** Cosine bump: 1 where `x` is 0, easing to 0 at ±1 and beyond. */
function bump(x: number) {
  return Math.abs(x) < 1 ? 0.5 + 0.5 * Math.cos(Math.PI * x) : 0;
}

interface ReadSettings {
  duration: number;
  gap: number;
  trail: number;
}

/** Rows a dot takes to grow once the read head reaches it: about two dots, so the head reads as one point. */
const READ_RISE = 0.2;

/** A read head runs along each row in turn, like eyes across lines of text, leaving a few rows fading behind it. */
const readMotion = {
  targets(s: ReadSettings) {
    return { duration: s.duration, gap: s.gap, trail: s.trail };
  },
  cycle: (v) => Math.max(0.05, v.duration) + Math.max(0, v.gap),
  swell: (t, v) => {
    const duration = Math.max(0.05, v.duration);
    const trail = Math.max(READ_RISE * 2, v.trail);
    return ({ row, col, rows }) => {
      if (t >= duration) return 0;
      // The head moves at a steady pace (linear), from before the first dot until the trail clears the last row.
      const head = (t / duration) * (rows + trail);
      const age = head - (row + col);
      if (age < 0 || age >= trail) return 0;
      // A dot snaps up as the head arrives (ease-out), then fades softly over the trail.
      if (age < READ_RISE) return easeOut(age / READ_RISE);
      return bump((age - READ_RISE) / (trail - READ_RISE));
    };
  },
} satisfies SheetMotion<"duration" | "gap" | "trail"> & { targets: unknown };

interface EditSettings {
  duration: number;
  gap: number;
}

/** Each edit's block of rows: where it starts (as a share of the rows it can start on) and how many rows it covers. */
const EDIT_HUNKS = [
  { at: 0.25, size: 3 },
  { at: 0.75, size: 2 },
  { at: 0, size: 2 },
  { at: 0.55, size: 3 },
];

/** Shares of one edit: rows are typed until `WRITE`, held until `HOLD` (the cursor blinks), then let go. */
const EDIT_WRITE = 0.55;

const EDIT_HOLD = 0.82;

/** Seconds one dot takes to grow as it's typed. */
const EDIT_GROW = 0.18;

/**
 * A few whole rows are typed in, dot by dot in reading order, like the changed lines of a diff. The last dot
 * blinks once as a cursor, then the block lets go and the next edit lands somewhere else on the sheet.
 */
const editMotion = {
  targets(s: EditSettings) {
    return { duration: s.duration, gap: s.gap };
  },
  cycle: (v) => EDIT_HUNKS.length * (Math.max(0.2, v.duration) + Math.max(0, v.gap)),
  swell: (t, v) => {
    const duration = Math.max(0.2, v.duration);
    const slot = duration + Math.max(0, v.gap);
    const hunk = EDIT_HUNKS[Math.min(EDIT_HUNKS.length - 1, Math.floor(t / slot))];
    const local = t - Math.floor(t / slot) * slot;
    const write = duration * EDIT_WRITE;
    const hold = duration * EDIT_HOLD;
    return ({ row, col, rows }) => {
      if (local >= duration) return 0;
      const size = Math.min(hunk.size, rows);
      const start = Math.round(hunk.at * (rows - size));
      const step = row - start + col;
      if (step < 0 || step >= size) return 0;
      // Typed at a steady pace; each dot grows in with an ease-out as the cursor reaches it.
      const typed = easeOut(Math.min(1, Math.max(0, (local - (step / size) * write) / EDIT_GROW)));
      if (local < hold) {
        // The last dot typed is the cursor: one smooth blink off and back while the block holds.
        const last = row === start + size - 1 && col >= (rows - 1) / rows - 1e-6;
        if (!last || local < write) return typed;
        return typed * (1 - bump(((local - write) / (hold - write)) * 2 - 1));
      }
      // The whole block lets go together, easing out.
      return typed * (1 - easeOut((local - hold) / (duration - hold)));
    };
  },
} satisfies SheetMotion<"duration" | "gap"> & { targets: unknown };

interface StreamSettings {
  duration: number;
  trail: number;
}

/** Lines the print takes to cross one row, and a dot takes to grow once printed. A line lands well before the next. */
const STREAM_PRINT = 0.5;

const STREAM_RISE = 1;

/** How far along its row output line `line` reaches (0–1). Fixed per line, so the loop repeats exactly; about one in six is full. */
function streamLength(line: number) {
  const x = Math.sin(line * 12.9898 + 78.233) * 43758.5453;
  return 0.25 + 0.9 * (x - Math.floor(x));
}

/**
 * Output lines of uneven length print row by row from the top, like a terminal. The newest line is brightest and
 * each one steps down as the next lands, so it reads as scrolling while no dot moves. After the last row the
 * lines wrap back to the top; the loop runs two passes, so the line lengths change between them.
 */
const streamMotion = {
  targets(s: StreamSettings) {
    return { duration: s.duration, trail: s.trail };
  },
  cycle: (v) => 2 * Math.max(0.2, v.duration),
  swell: (t, v) => {
    const duration = Math.max(0.2, v.duration);
    const trail = Math.max(1, v.trail);
    return ({ row, col, rows }) => {
      // Lines land at a steady pace (linear), one per row. `age` is how many lines ago this row's latest one landed.
      const since = (t / duration) * rows - row;
      const age = ((since % rows) + rows) % rows;
      const pass = ((Math.floor(since / rows) % 2) + 2) % 2;
      if (col >= streamLength(row + pass * rows)) return 0;
      // The line prints left to right, each dot snapping up as it's printed (ease-out).
      const printed = age - col * STREAM_PRINT;
      if (printed < 0) return 0;
      const grow = easeOut(Math.min(1, printed / STREAM_RISE));
      if (age < 1) return grow;
      // Each newer line knocks this one down a step, quickly (ease-out), until it's gone after `trail` steps.
      const older = age - 1;
      const level = 1 - (Math.floor(older) + easeOut(older - Math.floor(older))) / trail;
      return grow * Math.max(0, level);
    };
  },
} satisfies SheetMotion<"duration" | "trail"> & { targets: unknown };

interface PlanSettings {
  duration: number;
  gap: number;
  progress?: number;
}

/**
 * Where the plan stops, as shares of the sheet's dots in reading order. Each pass starts from empty and wanders
 * forward or back to each stop in turn; a pass always ends on 1, the full sheet, which clears instead of turning back.
 */
const PLAN_PASSES = [
  [0.35, 0.6, 0.42, 0.78, 1],
  [0.22, 0.5, 0.31, 0.66, 0.88, 1],
  [0.45, 0.27, 0.71, 1],
];

/** Seconds the shortest move takes, so a step of a few dots still reads as a move. */
const PLAN_MIN_MOVE = 0.35;

/** Seconds the plan waits at each stop while the dot it stopped on blinks twice. */
const PLAN_STOP = 0.8;

/** Seconds the full sheet takes to clear from the top row to the bottom, each row's let-go, and the rest after. */
const PLAN_CLEAR = 0.6;

const PLAN_LET_GO = 0.2;

const PLAN_REST = 0.3;

/** How far the next dot to tick breathes while a progress is shown, so a still list still reads as working. */
const PLAN_BLINK = 0.5;

/** Every move in the loop, from where the last one stopped to the next stop, with the pause that follows it. */
function planMoves(duration: number, gap: number) {
  const moves: { from: number; to: number; travel: number; pause: number }[] = [];
  for (const stops of PLAN_PASSES) {
    let from = 0;
    for (const to of stops) {
      // A move takes its share of a full crossing, so the front always runs at the same pace.
      const travel = Math.max(PLAN_MIN_MOVE, Math.abs(to - from) * duration);
      moves.push({ from, to, travel, pause: to >= 1 ? gap + PLAN_CLEAR + PLAN_LET_GO + PLAN_REST : PLAN_STOP });
      from = to;
    }
  }
  return moves;
}

/** Two smooth blinks off and back across 0–1. */
function blinkTwice(x: number) {
  return x <= 0 || x >= 1 ? 0 : bump(((x * 2) % 1) * 2 - 1);
}

/**
 * The checklist ticks forward to a stop somewhere on the sheet, the dot it stopped on blinks, then it carries on
 * forward or steps back to the next stop. When it reaches the end the full sheet holds, clears row by row from the
 * top, and the next pass starts from empty; it never turns back from the end. Given a progress, it shows that
 * many dots ticked instead, the next dot breathing.
 */
const planMotion = {
  targets(s: PlanSettings) {
    return {
      duration: s.duration,
      gap: s.gap,
      // Whether a progress was given, so leaving it out glides back to the looping checklist.
      determinate: s.progress === undefined ? 0 : 1,
      progress: Math.min(1, Math.max(0, s.progress ?? 0)),
    };
  },
  cycle: (v) => planMoves(Math.max(0.5, v.duration), Math.max(0, v.gap)).reduce((sum, m) => sum + m.travel + m.pause, 0),
  swell: (t, v) => {
    const gap = Math.max(0, v.gap);
    const moves = planMoves(Math.max(0.5, v.duration), gap);
    const cycle = moves.reduce((sum, m) => sum + m.travel + m.pause, 0);
    const determinate = Math.min(1, Math.max(0, v.determinate));
    const progress = Math.min(1, Math.max(0, v.progress));
    // The next dot breathes twice a loop: a cosine swell, so it never jumps.
    const blink = PLAN_BLINK * (0.5 - 0.5 * Math.cos((4 * Math.PI * t) / cycle));

    // Find the move running now and how far into it we are.
    let at = t;
    let move = moves[moves.length - 1];
    for (const m of moves) {
      if (at < m.travel + m.pause) {
        move = m;
        break;
      }
      at -= m.travel + m.pause;
    }
    const moving = at < move.travel;
    const paused = at - move.travel;

    return ({ row, col, rows }) => {
      let loop = 0;
      if (determinate < 1) {
        const total = rows * rows;
        const index = row * rows + Math.round(col * rows);
        const from = Math.round(move.from * total);
        const to = Math.max(1, Math.round(move.to * total));
        // The front glides between stops with the strong ease-in-out of an on-screen move, counted in dots.
        const front = moving ? from + easeInOut(at / move.travel) * (to - from) : to;
        // Each dot grows in as the front passes it (or shrinks as it backs over it), easing out.
        loop = easeOut(Math.min(1, Math.max(0, front - index)));
        if (!moving) {
          if (to >= total) {
            // The full sheet holds, then each row lets go whole, top to bottom, easing out.
            const clear = gap + (row / rows) * PLAN_CLEAR;
            loop *= 1 - easeOut(Math.min(1, Math.max(0, (paused - clear) / PLAN_LET_GO)));
          } else if (index === to - 1) {
            // The dot the plan stopped on blinks while it waits.
            loop *= 1 - blinkTwice(paused / PLAN_STOP);
          }
        }
      }
      let shown = 0;
      if (determinate > 0) {
        // Counted in dots, reading order, so a gliding progress fills its last row left to right.
        const x = progress * rows * rows - (row * rows + Math.round(col * rows));
        const ticked = Math.min(1, Math.max(0, x));
        shown = x >= 0 && x < 1 ? ticked + (1 - ticked) * blink : ticked;
      }
      return determinate * shown + (1 - determinate) * loop;
    };
  },
} satisfies SheetMotion<"duration" | "gap" | "determinate" | "progress"> & { targets: unknown };
