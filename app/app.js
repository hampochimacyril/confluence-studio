const HOURS_PER_YEAR = 8760;
const DAYS_PER_YEAR = 365;
const GAL_PER_M3 = 264.172;
const GAL_PER_CUBIC_FOOT = 7.48052;

const initialState = {
  activeTab: "dashboard",
  selectedScenario: "augmented",
  scrubHour: 12,
  stormEvent: "tmy_max",
  files: {
    idf: null,
    epw: null,
  },
  uploadLog: [
    "[OK] Loaded deterministic Houston surrogate weather profile.",
    "[OK] Loaded DOE mid-rise multifamily anchor assumptions.",
    "[READY] Waiting for optional IDF or EPW file registration.",
  ],
  factors: {
    embodiedEnergyPotable: 0.0089,
    embodiedEnergyWastewater: 0.0055,
    embodiedEnergyDhw: 0.21,
    embodiedWaterGrid: 0.6,
    gridCo2: 0.4,
    gasCo2: 0.181,
    rainCapacity: 25000,
    greywaterCapacity: 12000,
    greywaterEfficiency: 0.7,
    rainEfficiency: 0.8,
    pumpEnergy: 0.0015,
    roofArea: 15000,
    floorArea: 65000,
    femaAal: 55000,
  },
  rates: {
    peakStart: 14,
    peakEnd: 20,
    peakCost: 0.22,
    offPeakCost: 0.09,
    gasCost: 0.04,
    potableWaterRate: 0.0056,
    sewerWaterRate: 0.0072,
  },
};

const factorFields = [
  ["embodiedEnergyPotable", "Potable treatment energy", "kWh/gal", 0.0001, 0, 0.05],
  ["embodiedEnergyWastewater", "Wastewater treatment energy", "kWh/gal", 0.0001, 0, 0.05],
  ["embodiedEnergyDhw", "Domestic hot-water energy", "kWh/gal", 0.01, 0, 1],
  ["embodiedWaterGrid", "Embodied water of grid energy", "gal/kWh", 0.01, 0, 5],
  ["gridCo2", "Grid carbon intensity", "kg/kWh", 0.01, 0, 2],
  ["gasCo2", "Natural gas carbon intensity", "kg/kWh", 0.001, 0, 1],
  ["rainEfficiency", "Rain capture efficiency", "fraction", 0.01, 0, 1],
  ["pumpEnergy", "Recycling pump energy", "kWh/gal", 0.0001, 0, 0.02],
  ["floorArea", "Building floor area", "ft2", 1000, 1000, 500000],
];

const rateFields = [
  ["peakStart", "Peak period start", "hour", 1, 0, 23],
  ["peakEnd", "Peak period end", "hour", 1, 1, 24],
  ["peakCost", "Peak electricity rate", "$/kWh", 0.01, 0, 2],
  ["offPeakCost", "Off-peak electricity rate", "$/kWh", 0.01, 0, 2],
  ["gasCost", "Natural gas rate", "$/kWh", 0.01, 0, 1],
  ["potableWaterRate", "Potable water rate", "$/gal", 0.0001, 0, 0.1],
  ["sewerWaterRate", "Sewer rate", "$/gal", 0.0001, 0, 0.1],
];

let state = structuredClone(initialState);
let pendingFrame = false;

const profile = buildHourlyProfile();

document.addEventListener("DOMContentLoaded", () => {
  wireTabs();
  wireSegmentedControls();
  wireRangeControls();
  wireFileControls();
  renderEditableForms();
  render();
});

function buildHourlyProfile() {
  const rows = [];

  for (let hour = 0; hour < HOURS_PER_YEAR; hour += 1) {
    const day = Math.floor(hour / 24);
    const hourOfDay = hour % 24;
    const month = Math.min(11, Math.floor(day / 30.4375));
    const isWeekday = day % 7 < 5;
    const seasonal = Math.sin(((day - 100) / DAYS_PER_YEAR) * Math.PI * 2);
    const diurnal = Math.sin(((hourOfDay - 8) / 24) * Math.PI * 2);
    const outdoorTemp = 24 + 9.5 * seasonal + 4.2 * diurnal + deterministicNoise(day, hourOfDay, 1.8);
    const indoorTemp = 22.2;

    const occFactor = occupancyFactor(hourOfDay, isWeekday);
    const dhwDemand = (35 + deterministicNoise(hour, 3, 2.6)) * occFactor;
    const toiletDemand = (24 + deterministicNoise(hour, 7, 2.2)) * occFactor;
    const isWarmSeason = month >= 4 && month <= 8;
    const irrigationDemand = isWarmSeason && (hourOfDay === 5 || hourOfDay === 20)
      ? Math.max(0, 36 - Math.max(0, 27 - outdoorTemp) * 2.2)
      : 0;
    const coolingMakeup = isWarmSeason ? Math.max(0, (outdoorTemp - 21) * 7.5) : 0;

    const precipMm = houstonPrecipMm(day, hourOfDay);
    const electricityKwh = 42 + Math.abs(outdoorTemp - indoorTemp) * 4.8 + occFactor * 10.5;
    const gasKwh = outdoorTemp < 15 ? (15 - outdoorTemp) * 7.6 : 1.4;

    rows.push({
      hour,
      day,
      month,
      hourOfDay,
      isWeekday,
      outdoorTemp,
      indoorTemp,
      electricityKwh,
      gasKwh,
      dhwDemand: Math.max(0, dhwDemand),
      toiletDemand: Math.max(0, toiletDemand),
      irrigationDemand,
      coolingMakeup,
      precipMm,
    });
  }

  return rows;
}

function deterministicNoise(a, b, amplitude = 1) {
  const raw = Math.sin((a + 1) * 12.9898 + (b + 3) * 78.233) * 43758.5453;
  return (raw - Math.floor(raw) - 0.5) * 2 * amplitude;
}

function occupancyFactor(hourOfDay, isWeekday) {
  const weekdayAdjustment = isWeekday ? 1 : 1.07;
  if (hourOfDay >= 6 && hourOfDay <= 9) return 1.02 * weekdayAdjustment;
  if (hourOfDay >= 17 && hourOfDay <= 22) return 1.18 * weekdayAdjustment;
  if (hourOfDay >= 23 || hourOfDay <= 5) return 0.34 * weekdayAdjustment;
  return 0.62 * weekdayAdjustment;
}

function houstonPrecipMm(day, hourOfDay) {
  const seasonalWetness = 0.62 + 0.38 * Math.sin(((day - 135) / DAYS_PER_YEAR) * Math.PI * 2);
  const rainSignal = positiveMod(day * 37 + 11, 100);
  const convectiveHour = hourOfDay >= 10 && hourOfDay <= 16;
  let precip = 0;

  if (rainSignal < 16 && convectiveHour) {
    const hourPulse = Math.sin(((hourOfDay - 10) / 6) * Math.PI);
    precip = Math.max(0, (1.2 + 5.5 * seasonalWetness) * hourPulse);
  }

  if (day >= 180 && day <= 181) {
    const stormHour = (day - 180) * 24 + hourOfDay;
    precip += 8 + 14 * Math.exp(-((stormHour - 22) ** 2) / 95);
  }

  return precip;
}

function positiveMod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function computeMetrics(currentState) {
  const { factors, rates } = currentState;
  const totals = {
    baseline: emptyTotals(),
    scenario: emptyTotals(),
  };

  let rainTank = 0;
  let greyTank = 0;

  for (const hr of profile) {
    const rawRainGal = rainCollectedGal(hr.precipMm, factors.roofArea, factors.rainEfficiency);
    const greyGenerated = hr.dhwDemand * 0.75 * factors.greywaterEfficiency;
    const baselineWaterDemand = hr.dhwDemand + hr.toiletDemand + hr.irrigationDemand + hr.coolingMakeup;
    const baselineSewerVolume = hr.dhwDemand * 0.9 + hr.toiletDemand;
    const electricityPrice = electricityRateForHour(hr, rates);

    totals.baseline.mainsWater += baselineWaterDemand;
    totals.baseline.sewerVolume += baselineSewerVolume;
    totals.baseline.electricity += hr.electricityKwh;
    totals.baseline.gas += hr.gasKwh;
    totals.baseline.waterBill += baselineWaterDemand * rates.potableWaterRate + baselineSewerVolume * rates.sewerWaterRate;
    totals.baseline.energyBill += hr.electricityKwh * electricityPrice + hr.gasKwh * rates.gasCost;

    rainTank = Math.min(factors.rainCapacity, rainTank + rawRainGal);
    greyTank = Math.min(factors.greywaterCapacity, greyTank + greyGenerated);

    const toiletAndIrrigation = hr.toiletDemand + hr.irrigationDemand;
    const rainToDemand = Math.min(toiletAndIrrigation, rainTank);
    rainTank -= rainToDemand;

    const remainingToiletAndIrrigation = Math.max(0, toiletAndIrrigation - rainToDemand);
    const greyToNonPotable = Math.min(remainingToiletAndIrrigation, greyTank);
    greyTank -= greyToNonPotable;

    const coolingFromGrey = Math.min(hr.coolingMakeup, greyTank);
    greyTank -= coolingFromGrey;

    const remainingCooling = Math.max(0, hr.coolingMakeup - coolingFromGrey);
    const scenarioMainsWater = hr.dhwDemand + Math.max(0, remainingToiletAndIrrigation - greyToNonPotable) + remainingCooling;
    const gallonsPumped = rainToDemand + greyToNonPotable + coolingFromGrey;
    const pumpKwh = gallonsPumped * factors.pumpEnergy;
    const greyUsed = greyToNonPotable + coolingFromGrey;
    const scenarioSewerVolume = Math.max(0, hr.dhwDemand * 0.9 + hr.toiletDemand - greyGenerated * 0.55);

    totals.scenario.mainsWater += scenarioMainsWater;
    totals.scenario.sewerVolume += scenarioSewerVolume;
    totals.scenario.electricity += hr.electricityKwh + pumpKwh;
    totals.scenario.gas += hr.gasKwh;
    totals.scenario.waterBill += scenarioMainsWater * rates.potableWaterRate + scenarioSewerVolume * rates.sewerWaterRate;
    totals.scenario.energyBill += (hr.electricityKwh + pumpKwh) * electricityPrice + hr.gasKwh * rates.gasCost;
    totals.scenario.rainwaterUsed += rainToDemand;
    totals.scenario.greywaterUsed += greyUsed;
    totals.scenario.pumpEnergy += pumpKwh;
  }

  finalizeTotals(totals.baseline, factors);
  finalizeTotals(totals.scenario, factors);

  totals.scenario.capEx = factors.rainCapacity * 4 + factors.greywaterCapacity * 1.25 + 3000;
  totals.scenario.annualSavings =
    totals.baseline.waterBill + totals.baseline.energyBill - totals.scenario.waterBill - totals.scenario.energyBill;
  totals.scenario.paybackPeriod = totals.scenario.annualSavings > 1
    ? totals.scenario.capEx / totals.scenario.annualSavings
    : Number.POSITIVE_INFINITY;

  return totals;
}

function emptyTotals() {
  return {
    mainsWater: 0,
    sewerVolume: 0,
    electricity: 0,
    gas: 0,
    waterBill: 0,
    energyBill: 0,
    rainwaterUsed: 0,
    greywaterUsed: 0,
    pumpEnergy: 0,
    embodiedEnergy: 0,
    co2: 0,
    weni: 0,
    capEx: 0,
    annualSavings: 0,
    paybackPeriod: 0,
  };
}

function finalizeTotals(total, factors) {
  const wastewaterEnergy = Math.max(0, total.sewerVolume) * factors.embodiedEnergyWastewater;
  const potableEnergy = total.mainsWater * factors.embodiedEnergyPotable;
  const dhwEnergy = total.mainsWater * 0.21 * factors.embodiedEnergyDhw;
  const embodiedWaterOfEnergy = total.electricity * factors.embodiedWaterGrid;

  total.embodiedEnergy = potableEnergy + wastewaterEnergy + dhwEnergy;
  total.co2 =
    total.electricity * factors.gridCo2 +
    total.gas * factors.gasCo2 +
    total.embodiedEnergy * factors.gridCo2;
  total.weni = (total.embodiedEnergy + embodiedWaterOfEnergy * factors.embodiedEnergyPotable) / factors.floorArea;
}

function electricityRateForHour(hr, rates) {
  return hr.isWeekday && hr.hourOfDay >= rates.peakStart && hr.hourOfDay < rates.peakEnd
    ? rates.peakCost
    : rates.offPeakCost;
}

function rainCollectedGal(precipMm, roofAreaFt2, rainEfficiency) {
  return Math.max(0, (precipMm / 25.4 / 12) * roofAreaFt2 * GAL_PER_CUBIC_FOOT * rainEfficiency);
}

function computeSankeyFlows(currentState) {
  const { factors, selectedScenario, scrubHour } = currentState;
  const rows = profile.filter((row) => row.hourOfDay === scrubHour);
  const avg = (getter) => rows.reduce((sum, row) => sum + getter(row), 0) / rows.length;

  const dhw = avg((row) => row.dhwDemand);
  const toilet = avg((row) => row.toiletDemand);
  const irrigation = avg((row) => row.irrigationDemand);
  const cooling = avg((row) => row.coolingMakeup);
  const rain = selectedScenario === "augmented"
    ? avg((row) => rainCollectedGal(row.precipMm, factors.roofArea, factors.rainEfficiency))
    : 0;
  const grey = selectedScenario === "augmented" ? dhw * 0.75 * factors.greywaterEfficiency : 0;
  const rainUsed = Math.min(rain, toilet + irrigation);
  const remainingNonPotable = Math.max(0, toilet + irrigation - rainUsed);
  const greyUsed = Math.min(grey, remainingNonPotable + cooling);
  const mains = Math.max(0, dhw + toilet + irrigation + cooling - rainUsed - greyUsed);
  const sewer = Math.max(0, dhw * 0.9 + toilet - grey * 0.55);
  const evap = irrigation * 0.82 + cooling * 0.95;

  return {
    mains,
    rain,
    grey,
    rainUsed,
    greyUsed,
    dhw,
    toilet,
    irrigation,
    cooling,
    sewer,
    evap,
  };
}

function computeFloodAnalysis(currentState) {
  const { factors, stormEvent } = currentState;
  const steps = [];
  const totalRainInches = stormEvent === "harvey" ? 32 : 6.4;
  const weights = Array.from({ length: 72 }, (_, hour) => {
    const primary = Math.exp(-((hour - 18) ** 2) / 22);
    const shoulder = 0.3 * Math.exp(-((hour - 42) ** 2) / 260);
    return primary + shoulder + 0.02;
  });
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  let tankVolume = factors.rainCapacity * 0.05;
  const activeDrawdownGalPerHour = factors.rainCapacity * (stormEvent === "harvey" ? 0.012 : 0.022);
  const siteImperviousMultiplier = 2.1;

  for (let hour = 0; hour < 72; hour += 1) {
    tankVolume = Math.max(0, tankVolume - activeDrawdownGalPerHour);
    const precipInches = (weights[hour] / weightSum) * totalRainInches;
    const roofRunoff = (precipInches / 12) * factors.roofArea * GAL_PER_CUBIC_FOOT;
    const runoffRaw = roofRunoff * siteImperviousMultiplier;
    const capturePotential = roofRunoff * factors.rainEfficiency;
    const runoffCaptured = Math.min(capturePotential, Math.max(0, factors.rainCapacity - tankVolume));
    tankVolume = Math.min(factors.rainCapacity, tankVolume + runoffCaptured);
    const bypassStormwater = Math.max(0, runoffRaw - runoffCaptured);

    steps.push({
      hour,
      precipInches,
      runoffRaw,
      runoffCaptured,
      bypassStormwater,
      tankFillPercent: factors.rainCapacity > 0 ? (tankVolume / factors.rainCapacity) * 100 : 0,
    });
  }

  const totalRawRunoff = sumBy(steps, "runoffRaw");
  const totalOverflowRunoff = sumBy(steps, "bypassStormwater");
  const peakRawRunoff = Math.max(...steps.map((step) => step.runoffRaw));
  const peakOverflowRunoff = Math.max(...steps.map((step) => step.bypassStormwater));
  const peakRunoffReductionPercent = peakRawRunoff > 0
    ? ((peakRawRunoff - peakOverflowRunoff) / peakRawRunoff) * 100
    : 0;
  const damageReductionPercent = Math.min(30, (peakRunoffReductionPercent / 10) * 3);
  const avoidedAnnualDamage = factors.femaAal * (damageReductionPercent / 100);

  return {
    steps,
    totalRawRunoff,
    totalOverflowRunoff,
    peakRunoffReductionPercent,
    damageReductionPercent,
    avoidedAnnualDamage,
  };
}

function sumBy(rows, key) {
  return rows.reduce((sum, row) => sum + row[key], 0);
}

function wireTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      document.querySelectorAll("[data-panel]").forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.panel === state.activeTab);
      });
      scheduleRender();
    });
  });
}

function wireSegmentedControls() {
  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedScenario = button.dataset.scenario;
      document.querySelectorAll("[data-scenario]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.scenario === state.selectedScenario);
      });
      scheduleRender();
    });
  });

  document.querySelectorAll("[data-storm]").forEach((button) => {
    button.addEventListener("click", () => {
      state.stormEvent = button.dataset.storm;
      document.querySelectorAll("[data-storm]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.storm === state.stormEvent);
      });
      scheduleRender();
    });
  });
}

function wireRangeControls() {
  document.querySelectorAll("[data-state-key]").forEach((input) => {
    const key = input.dataset.stateKey;
    input.value = state.factors[key];
    input.addEventListener("input", () => {
      state.factors[key] = Number(input.value);
      scheduleRender();
    });
  });

  const scrub = document.getElementById("scrubHour");
  scrub.value = state.scrubHour;
  scrub.addEventListener("input", () => {
    state.scrubHour = Number(scrub.value);
    scheduleRender();
  });
}

function wireFileControls() {
  document.querySelectorAll("[data-file-type]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      const fileType = input.dataset.fileType;
      state.files[fileType] = file.name;
      state.uploadLog.push(`[INIT] Registered ${file.name} as ${fileType.toUpperCase()} input.`);
      state.uploadLog.push(`[OK] ${fileType.toUpperCase()} file accepted for post-MVP EnergyPlus pipeline.`);
      state.uploadLog.push("[WARN] Static MVP does not run EnergyPlus locally; using Houston surrogate model for live demo.");
      scheduleRender();
    });
  });

  document.getElementById("resetFiles").addEventListener("click", () => {
    state.files = { idf: null, epw: null };
    state.uploadLog.push("[RESET] Cleared file overrides and restored bundled Houston defaults.");
    document.querySelectorAll("[data-file-type]").forEach((input) => {
      input.value = "";
    });
    scheduleRender();
  });
}

function renderEditableForms() {
  const factorForm = document.querySelector('[data-form="factors"]');
  const rateForm = document.querySelector('[data-form="rates"]');
  factorForm.innerHTML = factorFields.map((field) => formFieldTemplate(field, "factors")).join("");
  rateForm.innerHTML = rateFields.map((field) => formFieldTemplate(field, "rates")).join("");

  document.querySelectorAll("[data-edit-key]").forEach((input) => {
    const bucket = input.dataset.editBucket;
    const key = input.dataset.editKey;
    input.value = state[bucket][key];
    input.addEventListener("input", () => {
      const fallback = initialState[bucket][key];
      const next = Number(input.value);
      state[bucket][key] = Number.isFinite(next) ? next : fallback;
      scheduleRender();
    });
  });
}

function formFieldTemplate([key, label, unit, step, min, max], bucket) {
  return `
    <label class="form-field">
      <span>${label}</span>
      <input
        data-edit-bucket="${bucket}"
        data-edit-key="${key}"
        type="number"
        step="${step}"
        min="${min}"
        max="${max}"
        aria-label="${label} (${unit})"
      />
    </label>
  `;
}

function scheduleRender() {
  if (pendingFrame) return;
  pendingFrame = true;
  requestAnimationFrame(() => {
    pendingFrame = false;
    render();
  });
}

function render() {
  const metrics = computeMetrics(state);
  const flood = computeFloodAnalysis(state);
  const sankey = computeSankeyFlows(state);
  renderNumbers(metrics, flood);
  renderFlowDiagram(sankey);
  renderHydrograph(flood);
  renderUploadLog();
}

function renderNumbers(metrics, flood) {
  const waterSaved = metrics.baseline.mainsWater - metrics.scenario.mainsWater;
  const co2Saved = metrics.baseline.co2 - metrics.scenario.co2;
  const cars = co2Saved / 4600;
  const pools = waterSaved / 660000;
  const weniDelta = metrics.baseline.weni - metrics.scenario.weni;

  setText("rainCapacityLabel", fmtNumber(state.factors.rainCapacity));
  setText("greyCapacityLabel", fmtNumber(state.factors.greywaterCapacity));
  setText("rainCapacity", `${fmtNumber(state.factors.rainCapacity)} gal`);
  setText("greywaterCapacity", `${fmtNumber(state.factors.greywaterCapacity)} gal`);
  setText("greywaterEfficiency", fmtPercent(state.factors.greywaterEfficiency));
  setText("roofArea", `${fmtNumber(state.factors.roofArea)} ft2`);
  setText("femaAal", fmtCurrency(state.factors.femaAal));
  setText("scrubHour", String(state.scrubHour).padStart(2, "0"));
  setText("scrubHourLabel", `${String(state.scrubHour).padStart(2, "0")}:00 average`);

  setText("waterSaved", fmtNumber(waterSaved, 0));
  setText("co2Saved", fmtNumber(co2Saved, 0));
  setText("equivalence", `The current water-loop design avoids about ${fmtNumber(waterSaved, 0)} gallons of mains water and ${fmtNumber(co2Saved, 0)} kg CO2e each year, roughly ${fmtNumber(cars, 1)} cars off the road or ${fmtNumber(pools, 2)} Olympic pools of water.`);
  setText("mainsWaterSaved", `${fmtNumber(waterSaved, 0)} gal`);
  setText("annualSavings", `${fmtCurrency(metrics.scenario.annualSavings)}/yr`);
  setText("weniDelta", `${fmtNumber(weniDelta, 4)} kWh/ft2`);
  setText("weniBase", `${fmtNumber(metrics.scenario.weni, 4)} scenario vs ${fmtNumber(metrics.baseline.weni, 4)} baseline`);
  setText("payback", Number.isFinite(metrics.scenario.paybackPeriod) ? `${fmtNumber(metrics.scenario.paybackPeriod, 1)} yr` : "No payback");
  setText("capex", `${fmtCurrency(metrics.scenario.capEx)} installed cost proxy`);
  setText("baselineCo2", `${fmtNumber(metrics.baseline.co2, 0)} kg CO2e`);
  setText("scenarioCo2", `${fmtNumber(metrics.scenario.co2, 0)} kg CO2e`);
  setText("pumpEnergy", `${fmtNumber(metrics.scenario.pumpEnergy, 0)} kWh`);
  setText("rainUsed", `${fmtNumber(metrics.scenario.rainwaterUsed, 0)} gal`);
  setText("greyUsed", `${fmtNumber(metrics.scenario.greywaterUsed, 0)} gal`);

  setText("peakReduction", fmtPercent(flood.peakRunoffReductionPercent / 100, 1));
  setText("avoidedDamage", `${fmtCurrency(flood.avoidedAnnualDamage)}/yr`);
  setText("stormLabel", state.stormEvent === "harvey" ? "32.0 in / 72 hr" : "6.4 in / 72 hr");
  setText("totalRunoff", `${fmtNumber(flood.totalRawRunoff, 0)} gal`);
  setText("overflowRunoff", `${fmtNumber(flood.totalOverflowRunoff, 0)} gal`);
  setText("damageReduction", fmtPercent(flood.damageReductionPercent / 100, 1));
  setText("idfName", state.files.idf || "Use bundled Houston prototype");
  setText("epwName", state.files.epw || "Use synthetic Houston TMY surrogate");

  syncRange("rainCapacity", state.factors.rainCapacity);
  syncRange("greywaterCapacity", state.factors.greywaterCapacity);
  syncRange("greywaterEfficiency", state.factors.greywaterEfficiency);
  syncRange("roofArea", state.factors.roofArea);
  syncRange("femaAal", state.factors.femaAal);
  syncRange("scrubHour", state.scrubHour);
}

function renderFlowDiagram(flows) {
  const linkLayer = document.getElementById("flowLinks");
  const nodeLayer = document.getElementById("flowNodes");
  linkLayer.innerHTML = "";
  nodeLayer.innerHTML = "";

  const nodes = [
    ["mains", "Mains", flows.mains, 44, 72],
    ["rain", "Rain Harvest", flows.rain, 44, 184],
    ["grey", "Greywater", flows.grey, 44, 296],
    ["dhw", "DHW", flows.dhw, 545, 60],
    ["nonpotable", "Toilets + Irrigation", flows.toilet + flows.irrigation, 545, 172],
    ["cooling", "Cooling Makeup", flows.cooling, 545, 284],
  ];

  const links = [
    ["M 154 95 C 285 70 390 70 545 82", flows.dhw, "url(#mainsGrad)", 0.55],
    ["M 154 95 C 290 125 390 150 545 190", Math.max(0, flows.mains - flows.dhw), "url(#mainsGrad)", 0.35],
    ["M 154 207 C 300 205 385 194 545 194", flows.rainUsed, "url(#rainGrad)", 0.78],
    ["M 154 319 C 300 300 390 230 545 195", Math.min(flows.greyUsed, flows.toilet + flows.irrigation), "url(#greyGrad)", 0.78],
    ["M 154 319 C 300 330 400 310 545 306", Math.max(0, flows.greyUsed - (flows.toilet + flows.irrigation)), "url(#greyGrad)", 0.75],
  ];

  for (const [path, value, stroke, opacity] of links) {
    if (value <= 0.05) continue;
    const link = svgEl("path", {
      d: path,
      class: "flow-link",
      stroke,
      "stroke-width": Math.max(2, Math.min(38, value * 0.34)),
      "stroke-opacity": opacity,
    });
    linkLayer.appendChild(link);
  }

  for (const [, label, value, x, y] of nodes) {
    const group = svgEl("g", {});
    group.appendChild(svgEl("rect", { class: "node-box", x, y, width: 130, height: 58 }));
    group.appendChild(svgText(label, x + 12, y + 24, "node-label"));
    group.appendChild(svgText(`${fmtNumber(value, 1)} gal/hr`, x + 12, y + 43, "node-value"));
    nodeLayer.appendChild(group);
  }
}

function renderHydrograph(flood) {
  const svg = document.getElementById("hydroSvg");
  svg.innerHTML = "";

  const width = 960;
  const height = 420;
  const margin = { top: 30, right: 34, bottom: 46, left: 54 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const maxRunoff = Math.max(...flood.steps.map((step) => step.runoffRaw), 1);
  const barWidth = chartWidth / flood.steps.length;

  for (let i = 0; i <= 4; i += 1) {
    const y = margin.top + (chartHeight / 4) * i;
    svg.appendChild(svgEl("line", {
      class: "grid-line",
      x1: margin.left,
      y1: y,
      x2: width - margin.right,
      y2: y,
    }));
  }

  svg.appendChild(svgEl("line", {
    class: "axis-line",
    x1: margin.left,
    y1: height - margin.bottom,
    x2: width - margin.right,
    y2: height - margin.bottom,
  }));
  svg.appendChild(svgEl("line", {
    class: "axis-line",
    x1: margin.left,
    y1: margin.top,
    x2: margin.left,
    y2: height - margin.bottom,
  }));

  flood.steps.forEach((step, index) => {
    const x = margin.left + index * barWidth;
    const capturedHeight = (step.runoffCaptured / maxRunoff) * chartHeight;
    const overflowHeight = (step.bypassStormwater / maxRunoff) * chartHeight;
    const baseY = height - margin.bottom;

    svg.appendChild(svgEl("rect", {
      class: "bar-captured",
      x: x + 1,
      y: baseY - capturedHeight,
      width: Math.max(1, barWidth - 2),
      height: capturedHeight,
      opacity: 0.9,
    }));

    if (overflowHeight > 0.5) {
      svg.appendChild(svgEl("rect", {
        class: "bar-overflow",
        x: x + 1,
        y: baseY - capturedHeight - overflowHeight,
        width: Math.max(1, barWidth - 2),
        height: overflowHeight,
        opacity: 0.78,
      }));
    }
  });

  const linePoints = flood.steps.map((step, index) => {
    const x = margin.left + index * barWidth + barWidth / 2;
    const y = height - margin.bottom - (clamp(step.tankFillPercent, 0, 100) / 100) * chartHeight;
    return `${x},${y}`;
  });
  svg.appendChild(svgEl("polyline", {
    class: "line-fill",
    points: linePoints.join(" "),
  }));

  svg.appendChild(svgText("Captured runoff", margin.left + 8, margin.top + 18, "node-value"));
  const overflowLabel = svgText("Overflow", margin.left + 150, margin.top + 18, "node-value");
  overflowLabel.setAttribute("fill", "#fb7185");
  svg.appendChild(overflowLabel);
  const tankLabel = svgText("Tank fill", margin.left + 240, margin.top + 18, "node-value");
  tankLabel.setAttribute("fill", "#f6c453");
  svg.appendChild(tankLabel);
  svg.appendChild(svgText("72-hour event", width - margin.right - 105, height - 18, "node-value"));
}

function renderUploadLog() {
  const terminal = document.querySelector('[data-field="uploadLog"]');
  terminal.innerHTML = state.uploadLog
    .slice(-16)
    .map((line) => {
      const className = line.includes("[OK]") || line.includes("[READY]") ? "ok" : line.includes("[WARN]") ? "warn" : "";
      return `<div class="${className}">&gt; ${escapeHtml(line)}</div>`;
    })
    .join("");
}

function setText(field, value) {
  document.querySelectorAll(`[data-field="${field}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function syncRange(id, value) {
  const input = document.getElementById(id);
  if (input && Number(input.value) !== Number(value)) {
    input.value = value;
  }
}

function svgEl(name, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
  return node;
}

function svgText(text, x, y, className) {
  const node = svgEl("text", { x, y, class: className });
  node.textContent = text;
  return node;
}

function fmtNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "n/a";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function fmtCurrency(value) {
  if (!Number.isFinite(value)) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtPercent(value, digits = 0) {
  if (!Number.isFinite(value)) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
