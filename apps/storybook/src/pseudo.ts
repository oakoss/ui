// Whether a loaded stylesheet hides element's pseudo-element with
// display: none, in a rule whose media and supports conditions hold.
// Chromium's getComputedStyle doesn't read browser-internal pseudo-elements
// like ::-webkit-search-cancel-button, so this reads the rules. It doesn't
// resolve the cascade: a later rule showing the pseudo-element again passes.
export function isPseudoHidden(element: Element, pseudo: string) {
  return [...document.styleSheets].some((sheet) =>
    isHiddenIn(rulesOf(sheet), element, pseudo, []),
  );
}

function isHiddenIn(
  rules: CSSRuleList | null,
  element: Element,
  pseudo: string,
  parents: string[],
): boolean {
  return [...(rules ?? [])].some((rule) => {
    if (
      rule instanceof CSSMediaRule &&
      !matchMedia(rule.conditionText).matches
    ) {
      return false;
    }
    if (rule instanceof CSSSupportsRule && !CSS.supports(rule.conditionText)) {
      return false;
    }
    if (!(rule instanceof CSSStyleRule)) {
      return (
        'cssRules' in rule &&
        rule.cssRules instanceof CSSRuleList &&
        isHiddenIn(rule.cssRules, element, pseudo, parents)
      );
    }
    const selectors = resolve(splitList(rule.selectorText), parents);
    const isHidden =
      rule.style.display === 'none' &&
      selectors.some((selector) => {
        if (!selector.endsWith(pseudo)) return false;
        const base = selector.slice(0, -pseudo.length);
        return base !== '' && element.matches(base);
      });
    return isHidden || isHiddenIn(rule.cssRules, element, pseudo, selectors);
  });
}

// Each branch of a nested rule's list, under each branch of its parent's.
function resolve(branches: string[], parents: string[]) {
  if (parents.length === 0) return branches;
  return parents.flatMap((parent) =>
    branches.map((branch) =>
      branch.includes('&')
        ? branch.replaceAll('&', () => parent)
        : `${parent} ${branch}`,
    ),
  );
}

function rulesOf(sheet: CSSStyleSheet) {
  try {
    return sheet.cssRules;
  } catch {
    // A cross-origin sheet can't be read, and holds none of our rules.
    return null;
  }
}

const nesting: Partial<Record<string, number>> = {
  '(': 1,
  ')': -1,
  '[': 1,
  ']': -1,
};

// Splits a selector list at its top-level commas, leaving those inside
// :is(), :not(), attribute values and escapes alone.
function splitList(list: string) {
  const branches: string[] = [];
  let depth = 0;
  let isEscaped = false;
  let quote: string | undefined;
  let start = 0;
  // Index by UTF-16 unit, as slice does.
  for (const [index, char] of list.split('').entries()) {
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === '\\') {
      isEscaped = true;
      continue;
    }
    if (quote !== undefined) {
      if (char === quote) quote = undefined;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    depth += nesting[char] ?? 0;
    if (char !== ',' || depth !== 0) continue;
    branches.push(list.slice(start, index).trim());
    start = index + 1;
  }
  branches.push(list.slice(start).trim());
  return branches;
}
