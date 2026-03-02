import { downloadTemplate } from "giget";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

/**
 * @param {object} answers
 * @param {string} answers.directory
 * @param {string} answers.name
 * @param {string} answers.shortName
 * @param {Array<{date: string, label: string}>} answers.days
 * @param {string} answers.footerText
 * @param {string} answers.footerUrl
 * @param {boolean} answers.installDeps
 */
export async function scaffold(answers) {
  const targetDir = resolve(process.cwd(), answers.directory);

  // Clone template
  await downloadTemplate("github:bison-digital/drupal-camp-schedule", {
    dir: targetDir,
    force: false,
  });

  // Slugify the conference name for package.json
  const slug = answers.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const storageKey = `${slug}-favourites`;

  // Build config.ts — uses template default colors, user customises later
  const daysArray = answers.days
    .map((d) => `    { date: "${d.date}", label: "${d.label}" },`)
    .join("\n");

  const configContent = `import type { ConferenceConfig } from "./config.schema";

export const config: ConferenceConfig = {
  branding: {
    name: "${answers.name}",
    shortName: "${answers.shortName}",
    logoPath: "/logo.svg",
    logoAlt: "${answers.name}",
    footerText: "${answers.footerText}",
    footerUrl: "${answers.footerUrl}",
  },
  colors: {
    brandDark: "#1e293b",
    brandDarkAlt: "#1a2332",
    brandAccent: "#f59e0b",
    brandLight: "#38bdf8",
    brandMid: "#3b82f6",
    brandGradientEnd: "#2563eb",
    themeColor: "#1e293b",
  },
  days: [
${daysArray}
  ],
  dataSource: { type: "static-import" },
  favouritesStorageKey: "${storageKey}",
};
`;

  writeFileSync(resolve(targetDir, "src/config.ts"), configContent);

  // Update package.json name
  const pkgPath = resolve(targetDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.name = slug;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // Update wrangler.jsonc name
  const wranglerPath = resolve(targetDir, "wrangler.jsonc");
  let wrangler = readFileSync(wranglerPath, "utf-8");
  wrangler = wrangler.replace(/"name":\s*"[^"]*"/, `"name": "${slug}"`);
  writeFileSync(wranglerPath, wrangler);

  // Install dependencies
  if (answers.installDeps) {
    execSync("pnpm install", { cwd: targetDir, stdio: "inherit" });
  }

  return { targetDir, slug };
}
