# Confluence Studio — HackSimBuild 2026 Execution Plan (v3)

**Status:** Demo-ready static MVP scaffold created.  
**Recommended team name:** Confluence Studio.  
**Project:** End-to-end early-design toolchain for integrated building water-energy resources.  
**Anchor case:** DOE prototype mid-rise multifamily building, Houston, TX, ASHRAE climate zone 2A.  
**Primary demo surface:** `app/index.html`.  
**Core promise:** make hidden water-energy-resource loops visible, computable, and judge-ready.

## Winning Thesis

Building teams already make decisions that affect potable water demand, sewer
load, pumping energy, carbon, flood runoff, resilience, and cost. Those
consequences are usually modeled in separate tools, by separate disciplines, and
too late in design.

Confluence Studio gives designers one early-stage interface to compare baseline
municipal service against rainwater and greywater strategies, using a visual
flow map and a shared metric scorecard.

The winning demo should not claim to simulate every city-scale resource system.
It should claim something sharper:

> We built a browser-based design tool that quantifies and visualizes the
> water-energy-cost-carbon-resilience tradeoffs of rainwater and greywater
> systems for a Houston multifamily building.

## MVP Scope

### In Scope For Judging

- Houston mid-rise multifamily anchor case.
- Baseline municipal water, sewer, electricity, and gas use.
- Augmented case with rainwater harvesting and greywater reuse.
- Annual water, energy, cost, carbon, WENI, capex, and payback metrics.
- Hour-of-day resource-flow diagram.
- Houston flood stress test with tank capture, overflow, and avoided-damage proxy.
- Parameter controls for assumptions and utility rates.
- IDF/EPW upload registration with transparent static-demo limitations.
- Documentation explaining formulas, assumptions, and limitations.

### Out Of Scope For The Hackathon

- Full browser-side EnergyPlus execution.
- Real EPW parsing in the live demo.
- District-scale hydrology.
- Detailed biodiversity, health, or equity modeling.
- ML optimization.
- Uncertainty quantification.
- Real utility tariff tier logic beyond simplified blended rates.

These should be presented as credible future work, not unfinished promises.

## Product Architecture

```text
confluence-studio/
├── app/
│   ├── index.html          # Static app shell and tab surfaces
│   ├── styles.css          # Responsive UI and SVG styling
│   └── app.js              # Deterministic simulation and rendering engine
├── docs/
│   └── FUNCTIONAL_SPEC.md  # Full feature and formula documentation
├── Confluence_Session_Plan_v3.md
└── README.md
```

## Team Organization

| Role | Owner Profile | Owns | Demo Success Criteria |
|---|---|---|---|
| Product and Story Lead | Strong presenter / systems thinker | pitch, scope control, judge framing, README | judges understand the problem in 30 seconds |
| Water Systems Lead | water, MEP, civil, sustainability | rainwater/greywater logic, assumptions, limitations | formulas are credible and not overclaimed |
| Simulation Lead | EnergyPlus / Python | post-MVP IDF and EPW path, data schema | clear bridge from static MVP to real simulation |
| Frontend and Visualization Lead | web/data-viz | dashboard polish, charts, flow map | demo is readable from projector distance |
| Validation Lead | detail-oriented researcher | source table, sanity checks, Q&A prep | numbers survive obvious judge questions |

If the group has only four people, merge Validation into Water Systems and
Product.

## Critical Execution Strategy

The original v2 plan made EnergyPlus a critical-path blocker. For a short
hackathon build, that is risky. The v3 strategy is:

1. Ship a robust static app first.
2. Use deterministic Houston surrogate data for the live demo.
3. Treat EnergyPlus IDF/EPW parsing as the extensibility path.
4. Document every assumption clearly.
5. Win on clarity, visual communication, and credible integration design.

## Four-Hour Build Plan

### 0:00-0:20 — Freeze The Story

Decisions:

- Team name: Confluence Studio.
- Demo case: Houston mid-rise multifamily.
- Comparison: baseline vs rainwater + greywater.
- Primary pitch beat: hidden water-energy tradeoffs plus Houston flood resilience.
- Final output: static browser app + functional spec + five-slide pitch.

Acceptance:

- One person can say the project in one sentence.
- Everyone knows which metric they own.

### 0:20-1:00 — Validate The Calculation Core

Tasks:

- Review `app/app.js` formula assumptions.
- Sanity-check annual water use, CO2, payback, and runoff magnitudes.
- Tune default values only if they fail common-sense checks.
- Add a short source/assumption note for any changed parameter.

Acceptance:

- Water-loop scenario saves mains water.
- Added pump energy is positive but not dominant.
- Scenario CO2 is below baseline unless parameters are deliberately changed.
- Payback is finite or clearly explained.

### 1:00-1:50 — Polish The Demo Experience

Tasks:

- Open `app/index.html` on the presentation laptop.
- Check dashboard readability at projector scale.
- Confirm sliders update numbers and diagrams smoothly.
- Confirm all tabs render without overlap.
- Capture screenshots for the deck.

Acceptance:

- Dashboard can be explained in 60 seconds.
- Flood tab produces the Houston differentiator in 45 seconds.
- Nothing requires internet access.

### 1:50-2:30 — Documentation And Open Source Polish

Tasks:

- Review `docs/FUNCTIONAL_SPEC.md`.
- Add team member names to README if known.
- Add limitations in plain language.
- Add install/run instructions.
- Create a source table for default assumptions if time allows.

Acceptance:

- A judge can inspect the repo and understand what is real vs approximated.
- The limitations strengthen credibility instead of sounding like apologies.

### 2:30-3:20 — Pitch Deck

Use five slides:

1. **The Gap:** water and energy decisions are modeled separately.
2. **Confluence Studio:** one visual early-design tool for water-energy loops.
3. **Live Demo:** screenshot fallback of the dashboard.
4. **Houston Headline:** water saved, bill savings, CO2 avoided, runoff reduction.
5. **Open Source And Next:** GitHub, documentation, EnergyPlus integration path.

Acceptance:

- No slide has more than one headline idea.
- Slide 4 uses large numbers, not paragraphs.

### 3:20-4:00 — Rehearse And Stabilize

Tasks:

- Run the live demo twice.
- Time the talk.
- Prepare a screenshot fallback.
- Assign Q&A owners.
- Remove any flaky live interaction from the pitch path.

Acceptance:

- Pitch lands in under five minutes.
- Backup screenshots are ready.
- Team knows who answers each likely question.

## Demo Script

### Opening

"Water and energy are designed together in the real world, but modeled
separately in most design workflows. That means early decisions about rainwater,
greywater, pumping, sewer load, carbon, cost, and flood resilience are hard to
see as one system."

### What We Built

"Confluence Studio is a browser-based early-design tool for integrated
water-energy resource loops. For a Houston multifamily building, it compares a
baseline municipal-water design against a rainwater and greywater scenario, then
reports water, energy, cost, carbon, WENI, payback, and flood-resilience
metrics."

### Live Demo Beats

1. Dashboard baseline vs water-loop comparison.
2. Move rainwater tank slider and show annual water and payback change.
3. Scrub hour-of-day flow diagram.
4. Open Flood tab and switch from TMY Max to Harvey Stress.
5. Open Pipeline tab and explain IDF/EPW integration path.

### Close

"The hackathon version is deliberately robust: static, documented, and
offline-ready. The next step is replacing the Houston surrogate profile with
EnergyPlus exports from IDF and EPW files, using the same metric and visualization
layer."

## Metric Dictionary

| Metric | Meaning | MVP Formula |
|---|---|---|
| Mains water saved | Potable water avoided | baseline mains - scenario mains |
| Annual bill reduction | Operating savings | baseline water+energy bill - scenario water+energy bill |
| Pump energy | Recycling energy penalty | reclaimed gallons pumped * kWh/gal |
| CO2 avoided | Annual emissions delta | baseline CO2 - scenario CO2 |
| WENI | water-energy nexus intensity | water embodied energy plus energy embodied water, normalized by floor area |
| Capital cost | Installed-cost proxy | rain tank gal * $4 + grey tank gal * $1.25 + $3000 |
| Payback | Simple payback | capex / annual savings |
| Peak runoff reduction | tank effect on storm peak | (peak raw runoff - peak overflow) / peak raw runoff |
| Avoided damage | annualized flood proxy | FEMA AAL * capped Hazus-style damage reduction |

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| EnergyPlus install fails | live demo breaks | static app is primary demo; pipeline is documented future path |
| Judges question synthetic data | credibility risk | be explicit: deterministic Houston surrogate for MVP, EnergyPlus-ready schema next |
| Flood savings look overclaimed | credibility risk | call it an avoided-damage proxy and cap damage reduction at 30% |
| Tank fills before storm peak | demo risk | model smart pre-storm drawdown as an explicit detention-storage assumption |
| Water utility rates are complex | minor metric error | use blended rate defaults and expose editable parameters |
| UI is hard to read on projector | demo risk | use dashboard screenshot fallback and large-number slide |

## Judge Q&A Prep

**Q: Is this running EnergyPlus live?**  
A: Not in the static MVP. We made the live demo robust by using a deterministic
Houston surrogate profile, then documented the exact IDF/EPW integration point.
The calculation and visualization layer are ready for EnergyPlus exports.

**Q: Are the flood-damage savings validated?**  
A: They are a first-order site-runoff avoided-damage proxy, not a catchment-scale
flood model. We use a transparent Hazus-style relationship and cap the reduction
to avoid overclaiming.

**Q: Why Houston?**  
A: Houston makes water, energy, heat, and flood resilience visible in one anchor
case: high cooling loads, high rainfall, and real stormwater stress.

**Q: What is novel here?**  
A: The novelty is not a single formula. It is the integrated design surface:
water flows, energy penalty, cost, carbon, and flood resilience in one visual
tool for early-stage building design.

**Q: What would make this production-ready?**  
A: Real EnergyPlus export ingestion, source-backed local tariff files, calibrated
water-system equipment costs, and multi-city templates.

## Final Checklist

- [ ] Open `app/index.html` locally.
- [ ] Verify dashboard sliders update metrics.
- [ ] Verify flood tab switches between TMY Max and Harvey Stress.
- [ ] Verify parameter edits update scorecards.
- [ ] Verify pipeline upload log works.
- [ ] Add team names.
- [ ] Push repo to GitHub.
- [ ] Capture dashboard and flood screenshots.
- [ ] Rehearse live demo twice.

## Recommended Repo Description

Open-source browser tool for visualizing water-energy-cost-carbon-resilience
tradeoffs in building-scale rainwater and greywater systems.
