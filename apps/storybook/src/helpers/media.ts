import { resolve, rulesOf, splitList } from '#/helpers/pseudo';

type Search = {
  condition: string;
  element: Element;
  isUnder: boolean;
  parents: string[];
  property: string;
};

// The value a loaded rule gives element's property under a media condition
// that needn't hold now, such as (any-pointer: coarse); other conditions
// around the rule must hold. It doesn't resolve the cascade.
export function valueUnderMedia(
  element: Element,
  condition: string,
  property: string,
): string | undefined {
  for (const sheet of document.styleSheets) {
    const value = findIn(rulesOf(sheet), {
      condition: normalize(condition),
      element,
      isUnder: false,
      parents: [],
      property,
    });
    if (value !== undefined) return value;
  }
  return undefined;
}

function findIn(rules: CSSRuleList | null, search: Search): string | undefined {
  const list = rules ?? [];
  for (const rule of list) {
    const value = findInRule(rule, search);
    if (value !== undefined) return value;
  }
  return undefined;
}

function findInRule(rule: CSSRule, search: Search): string | undefined {
  if (rule instanceof CSSMediaRule) {
    const isTarget = normalize(rule.conditionText) === search.condition;
    if (!isTarget && !matchMedia(rule.conditionText).matches) return undefined;
    return findIn(rule.cssRules, {
      ...search,
      isUnder: search.isUnder || isTarget,
    });
  }
  if (rule instanceof CSSSupportsRule && !CSS.supports(rule.conditionText)) {
    return undefined;
  }
  if (rule instanceof CSSStyleRule) {
    const parents = resolve(splitList(rule.selectorText), search.parents);
    return (
      matchValue(rule.style, { ...search, parents }) ??
      findIn(rule.cssRules, { ...search, parents })
    );
  }
  if (rule instanceof CSSNestedDeclarations) {
    return matchValue(rule.style, search);
  }
  return 'cssRules' in rule && rule.cssRules instanceof CSSRuleList
    ? findIn(rule.cssRules, search)
    : undefined;
}

function matchValue(
  style: CSSStyleDeclaration,
  search: Search,
): string | undefined {
  const value = style.getPropertyValue(search.property);
  const isMatch =
    value !== '' &&
    search.isUnder &&
    search.parents.some((selector) => search.element.matches(selector));
  return isMatch ? value : undefined;
}

function normalize(condition: string) {
  return condition.replaceAll(/\s+/gu, ' ').trim();
}
