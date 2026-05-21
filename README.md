# Confluence Studio

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Static Check](https://github.com/hampochimacyril/confluence-studio/actions/workflows/static-check.yml/badge.svg)](https://github.com/hampochimacyril/confluence-studio/actions/workflows/static-check.yml)
[![HackSimBuild 2026](https://img.shields.io/badge/HackSimBuild-2026-teal.svg)](https://ibpsa.us/)

**Confluence Studio** is an open-source early-design simulator for integrated
building water-energy resource loops. It helps designers compare a baseline
municipal-water system against rainwater harvesting and greywater reuse, then
communicate the tradeoffs through a visual flow map and a shared metric
scorecard.

The HackSimBuild 2026 anchor case is a DOE mid-rise multifamily building in
Houston, Texas, ASHRAE Climate Zone 2A.

## Why This Exists

Building teams make water decisions that affect energy, sewer load, pumping,
carbon, operating cost, capital cost, stormwater runoff, and resilience. In
practice, those impacts are often modeled in separate tools by separate
disciplines. Confluence Studio makes those resource connections visible early
enough for design teams to act on them.

## What It Does

- Compares baseline municipal water service against rainwater + greywater loops.
- Estimates annual potable water, sewer, electricity, gas, utility cost, carbon,
  WENI, capital cost, and simple payback.
- Shows an hour-of-day water-flow diagram for mains, rainwater, greywater, DHW,
  toilet/irrigation, and cooling makeup.
- Stress-tests Houston storm events and estimates site-runoff reduction plus an
  avoided-damage proxy.
- Exposes all major physical factors and utility-rate assumptions as editable
  controls.
- Registers `.idf` and `.epw` files as the documented future path to EnergyPlus
  integration.

## Quick Start

Open this file in a browser:

```text
app/index.html
```

No package install, build step, database, network connection, or local server is
required for the demo.

Optional local server for development:

```bash
cd confluence-studio/app
python3 -m http.server 8765
```

Then open `http://localhost:8765`.

## Repository Layout

```text
confluence-studio/
├── app/
│   ├── index.html                      # Static app shell
│   ├── styles.css                      # Responsive UI styling
│   └── app.js                          # Simulation + rendering engine
├── docs/
│   ├── FUNCTIONAL_SPEC.md              # Full feature and formula documentation
│   └── OPEN_SOURCE_READINESS.md        # Judging/readiness checklist
├── examples/
│   └── scenarios.json                  # Example scenario presets
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/static-check.yml
├── Confluence_Session_Plan_v3.md       # Hackathon execution plan
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md
```

## Methodology

The HackSimBuild MVP uses a deterministic Houston surrogate profile with 8,760
hourly records. It is intentionally stable for live judging: the app never calls
`Math.random()` during simulation, so the same inputs produce the same outputs.

The calculation engine includes:

- Annual water mass balance.
- Rainwater tank storage and drawdown.
- Greywater generation, storage, and reuse.
- Pumping energy for reclaimed water loops.
- Time-of-use electricity billing.
- Water and sewer billing.
- Embodied water-system energy.
- CO2 emissions.
- WENI normalization by floor area.
- Simple capital-cost and payback proxy.
- Houston storm runoff and avoided-damage proxy.

See [docs/FUNCTIONAL_SPEC.md](docs/FUNCTIONAL_SPEC.md) for formulas,
assumptions, limitations, and post-hack integration steps.

## Current MVP Outputs

With the default Houston assumptions, the water-loop scenario estimates:

- About **233,525 gal/year** mains water saved.
- About **$1,751/year** utility bill reduction.
- About **4,959 kg CO2e/year** avoided.
- About **38%** peak site-runoff reduction for the TMY max storm case.
- About **$6,286/year** avoided annual damage proxy.

These are MVP design-screening estimates, not calibrated engineering
certifications.

## What Is Real Vs Approximate

Implemented in this repository:

- Static browser app.
- Deterministic Houston hourly surrogate profile.
- Interactive dashboard, flood, parameters, and pipeline tabs.
- Documented formulas and assumptions.
- Open-source repo scaffolding.

Approximated for the hackathon:

- EPW weather is represented by a deterministic Houston surrogate.
- IDF uploads are registered but not simulated in-browser.
- Flood damage is a transparent proxy, not a catchment-scale hydraulic model.
- Tariffs are blended first-order values.

Deferred:

- Real EnergyPlus execution.
- Real EPW parsing.
- Multi-city and multi-building templates.
- Detailed health, biodiversity, and equity metrics.
- Uncertainty quantification.

## Open Source

This project is MIT-licensed and intended to be easy to inspect, run, fork, and
extend. The repo includes:

- A license.
- Contribution guide.
- Code of conduct.
- Issue templates.
- Static CI check.
- Functional spec.
- Example scenario presets.
- A judging-oriented open-source readiness checklist.

See [docs/OPEN_SOURCE_READINESS.md](docs/OPEN_SOURCE_READINESS.md).

Public repository:
[github.com/hampochimacyril/confluence-studio](https://github.com/hampochimacyril/confluence-studio)

Publishing handoff:
[docs/GITHUB_PUBLISHING_HANDOFF.md](docs/GITHUB_PUBLISHING_HANDOFF.md)

Cowork publishing prompt:
[prompts/COWORK_GITHUB_PUBLISH_PROMPT.md](prompts/COWORK_GITHUB_PUBLISH_PROMPT.md)

## Roadmap

1. Replace the surrogate profile with EnergyPlus `baseline_hourly.csv` and
   `scenario_hourly.csv` exports.
2. Add server-side IDF/EPW parsing and simulation jobs.
3. Add source-backed `factors.json` and `rates.json`.
4. Add screenshots and a recorded demo in `reports/`.
5. Expand to more climates, building types, and water-system configurations.

## Team

Built for HackSimBuild 2026 by the Confluence Studio team.

Suggested roles:

- Product/story lead
- Building simulation lead
- Water systems lead
- Frontend/data visualization lead
- Validation and documentation lead

## License

MIT. See [LICENSE](LICENSE).
