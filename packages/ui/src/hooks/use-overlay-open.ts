import { useEffect, useRef, useState } from 'react';

type OverlayOpenProps = {
  defaultOpen?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

// React Aria's tooltip and preview triggers leave an open overlay open when
// isDisabled turns on, and PreviewTrigger still opens on keyboard focus while
// disabled. Owning the open state keeps a disabled overlay closed, reports
// that close through onOpenChange, and stops re-enabling from reopening it
// with state React Aria changed while it was disabled.
export function useOverlayOpen({
  defaultOpen = false,
  isDisabled = false,
  isOpen,
  onOpenChange,
}: OverlayOpenProps) {
  const [open, setOpen] = useState(defaultOpen && !isDisabled);
  const isShown = isOpen ?? open;
  const [wasDisabled, setWasDisabled] = useState(isDisabled);
  if (isDisabled !== wasDisabled) {
    setWasDisabled(isDisabled);
    if (isDisabled) setOpen(false);
  }
  // A ref rather than useEffectEvent, which needs React 19.2. Effects run in
  // order, so the callback is current before the close is reported, and the
  // shown state updates after.
  const onOpenChangeRef = useRef(onOpenChange);
  const shownRef = useRef(isShown && !isDisabled);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });
  useEffect(() => {
    if (isDisabled && shownRef.current) onOpenChangeRef.current?.(false);
  }, [isDisabled]);
  useEffect(() => {
    shownRef.current = isShown && !isDisabled;
  });
  return {
    isDisabled,
    isOpen: !isDisabled && isShown,
    onOpenChange: (isNextOpen: boolean) => {
      if (isDisabled) return;
      // Already reported, so a handler that disables the trigger doesn't
      // trigger a second close.
      if (!isNextOpen) shownRef.current = false;
      setOpen(isNextOpen);
      onOpenChange?.(isNextOpen);
    },
  };
}
