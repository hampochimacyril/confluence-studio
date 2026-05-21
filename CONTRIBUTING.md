# Contributing To Confluence Studio

Thank you for helping improve Confluence Studio. This project is intentionally
small and readable so HackSimBuild participants, designers, engineers,
researchers, and non-programmers can all contribute.

## Ways To Contribute

- Improve water-system assumptions or formulas.
- Add source citations for Houston rates, factors, and flood assumptions.
- Replace the surrogate profile with EnergyPlus output parsing.
- Improve the dashboard or presentation screenshots.
- Add new city or building-type presets.
- Report confusing labels, unit errors, or visual issues.
- Improve documentation for non-technical users.

## Local Development

No package installation is required.

Open:

```text
app/index.html
```

Optional local server:

```bash
cd app
python3 -m http.server 8765
```

Then open `http://localhost:8765`.

## Static Check

Run:

```bash
node --check app/app.js
```

This catches JavaScript syntax errors without requiring dependencies.

## Pull Request Checklist

Before submitting a pull request:

- Confirm `node --check app/app.js` passes.
- Open `app/index.html` and test the Dashboard, Flood, Parameters, and Pipeline tabs.
- Document any new formulas in `docs/FUNCTIONAL_SPEC.md`.
- Avoid overclaiming: call unvalidated flood, cost, health, or biodiversity values proxies.
- Keep the app runnable without a build step unless the team explicitly changes the architecture.

## Documentation Style

Use plain language first, then formulas. A building designer should understand
what the metric means before seeing the equation.

## Scope Guardrails

For the HackSimBuild MVP, do not add features that require internet access,
database setup, authentication, or paid APIs. The live demo must stay
offline-capable and easy to run.
