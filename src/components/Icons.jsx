/**
 * Inline SVG icon set. Everything draws with `currentColor` so icons inherit
 * the status colour of whatever card they sit in.
 */

function Icon({ children, size = 20, fill = 'none', ...rest }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ brand */

export function Logo({ size = 40 }) {
  return (
    <svg
      className="logo"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Renal and Diabetic Nutrition Dashboard logo"
    >
      <defs>
        <linearGradient id="logo-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c6cf5" />
          <stop offset="55%" stopColor="#4f7bf7" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="logo-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="48" height="48" rx="13" fill="url(#logo-tile)" />
      <rect x="0" y="0" width="48" height="24" rx="13" fill="url(#logo-shine)" />

      {/* Droplet: fluid and blood-sugar tracking. */}
      <path
        d="M24 10c0 0 9 8.6 9 14.6a9 9 0 0 1-18 0C15 18.6 24 10 24 10z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* Pulse line threading through the droplet. */}
      <path
        d="M14 25.5h4l2.5-4.5 3.5 8 2.5-5 1.8 2.6H34"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------- metrics */

export function IconWheat(props) {
  return (
    <Icon {...props}>
      <path d="M12 21V10" />
      <path d="M12 14c0-2.4 1.7-4.2 4-4.4.2 2.6-1.5 4.4-4 4.4z" />
      <path d="M12 14c0-2.4-1.7-4.2-4-4.4-.2 2.6 1.5 4.4 4 4.4z" />
      <path d="M12 9c0-2.4 1.7-4.2 4-4.4.2 2.6-1.5 4.4-4 4.4z" />
      <path d="M12 9C12 6.6 10.3 4.8 8 4.6 7.8 7.2 9.5 9 12 9z" />
    </Icon>
  );
}

export function IconBolt(props) {
  return (
    <Icon {...props}>
      <path d="M13 3 5 14h5.5L10 21l8-11h-5.5z" />
    </Icon>
  );
}

export function IconSalt(props) {
  return (
    <Icon {...props}>
      <path d="M8 9h8l1 11H7z" />
      <path d="M10 9V6.5a2 2 0 1 1 4 0V9" />
      <path d="M10.5 13h.01M13.5 13h.01M12 16h.01" />
    </Icon>
  );
}

export function IconAtom(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="2" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-30 12 12)" />
    </Icon>
  );
}

export function IconCrystal(props) {
  return (
    <Icon {...props}>
      <path d="m12 3 7 4.2v9.6L12 21l-7-4.2V7.2z" />
      <path d="m12 3 4 5.5-4 4.5-4-4.5z" />
      <path d="M12 13v8" />
    </Icon>
  );
}

export function IconFish(props) {
  return (
    <Icon {...props}>
      <path d="M3.5 12c3.8-4.6 9.8-4.6 13.6 0-3.8 4.6-9.8 4.6-13.6 0z" />
      <path d="m17.1 12 3.4-3v6z" />
      <path d="M7.5 11.2h.01" />
    </Icon>
  );
}

export function IconDroplet(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c0 0 6.5 6.2 6.5 10.5a6.5 6.5 0 0 1-13 0C5.5 9.7 12 3.5 12 3.5z" />
    </Icon>
  );
}

export function IconFlame(props) {
  return (
    <Icon {...props}>
      <path d="M12 2.8c3.4 3 5.4 5.9 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-1.6.6-2.9 1.5-4 .2 1 .8 1.8 1.6 2.2-.3-3 .6-5.4 2.3-7.6z" />
    </Icon>
  );
}

const METRIC_ICONS = {
  netCarbs: IconWheat,
  glycemicLoad: IconBolt,
  sodium: IconSalt,
  potassium: IconAtom,
  phosphorus: IconCrystal,
  protein: IconFish,
  fluid: IconDroplet,
  energy: IconFlame,
};

export function MetricIcon({ metricKey, ...props }) {
  const Component = METRIC_ICONS[metricKey] ?? IconTarget;
  return <Component {...props} />;
}

/* ------------------------------------------------------------------ meals */

export function IconSunrise(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5v3M5.2 9.2l2.1 2.1M18.8 9.2l-2.1 2.1M2.5 18h19" />
      <path d="M7 18a5 5 0 0 1 10 0" />
      <path d="M9 21h6" />
    </Icon>
  );
}

export function IconSun(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </Icon>
  );
}

export function IconMoon(props) {
  return (
    <Icon {...props}>
      <path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9z" />
    </Icon>
  );
}

export function IconMug(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 8h11v5.5a5.5 5.5 0 0 1-11 0z" />
      <path d="M15.5 9.5H18a2.2 2.2 0 1 1 0 4.4h-2.5" />
      <path d="M3.5 20.5h13" />
    </Icon>
  );
}

const MEAL_ICONS = {
  breakfast: IconSunrise,
  lunch: IconSun,
  dinner: IconMoon,
  snack: IconMug,
};

export function MealIcon({ meal, ...props }) {
  const Component = MEAL_ICONS[meal] ?? IconMug;
  return <Component {...props} />;
}

/* --------------------------------------------------------------------- ui */

export function IconSearch(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.3 16.3 4.2 4.2" />
    </Icon>
  );
}

export function IconPlus(props) {
  return (
    <Icon {...props}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Icon>
  );
}

export function IconMinus(props) {
  return (
    <Icon {...props}>
      <path d="M5.5 12h13" />
    </Icon>
  );
}

export function IconTrash(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l1 13h9l1-13M10.5 11v5.5M13.5 11v5.5" />
    </Icon>
  );
}

export function IconChevronLeft(props) {
  return (
    <Icon {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </Icon>
  );
}

export function IconChevronRight(props) {
  return (
    <Icon {...props}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
    </Icon>
  );
}

export function IconCheck(props) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Icon>
  );
}

export function IconAlert(props) {
  return (
    <Icon {...props}>
      <path d="M12 4.5 21 20H3z" />
      <path d="M12 10.5v4M12 17.4h.01" />
    </Icon>
  );
}

export function IconTarget(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </Icon>
  );
}

export function IconSparkles(props) {
  return (
    <Icon {...props}>
      <path d="m12 3.5 1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8-4.8-1.7 4.8-1.7z" />
      <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </Icon>
  );
}

export function IconChart(props) {
  return (
    <Icon {...props}>
      <path d="M4 20.5V13M9.3 20.5V7M14.7 20.5v-9M20 20.5V4" />
    </Icon>
  );
}

export function IconSliders(props) {
  return (
    <Icon {...props}>
      <path d="M3.5 7.5h11M18.5 7.5h2M3.5 16.5h4M11.5 16.5h9" />
      <circle cx="16.5" cy="7.5" r="2" />
      <circle cx="9.5" cy="16.5" r="2" />
    </Icon>
  );
}

export function IconX(props) {
  return (
    <Icon {...props}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </Icon>
  );
}
