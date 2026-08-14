/**
 * Starting-point daily limits drawn from published KDOQI nutrition guidance and
 * ADA carbohydrate guidance. These are population-level ranges, not a
 * prescription — every target in the app is editable for that reason.
 */
export const TARGET_PRESETS = [
  {
    id: 'ckd-3-4',
    label: 'CKD stage 3–4, not on dialysis',
    summary:
      'Protein is held down to slow decline, phosphorus and sodium restricted, fluid usually unrestricted.',
    targets: {
      energy: 2000,
      protein: 55,
      netCarbs: 180,
      glycemicLoad: 100,
      sodium: 2000,
      potassium: 2700,
      phosphorus: 900,
      fluid: 2000,
    },
  },
  {
    id: 'hemodialysis',
    label: 'Hemodialysis (in-center, 3×/week)',
    summary:
      'Protein goes up to replace dialysis losses, while fluid and potassium tighten between sessions.',
    targets: {
      energy: 2100,
      protein: 90,
      netCarbs: 180,
      glycemicLoad: 100,
      sodium: 2000,
      potassium: 2400,
      phosphorus: 900,
      fluid: 1000,
    },
  },
  {
    id: 'peritoneal',
    label: 'Peritoneal dialysis',
    summary:
      'Continuous clearance loosens potassium and fluid limits; dextrose in the dialysate adds carbohydrate.',
    targets: {
      energy: 2000,
      protein: 95,
      netCarbs: 150,
      glycemicLoad: 90,
      sodium: 2000,
      potassium: 3500,
      phosphorus: 1000,
      fluid: 1500,
    },
  },
  {
    id: 'diabetes-only',
    label: 'Type 2 diabetes, normal kidney function',
    summary:
      'Carbohydrate and glycemic load are the focus; mineral limits follow general population guidance.',
    targets: {
      energy: 2000,
      protein: 90,
      netCarbs: 150,
      glycemicLoad: 80,
      sodium: 2300,
      potassium: 3400,
      phosphorus: 1250,
      fluid: 2500,
    },
  },
];

export const DEFAULT_PRESET_ID = 'ckd-3-4';

export function getPreset(id) {
  return TARGET_PRESETS.find((preset) => preset.id === id) ?? TARGET_PRESETS[0];
}

/** Fraction of the daily limit at which each warning level begins. */
export const ALERT_THRESHOLDS = {
  caution: 0.7,
  warning: 0.9,
  over: 1,
};

export function statusForRatio(ratio) {
  if (ratio >= ALERT_THRESHOLDS.over) return 'over';
  if (ratio >= ALERT_THRESHOLDS.warning) return 'warning';
  if (ratio >= ALERT_THRESHOLDS.caution) return 'caution';
  return 'ok';
}

export const STATUS_LABELS = {
  ok: 'On track',
  caution: 'Approaching limit',
  warning: 'Close to limit',
  over: 'Over limit',
};
