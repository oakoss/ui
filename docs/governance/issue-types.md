# Issue Types

oakoss/ui uses **GitHub Issue Types** (an org-level field on the `oakoss` org) as the type axis for Issues, replacing the old `type:*` labels. Every Issue carries exactly one type.

| Type         | Color  | Use for                                                                                           |
| ------------ | ------ | ------------------------------------------------------------------------------------------------- |
| **Bug**      | red    | An unexpected problem or incorrect behavior in shipped code                                       |
| **Feature**  | blue   | A new capability, component, recipe, or enhancement                                               |
| **Task**     | yellow | A concrete unit of work that isn't user-facing (chores, docs, infra)                              |
| **Epic**     | purple | A large initiative tracked across multiple sub-issues                                             |
| **Proposal** | green  | A design or API proposal under discussion (paired with a doc in [`../proposals/`](../proposals/)) |

Bug, Feature, and Task are GitHub's org defaults; Epic and Proposal were added for this project.

## Why types, not labels

Issue Types are a first-class field: filterable in Issue lists with `is:issue type:Bug` and in the [project board](projects.md) views, shared org-wide across every `oakoss` repo, and separate from the label namespace. Type-as-label (`type:bug`) duplicated this less cleanly, so the `type:*` labels were removed — see [`labels.md`](labels.md).

## Epics and sub-issues

An **Epic** is a top-level Issue whose child work is modeled with native **sub-issues**, not a markdown checklist. Sub-issue progress rolls up to the parent automatically, and both Issue lists and the [project board](projects.md) can group by parent. Foundation epics (tokens package, themes, first components, Storybook, docs site, MCP server) are filed as Epics with their tasks as sub-issues.

## Provisioning

Types live at the org level. The custom ones were created with:

```bash
gh api orgs/oakoss/issue-types -X POST -f name=Epic \
  -f description="A large initiative tracked across multiple sub-issues" -f color=purple -F is_enabled=true
gh api orgs/oakoss/issue-types -X POST -f name=Proposal \
  -f description="A design or API proposal under discussion (see docs/proposals)" -f color=green -F is_enabled=true
```

Issue templates set the type automatically via the top-level `type:` key (see [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE/)).
