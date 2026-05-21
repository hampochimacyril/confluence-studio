# Open Source Readiness

This checklist is written for HackSimBuild judges and future contributors. It
explains how Confluence Studio satisfies the open-source judging criterion and
what still needs to happen after the competition.

## Current Status

| Area | Status | Evidence |
|---|---:|---|
| License | Ready | `LICENSE` uses MIT |
| Run instructions | Ready | `README.md` Quick Start |
| No-install demo | Ready | `app/index.html` opens directly |
| Documentation | Ready | `docs/FUNCTIONAL_SPEC.md` |
| Assumptions and limitations | Ready | README + functional spec |
| Contribution guide | Ready | `CONTRIBUTING.md` |
| Code of conduct | Ready | `CODE_OF_CONDUCT.md` |
| Issue templates | Ready | `.github/ISSUE_TEMPLATE/` |
| CI sanity check | Ready | `.github/workflows/static-check.yml` |
| Example inputs | Ready | `examples/scenarios.json` |
| GitHub URL | Ready | `https://github.com/hampochimacyril/confluence-studio` |
| Publishing handoff | Ready | `docs/GITHUB_PUBLISHING_HANDOFF.md` |
| Cowork publish prompt | Ready | `prompts/COWORK_GITHUB_PUBLISH_PROMPT.md` |
| Screenshots/video | Pending | Add after final demo recording |

## Why The Repository Is Useful

Confluence Studio is not only a presentation artifact. It is structured so
another team can:

- Open and run the app without setup.
- Inspect every formula in plain JavaScript.
- Read the methodology in one document.
- Change assumptions without touching a backend.
- Replace the deterministic Houston profile with EnergyPlus exports.
- Fork the project for another city or building type.

## Open Source Design Choices

### Static First

The app is static by design. This reduces the barrier to running the project and
keeps the live demo robust. A static architecture also makes peer review easier:
all logic is visible in `app/app.js`.

### Transparent Approximation

The MVP clearly distinguishes implemented functionality from approximations.
EnergyPlus integration, real EPW parsing, and detailed flood modeling are future
work, not hidden claims.

### Dependency Light

The current app has no runtime dependencies. CI uses Node only to check
JavaScript syntax.

## Recommended GitHub Setup

1. Push this folder to `https://github.com/hampochimacyril/confluence-studio`.
2. Add a screenshot to `reports/` or `docs/assets/`.
3. Add the final demo video or a link to it.
4. Turn on GitHub Pages if the team wants a public hosted demo.

## GitHub Pages Option

Because the project is static, it can be hosted directly with GitHub Pages:

- Source: deploy from branch
- Branch: `main`
- Folder: `/`

The live app path would then be:

```text
https://hampochimacyril.github.io/confluence-studio/app/
```

## Post-Hack Issues To Open

- Replace deterministic Houston profile with EnergyPlus CSV ingestion.
- Add source-backed `data/factors.json` and `data/rates.json`.
- Add screenshot and demo video assets.
- Add data validation tests for annual mass-balance results.
- Add one non-Houston city preset.
- Add source citations for flood-damage assumptions.
