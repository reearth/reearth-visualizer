# Design Documents

## Overview

Design documents are written before implementation to align the team on the approach, scope, and risks of a change. All design docs are stored in `docs/design-doc/`.

## Template

Use [design-doc-template.md](design-doc-template.md) as the base for all new design docs.

## File Naming Convention

Files must follow this format:

```
YYYYMMDD_NNN_title.md
```

| Part       | Description                          | Example      |
|------------|--------------------------------------|--------------|
| `YYYYMMDD` | Creation date                        | `20260327`   |
| `NNN`      | Sequential number for that date      | `001`        |
| `title`    | Short descriptive name in snake_case | `sso_logout` |

Example: `20260327_001_sso_logout.md`

## Process

1. Copy the template to `docs/design-doc/` with the correct filename
2. Fill in all sections
3. Submit a PR for review
4. Get sign-off from reviewers listed in the "Reviewed by" section
