# Triage Labels

The skills speak in terms of five canonical triage roles. In oakoss/ui these are provisioned as repo labels with identity names — apply the label of the same name.

| Role in mattpocock/skills | Label             | Meaning                                      |
| ------------------------- | ----------------- | -------------------------------------------- |
| `needs-triage`            | `needs-triage`    | Maintainer needs to evaluate this issue      |
| `needs-info`              | `needs-info`      | Waiting on the reporter for more information |
| `ready-for-agent`         | `ready-for-agent` | Fully specified, ready for an AFK agent      |
| `ready-for-human`         | `ready-for-human` | Requires human implementation                |
| `wontfix`                 | `wontfix`         | Will not be actioned                         |

These five are oakoss/ui's readiness vocabulary — the intake axis for "can this be picked up, and by whom?" Work-status (Todo / In Progress / In Review / Done) is a separate axis tracked in the project board's Status field, not labels — see [`docs/governance/projects.md`](../governance/projects.md).

See [`docs/governance/labels.md`](../governance/labels.md) for the full label model and [`issue-types.md`](../governance/issue-types.md) for the type axis.
