# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps each role to the label string a skill should apply, and tracks whether that label exists in the repo yet.

| Role in mattpocock/skills | Label string      | Exists today? | Meaning                                  |
| ------------------------- | ----------------- | ------------- | ---------------------------------------- |
| `needs-triage`            | `needs-triage`    | No            | Maintainer needs to evaluate this issue  |
| `needs-info`              | `needs-info`      | No            | Waiting on reporter for more information |
| `ready-for-agent`         | `ready-for-agent` | No            | Fully specified, ready for an AFK agent  |
| `ready-for-human`         | `ready-for-human` | No            | Requires human implementation            |
| `wontfix`                 | `wontfix`         | Yes           | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string. If that label's "Exists today?" is No, don't apply it blindly and don't auto-create it — surface that the label is unprovisioned and leave it for the label overhaul. Only `wontfix` is safe to apply today.

These roles describe issue *intake* (real? specified enough? who picks it up?), which mostly sits beside the work-lifecycle vocabulary in [`docs/governance/labels.md`](../governance/labels.md). The overlap isn't clean, though: `.github/ISSUE_TEMPLATE/*.yml` already apply `status:needs-triage` on creation, so the bare `needs-triage` role here duplicates it. Reconcile the intake roles against the `status:*` machine (and Issue Types) during the label overhaul rather than provisioning a parallel set now. Once a role is provisioned, flip its "Exists today?" to Yes; edit a label string here if the overhaul renames it.
