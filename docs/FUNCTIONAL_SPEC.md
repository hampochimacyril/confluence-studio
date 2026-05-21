# Confluence Studio Functional Specification

## Purpose

Confluence Studio is a web-based early-design decision tool for integrated
building water-energy resources. It helps a building design team compare a
baseline municipal-water system against a rainwater and greywater reuse scenario
for a Houston mid-rise multifamily building.

The hackathon MVP is static and browser-native. It does not require React,
Streamlit, Plotly, EnergyPlus, a package manager, or internet access during the
demo. This is intentional: the live presentation surface stays reliable while
the code clearly exposes future integration points for EnergyPlus IDF/EPW data.

## Primary User

The primary user is an early-stage building designer or sustainability engineer
who needs to answer:

- How much potable water can the proposed water-loop design offset?
- Does the added pumping energy erase the water and carbon benefit?
- What is the annual utility-cost impact?
- What is the capital-cost payback proxy?
- How does rainwater storage affect site-level flood runoff in Houston?
- Can these tradeoffs be communicated visually to non-technical stakeholders?

## App Location

Open:

```text
HackSimBuild2026/confluence-studio/app/index.html
```

No build step is required.

## Screens

### 1. Dashboard

The dashboard is the primary demo screen. It has three regions.

**Scenario Controls**

Editable controls include:

- Baseline vs water-loop system view
- Rainwater storage capacity
- Greywater buffer capacity
- Greywater treatment/recovery efficiency

The controls re-run the annual simulation immediately. Slider updates are
batched through `requestAnimationFrame` so the browser does not re-render
multiple times per input event.

**Hourly Resource Flow**

The center visualization is an SVG resource-flow diagram. It shows average
gallons per hour for the selected hour of day:

- Mains water
- Rainwater harvest
- Greywater reclaim
- Domestic hot water
- Toilets and irrigation
- Cooling makeup

Flow thickness represents gallons per hour. Flow color distinguishes mains,
rainwater, and greywater.

**Annual Scorecards**

The right column reports:

- Annual mains water saved
- Annual utility bill reduction
- WENI improvement
- Capital payback
- Baseline and scenario carbon footprint
- Pump energy added by recycling systems
- Rainwater and greywater used

The environmental equivalence sentence converts annual water savings into
Olympic-pool equivalents and annual CO2 savings into passenger-car equivalents.

### 2. Flood

The flood tab is the Houston differentiator. It simulates a 72-hour rainfall
event and estimates how much roof runoff the rainwater tank captures before
overflow goes to municipal drainage.

Available storm events:

- `TMY Max`: 6.4 inches over 72 hours
- `Harvey Stress`: 32.0 inches over 72 hours

Editable controls include:

- Roof capture area
- FEMA average annual loss baseline

Outputs include:

- Peak runoff reduction
- Total raw roof runoff
- Overflow runoff
- Hazus-style damage reduction
- Avoided annual damage

The hydrograph shows captured runoff, overflow, and tank fill over the event.

### 3. Parameters

The parameters tab exposes the assumptions used by the model.

Physical factors:

- Potable treatment energy
- Wastewater treatment energy
- Domestic hot-water energy
- Embodied water of grid energy
- Grid carbon intensity
- Natural gas carbon intensity
- Rain capture efficiency
- Recycling pump energy
- Building floor area

Utility rates:

- Peak and off-peak electricity rates
- Peak period start and end
- Natural gas rate
- Potable water rate
- Sewer rate

Changing any value immediately updates all metrics.

### 4. Pipeline

The pipeline tab accepts `.idf` and `.epw` files as demo-ready inputs. In the
static MVP, uploads are registered and logged but do not trigger a local
EnergyPlus run. The log makes this explicit.

This preserves the intended end-to-end toolchain story without putting the live
demo at risk if EnergyPlus is unavailable on the presentation machine.

## Calculation Engine

The app is implemented in `app/app.js` as a set of deterministic pure functions.

### Hourly Houston Profile

`buildHourlyProfile()` creates 8,760 hourly records representing the Houston
anchor case. Each record includes:

- Day, month, hour of day, weekday flag
- Outdoor and indoor temperature
- Electricity and gas demand
- Domestic hot water demand
- Toilet demand
- Irrigation demand
- Cooling-tower makeup water
- Precipitation

The profile uses deterministic sinusoidal seasonal/diurnal patterns plus seeded
noise. It never calls `Math.random()`, so results remain stable across renders.

### Annual Water-Energy Metrics

`computeMetrics(state)` performs the annual mass-balance and cost/carbon
calculation.

Baseline assumptions:

- All DHW, toilet, irrigation, and cooling makeup water is supplied by mains.
- Sewer volume is approximated as DHW return fraction plus toilet water.
- Electricity and gas are billed hourly using time-of-use electricity rates.

Water-loop assumptions:

- Rainwater fills the rain tank up to tank capacity.
- Greywater is generated from a fraction of domestic hot water demand and fills
  the greywater tank up to tank capacity.
- Rainwater serves toilet and irrigation demand first.
- Greywater serves remaining toilet/irrigation demand, then cooling makeup.
- Any unmet demand is supplied by mains.
- Reclaimed water pumping adds electricity proportional to gallons pumped.

Annual metrics:

- Mains water use
- Sewer volume
- Electricity use
- Gas use
- Water and sewer bill
- Energy bill
- Rainwater used
- Greywater used
- Pump energy
- Embodied water-system energy
- Carbon emissions
- WENI
- Capital cost proxy
- Annual operating savings
- Simple payback

### WENI

WENI is computed as:

```text
(embodied_energy_of_water + embodied_water_of_energy * potable_treatment_energy) / floor_area
```

The result is reported in kWh/ft2.

### Carbon

Carbon is computed as:

```text
electricity_kwh * grid_co2
+ gas_kwh * gas_co2
+ embodied_water_energy_kwh * grid_co2
```

### Capital Cost And Payback

The MVP capital-cost proxy is:

```text
rainwater_capacity_gal * $4
+ greywater_capacity_gal * $1.25
+ $3,000 greywater pump skid
```

Simple payback is:

```text
capital_cost / annual_operating_savings
```

If annual savings are not positive, payback is reported as no payback.

### Flood-Resilience Module

`computeFloodAnalysis(state)` builds a 72-hour synthetic hyetograph, scales it
to the selected storm depth, and routes roof runoff into the rainwater tank.

The MVP assumes a smart pre-storm operating mode: before the event, the tank is
drawn down to 5% full, then a small active drawdown continues during the storm to
represent controlled release or high-priority non-potable demand. This makes the
module a detention-storage proxy, not a full municipal drainage model.

The displayed runoff is site runoff, not only roof runoff. The MVP uses a
2.1x impervious-area multiplier to represent roof plus adjacent hardscape
draining through the same site outlet, while the tank can capture only roof
runoff.

For each hour:

```text
roof_runoff_gal = rainfall_inches / 12 * roof_area_ft2 * 7.48052
site_runoff_gal = roof_runoff_gal * 2.1
capture = min(roof_runoff_gal * rain_efficiency, remaining_tank_capacity)
overflow = site_runoff_gal - capture
```

Peak runoff reduction is:

```text
(peak_raw_runoff - peak_overflow_runoff) / peak_raw_runoff
```

The MVP damage-reduction proxy is:

```text
every 10% peak runoff reduction = 3% damage reduction
```

Damage reduction is capped at 30% to avoid overclaiming.

## Implementation Improvements Over The Prototype

- Removed React runtime dependency for demo reliability.
- Split one large component into `index.html`, `styles.css`, and `app.js`.
- Removed unused imports and dead constants.
- Replaced render-time randomness with deterministic weather and demand profiles.
- Centralized state so every tab uses the same assumptions.
- Made metric calculations pure and re-runnable.
- Added explicit file-pipeline status instead of implying IDF parsing is complete.
- Added numeric input validation fallbacks.
- Added responsive layout for laptop and projector use.
- Added functional documentation and revised project execution plan.

## Known Limitations

- The Houston profile is a deterministic surrogate, not a parsed EPW file.
- IDF and EPW uploads are registered but not simulated in the browser.
- Water, sewer, cost, and flood-damage values are first-order estimates.
- Health and biodiversity are intentionally deferred to avoid unsupported claims.
- The flood module is site-runoff oriented and does not model catchment hydraulics.

## Post-Hack Integration Path

1. Replace `buildHourlyProfile()` with parsed `baseline_hourly.csv` and
   `scenario_hourly.csv` exports from EnergyPlus.
2. Replace file-upload stubs with server-side parsing and simulation jobs.
3. Add a calibration notebook comparing surrogate outputs to EnergyPlus outputs.
4. Add a source-backed `data/factors.json` and `data/rates.json`.
5. Expand from the Houston anchor case to multiple climates and building types.
