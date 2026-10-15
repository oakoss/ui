const nativeNow = Date.now.bind(Date);

// @internationalized/date reads only Date.now; a spy on it recurses, since the
// test runner reads it too. Restoring the real clock, not the prior one, lets a
// story's freeze over its meta's unwind in either order.
export function freezeDate(at: Date): () => void {
  const fixed = at.getTime();
  if (Number.isNaN(fixed)) throw new Error('freezeDate needs a valid date');
  Date.now = () => fixed;
  return () => {
    Date.now = nativeNow;
  };
}
