#!/usr/bin/env node

import * as p from "@clack/prompts";
import { gatherAnswers } from "./prompts.js";
import { scaffold } from "./scaffold.js";

async function main() {
  try {
    const answers = await gatherAnswers();

    const s = p.spinner();
    s.start("Scaffolding project...");

    const { targetDir } = await scaffold(answers);

    s.stop("Project scaffolded!");

    p.note(
      [
        `cd ${answers.directory}`,
        ...(answers.installDeps ? [] : ["pnpm install"]),
        "pnpm run dev",
      ].join("\n"),
      "Next steps",
    );

    p.outro(`Done! Your project is ready at ${targetDir}`);
  } catch (err) {
    if (err.message?.includes("cancelled")) {
      process.exit(0);
    }
    p.log.error(err.message || String(err));
    process.exit(1);
  }
}

main();
