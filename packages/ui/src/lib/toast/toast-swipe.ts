export type SwipeDirection = 'down' | 'left' | 'right' | 'up';

export type SwipeState = Readonly<{
  axis: 'x' | 'y' | undefined;
  offset: Point;
  start: Point;
  startTime: number;
}>;

type Point = Readonly<{ x: number; y: number }>;

export const swipeDistance = 45;
// A quick flick closes short of the distance, but not a tap's jitter.
const flickSpeed = 0.11;
const flickDistance = 10;

// The edge the toast leaves through, or undefined when it springs back.
export function endSwipe(
  state: SwipeState,
  endTime: number,
  directions: readonly SwipeDirection[],
): SwipeDirection | undefined {
  if (state.axis === undefined) return undefined;
  const delta = state.axis === 'x' ? state.offset.x : state.offset.y;
  const direction = directionOf(state.axis, delta);
  if (!directions.includes(direction)) return undefined;
  const distance = Math.abs(delta);
  const speed = distance / Math.max(endTime - state.startTime, 1);
  const isFlick = speed > flickSpeed && distance >= flickDistance;
  return isFlick || distance >= swipeDistance ? direction : undefined;
}

const controls = [
  'a',
  'button',
  'input',
  'label',
  'select',
  'summary',
  'textarea',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
].join(', ');

// Carries the toast on past where the finger let go, off that edge.
export function exitTransform(
  out: SwipeDirection,
  offset: Readonly<{ x: number; y: number }>,
) {
  const sign = out === 'left' || out === 'up' ? '-' : '+';
  return out === 'left' || out === 'right'
    ? `translate(calc(${String(offset.x)}px ${sign} 100%), 0)`
    : `translate(0, calc(${String(offset.y)}px ${sign} 100%))`;
}

// A press on a control presses it; React Aria's press handling stops most
// pointer events, but a pending button lets them through.
export function isOnControl(target: EventTarget | null) {
  return target instanceof Element && target.closest(controls) !== null;
}

// Locks to the axis of the first movement; a pull away from the allowed
// edges moves less the further it goes.
export function moveSwipe(
  state: SwipeState,
  point: Point,
  directions: readonly SwipeDirection[],
): SwipeState {
  const x = point.x - state.start.x;
  const y = point.y - state.start.y;
  if (x === 0 && y === 0 && state.axis === undefined) return state;
  const axis = state.axis ?? (Math.abs(x) > Math.abs(y) ? 'x' : 'y');
  const delta = axis === 'x' ? x : y;
  const pull = directionOf(axis, delta);
  const moved = directions.includes(pull) ? delta : resist(delta);
  return {
    ...state,
    axis,
    offset: axis === 'x' ? { x: moved, y: 0 } : { x: 0, y: moved },
  };
}

export function startSwipe(start: Point, startTime: number): SwipeState {
  return { axis: undefined, offset: { x: 0, y: 0 }, start, startTime };
}

// Toward the stack's nearest edges: its side, and the inline edge it's
// aligned to; a centered stack swipes only toward its side.
export function swipeDirections({
  align,
  isRtl,
  side,
}: {
  align: 'center' | 'end' | 'start';
  isRtl: boolean;
  side: 'bottom' | 'top';
}): readonly SwipeDirection[] {
  const vertical = side === 'bottom' ? 'down' : 'up';
  if (align === 'center') return [vertical];
  const isLeft = (align === 'start') !== isRtl;
  return [vertical, isLeft ? 'left' : 'right'];
}

function directionOf(axis: 'x' | 'y', delta: number): SwipeDirection {
  if (axis === 'x') return delta < 0 ? 'left' : 'right';
  return delta < 0 ? 'up' : 'down';
}

function resist(delta: number) {
  return delta / (1.5 + Math.abs(delta) / 20);
}
