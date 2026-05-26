# Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities privately via [GitHub Security Advisories](https://github.com/oakoss/ui/security/advisories/new). Do **not** open a public Issue for security reports.

Include in your report:

- The component, package, or file affected
- The version (or commit SHA) you tested against
- A minimum reproduction (code snippet, repo, or steps)
- The impact you observed and the impact you believe is possible

You will receive an acknowledgement within 7 days. We aim to triage within 14 days, ship a fix within 7 days for **critical** severity, and within 30 days for **high** severity. Medium and low severity follow normal release cadence.

## Supported versions

oakoss/ui is pre-v0.1; only the `main` branch receives security fixes. Once stable releases ship, the table below will track which versions get patches:

| Version         | Supported   |
| --------------- | ----------- |
| `main`          | ✅          |
| Tagged releases | TBD at v0.1 |

## Coordinated disclosure

We follow coordinated disclosure. After a fix is available, we will:

1. Publish a [GitHub Security Advisory](https://github.com/oakoss/ui/security/advisories) with a CVE if applicable
2. Release a patched version and tag it
3. Credit the reporter (unless they request otherwise)

## Scope

In-scope:

- Components, primitives, recipes, and registry items shipped under `@oakoss/*`
- Build pipeline (`@oakoss/tokens` Terrazzo output, registry generation)
- `@oakoss/mcp-server` tool surface
- Documentation site code

Out-of-scope:

- Third-party dependencies (report to their maintainers; we will track via Renovate)
- Bugs without a security impact (file as a regular [bug report](https://github.com/oakoss/ui/issues/new?template=bug.yml))
