// Sets React Aria's state attributes, which hover: and pressed: match, and
// waits for the transition.
export async function setState(
  element: HTMLElement,
  state: 'hovered' | 'pressed' | 'resting',
) {
  delete element.dataset.hovered;
  delete element.dataset.pressed;
  if (state !== 'resting') element.toggleAttribute(`data-${state}`, true);
  await transitioned(element);
}

// Waits for the element's running transitions to finish.
export async function transitioned(element: Element) {
  await Promise.all(element.getAnimations().map((a) => a.finished));
}
