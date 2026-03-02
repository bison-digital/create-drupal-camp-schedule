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
 * @param {object} answers.colors
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

  // Build config.ts content
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
    brandDark: "${answers.colors.brandDark}",
    brandDarkAlt: "${answers.colors.brandDarkAlt}",
    brandAccent: "${answers.colors.brandAccent}",
    brandLight: "${answers.colors.brandLight}",
    brandMid: "${answers.colors.brandMid}",
    brandGradientEnd: "${answers.colors.brandGradientEnd}",
    themeColor: "${answers.colors.themeColor}",
  },
  days: [
${daysArray}
  ],
  dataSource: { type: "static-import" },
  favouritesStorageKey: "${storageKey}",
};
`;

  writeFileSync(resolve(targetDir, "src/config.ts"), configContent);

  // Update index.css @theme block
  const cssPath = resolve(targetDir, "src/index.css");
  let css = readFileSync(cssPath, "utf-8");
  css = css
    .replace(/--color-brand-dark:\s*#[0-9a-fA-F]+/, `--color-brand-dark: ${answers.colors.brandDark}`)
    .replace(/--color-brand-dark-alt:\s*#[0-9a-fA-F]+/, `--color-brand-dark-alt: ${answers.colors.brandDarkAlt}`)
    .replace(/--color-brand-accent:\s*#[0-9a-fA-F]+/, `--color-brand-accent: ${answers.colors.brandAccent}`)
    .replace(/--color-brand-light:\s*#[0-9a-fA-F]+/, `--color-brand-light: ${answers.colors.brandLight}`)
    .replace(/--color-brand-mid:\s*#[0-9a-fA-F]+/, `--color-brand-mid: ${answers.colors.brandMid}`)
    .replace(/--color-brand-gradient-end:\s*#[0-9a-fA-F]+/, `--color-brand-gradient-end: ${answers.colors.brandGradientEnd}`);
  writeFileSync(cssPath, css);

  // Update index.html theme-color
  const htmlPath = resolve(targetDir, "index.html");
  let html = readFileSync(htmlPath, "utf-8");
  html = html.replace(
    /content="#[0-9a-fA-F]+"(\s*\/>.*theme-color|.*name="theme-color")/s,
    `content="${answers.colors.themeColor}"$1`,
  );
  // Simpler approach: just replace the theme-color meta
  html = readFileSync(htmlPath, "utf-8");
  html = html.replace(
    /<meta name="theme-color" content="[^"]*"/,
    `<meta name="theme-color" content="${answers.colors.themeColor}"`,
  );
  writeFileSync(htmlPath, html);

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
