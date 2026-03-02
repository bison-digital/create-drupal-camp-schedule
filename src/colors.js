/** @typedef {{ brandDark: string, brandDarkAlt: string, brandAccent: string, brandLight: string, brandMid: string, brandGradientEnd: string, themeColor: string }} ColorPreset */

/** @type {Record<string, ColorPreset>} */
export const presets = {
  ocean: {
    brandDark: "#0f172a",
    brandDarkAlt: "#0c1220",
    brandAccent: "#06b6d4",
    brandLight: "#38bdf8",
    brandMid: "#0284c7",
    brandGradientEnd: "#0369a1",
    themeColor: "#0f172a",
  },
  sunset: {
    brandDark: "#7c2d12",
    brandDarkAlt: "#6b2710",
    brandAccent: "#f97316",
    brandLight: "#fbbf24",
    brandMid: "#ea580c",
    brandGradientEnd: "#c2410c",
    themeColor: "#7c2d12",
  },
  forest: {
    brandDark: "#14532d",
    brandDarkAlt: "#104626",
    brandAccent: "#22c55e",
    brandLight: "#86efac",
    brandMid: "#16a34a",
    brandGradientEnd: "#15803d",
    themeColor: "#14532d",
  },
  slate: {
    brandDark: "#1e293b",
    brandDarkAlt: "#1a2332",
    brandAccent: "#f59e0b",
    brandLight: "#38bdf8",
    brandMid: "#3b82f6",
    brandGradientEnd: "#2563eb",
    themeColor: "#1e293b",
  },
};

/** @type {Record<string, string>} */
export const presetLabels = {
  ocean: "Ocean (navy / teal)",
  sunset: "Sunset (warm red / orange)",
  forest: "Forest (green / emerald)",
  slate: "Slate (blue / amber)",
};
