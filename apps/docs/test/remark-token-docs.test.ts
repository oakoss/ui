import { describe, expect, it } from 'vitest';

import type { File, Node } from '#/lib/expansion-output';

import { remarkTokenDocs } from '#/lib/remark-token-docs';

// The cases here fail or pass through before the plugin touches the file.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- never read
const file = {} as File;

function element(name: string, attributes: Node['attributes'] = []): Node {
  return { attributes, name, type: 'mdxJsxFlowElement' };
}

function run(node: Node) {
  const tree: Node = { children: [node], type: 'root' };
  remarkTokenDocs()(tree, file);
  return tree;
}

describe('remarkTokenDocs', () => {
  it('names a rule set or table attribute that is missing', () => {
    expect(() => run(element('TokenRules'))).toThrow(
      '<TokenRules> needs a set',
    );
    expect(() => run(element('TokenTable'))).toThrow(
      '<TokenTable> needs a group',
    );
  });

  it('names an unknown rule set, prototype names included', () => {
    for (const set of ['nope', 'toString', 'constructor']) {
      expect(() =>
        run(element('TokenRules', [{ name: 'set', value: set }])),
      ).toThrow(`no token rules "${set}"`);
    }
  });

  it('leaves other elements alone, prototype names included', () => {
    const other = element('toString');
    expect(run(other).children).toEqual([other]);
  });
});
