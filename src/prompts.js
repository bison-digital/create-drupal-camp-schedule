import * as p from "@clack/prompts";

/**
 * Format a Date as "Sat 28 Feb"
 * @param {Date} date
 * @returns {string}
 */
function formatDayLabel(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Format a Date as "YYYY-MM-DD"
 * @param {Date} date
 * @returns {string}
 */
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Add days to a Date
 * @param {Date} date
 * @param {number} n
 * @returns {Date}
 */
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export async function gatherAnswers() {
  p.intro("Create Drupal Camp Schedule");

  const project = await p.group(
    {
      directory: () =>
        p.text({
          message: "Project directory:",
          placeholder: "./drupal-camp-schedule",
          validate: (v) => {
            if (!v.trim()) return "Please enter a directory name";
          },
        }),
      name: () =>
        p.text({
          message: "Conference name:",
          placeholder: "Drupal Camp",
          validate: (v) => {
            if (!v.trim()) return "Please enter a name";
          },
        }),
      shortName: () =>
        p.text({
          message: "Short name (shown in browser tab):",
          placeholder: "Schedule",
          validate: (v) => {
            if (!v.trim()) return "Please enter a short name";
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

  // Days — default to consecutive from a start date
  const daySetup = await p.group(
    {
      startDate: () =>
        p.text({
          message: "First day of the conference (YYYY-MM-DD):",
          placeholder: "2026-09-12",
          validate: (v) => {
            const trimmed = v.trim();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "Use YYYY-MM-DD format";
            const d = new Date(trimmed + "T12:00:00");
            if (isNaN(d.getTime())) return "Invalid date";
          },
        }),
      dayCount: () =>
        p.select({
          message: "How many days?",
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

  // Generate consecutive days
  const startDate = new Date(daySetup.startDate.trim() + "T12:00:00");
  const days = [];
  for (let i = 0; i < daySetup.dayCount; i++) {
    const d = addDays(startDate, i);
    days.push({ date: formatDateISO(d), label: formatDayLabel(d) });
  }

  // Show the generated days and let them confirm or adjust
  const daysPreview = days.map((d) => `  ${d.date} — ${d.label}`).join("\n");
  p.note(daysPreview, "Conference days");

  const daysOk = await p.confirm({
    message: "Are these days correct?",
    initialValue: true,
  });

  if (p.isCancel(daysOk)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  // If not OK, let them enter each day manually
  if (!daysOk) {
    days.length = 0;
    const manualCount = daySetup.dayCount;
    for (let i = 0; i < manualCount; i++) {
      const day = await p.group(
        {
          date: () =>
            p.text({
              message: `Day ${i + 1} date (YYYY-MM-DD):`,
              validate: (v) => {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return "Use YYYY-MM-DD format";
              },
            }),
          label: () =>
            p.text({
              message: `Day ${i + 1} label (e.g. "Sat 12 Sep"):`,
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
      days.push({ date: day.date.trim(), label: day.label.trim() });
    }
  }

  const footer = await p.group(
    {
      text: () =>
        p.text({
          message: "Footer credit text:",
          placeholder: "Your Organization",
          validate: (v) => {
            if (!v.trim()) return "Please enter footer text";
          },
        }),
      url: () =>
        p.text({
          message: "Footer URL:",
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
    message: "Install dependencies?",
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
    footerText: footer.text.trim(),
    footerUrl: footer.url.trim(),
    installDeps,
  };
}
