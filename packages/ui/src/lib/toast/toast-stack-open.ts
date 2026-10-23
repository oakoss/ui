export type StackOpenEvent =
  | 'blur'
  | 'escape'
  | 'focus'
  | 'focusToast'
  | 'hover'
  | 'tap'
  | 'tapOutside'
  | 'unhover';

// What a stack's region has seen: the pointer over it, focus inside it, a
// touch tap, and an Escape on the region itself, which F6 focuses.
export type StackOpenState = Readonly<{
  hasFocus: boolean;
  isEscaped: boolean;
  isHovered: boolean;
  isTapped: boolean;
}>;

export const closedStack: StackOpenState = {
  hasFocus: false,
  isEscaped: false,
  isHovered: false,
  isTapped: false,
};

// Escape closes the stack until the pointer leaves, focus leaves, or focus
// moves into a toast; a tap holds it open until a tap outside or Escape.
const changes: Readonly<Record<StackOpenEvent, Partial<StackOpenState>>> = {
  blur: { hasFocus: false, isEscaped: false },
  escape: { isEscaped: true, isTapped: false },
  focus: { hasFocus: true },
  focusToast: { isEscaped: false },
  hover: { isHovered: true },
  tap: { isTapped: true },
  tapOutside: { isTapped: false },
  unhover: { isEscaped: false, isHovered: false },
};

export function nextStackOpen(
  state: StackOpenState,
  event: StackOpenEvent,
): StackOpenState {
  return { ...state, ...changes[event] };
}

// Open on hover or focus unless escaped, or on a tap. A tap pauses the
// timers itself, since hover and focus pause them through React Aria. While
// focus is inside, nothing hides out from under it.
export function stackOpenView(state: StackOpenState) {
  const isPointed = (state.isHovered || state.hasFocus) && !state.isEscaped;
  return {
    isOpen: isPointed || state.isTapped,
    pausesTimers: state.isTapped,
    showsAll: state.hasFocus && !state.isEscaped,
  };
}
