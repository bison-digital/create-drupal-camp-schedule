import * as p from "@clack/prompts";
import { presets, presetLabels } from "./colors.js";

export async function gatherAnswers() {
  p.intro("Create Drupal Camp Schedule");

  const project = await p.group(
    {
      directory: () =>
        p.text({
          message: "Where should we create your project?",
          placeholder: "./my-conference",
          validate: (v) => {
            if (!v.trim()) return "Please enter a directory name";
          },
        }),
      name: () =>
        p.text({
          message: "What is your conference called?",
          placeholder: "Drupal Camp Scotland 2026",
          validate: (v) => {
            if (!v.trim()) return "Please enter a name";
          },
        }),
      shortName: () =>
        p.text({
          message: "Short name (shown in browser tab)?",
          placeholder: "DCS Schedule",
          validate: (v) => {
            if (!v.trim()) return "Please enter a short name";
          },
        }),
      dayCount: () =>
        p.select({
          message: "How many conference days?",
          options: [
            { value: 1, label: "1 day" },
            { value: 2, label: "2 days" },
            { value: 3, label: "3 days" },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    },
  );

  const days = [];
  for (let i = 0; i < project.dayCount; i++) {
    const day = await p.group(
      {
        date: () =>
          p.text({
            message: `Day ${i + 1} date (YYYY-MM-DD)?`,
            placeholder: "2026-09-12",
            validate: (v) => {
              if (!/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return "Use YYYY-MM-DD format";
            },
          }),
        label: () =>
          p.text({
            message: `Day ${i + 1} label (e.g. "Sat 12 Sep")?`,
            placeholder: "Sat 12 Sep",
            validate: (v) => {
              if (!v.trim()) return "Please enter a label";
            },
          }),
      },
      {
        onCancel: () => {
          p.cancel("Setup cancelled.");
          process.exit(0);
        },
      },
    );
    days.push(day);
  }

  const colorTheme = await p.select({
    message: "Choose a colour theme:",
    options: Object.entries(presetLabels).map(([key, label]) => ({
      value: key,
      label,
    })),
  });

  if (p.isCancel(colorTheme)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  const colors = presets[colorTheme];

  const footer = await p.group(
    {
      text: () =>
        p.text({
          message: "Footer credit text?",
          placeholder: "Your Organization",
          validate: (v) => {
            if (!v.trim()) return "Please enter footer text";
          },
        }),
      url: () =>
        p.text({
          message: "Footer URL?",
          placeholder: "https://example.com",
          validate: (v) => {
            if (!v.trim()) return "Please enter a URL";
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel("Setup cancelled.");
        process.exit(0);
      },
    },
  );

  const installDeps = await p.confirm({
    message: "Install dependencies with pnpm?",
    initialValue: true,
  });

  if (p.isCancel(installDeps)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  return {
    directory: project.directory.trim(),
    name: project.name.trim(),
    shortName: project.shortName.trim(),
    days,
    colors,
    footerText: footer.text.trim(),
    footerUrl: footer.url.trim(),
    installDeps,
  };
}
