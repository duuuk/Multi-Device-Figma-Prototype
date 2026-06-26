import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const isWatch = process.argv.includes("--watch");

// Build the sandbox code (code.ts → dist/code.js)
const sandboxConfig = {
  entryPoints: ["src/sandbox/code.ts"],
  bundle: true,
  outfile: "dist/code.js",
  target: "es2020",
  format: "iife",
  logLevel: "info",
};

// Build the UI code (ui/index.ts → dist/ui-bundle.js)
// Then inline it into the HTML template
const uiConfig = {
  entryPoints: ["src/ui/index.ts"],
  bundle: true,
  outfile: "dist/ui-bundle.js",
  target: "es2020",
  format: "iife",
  logLevel: "info",
};

async function buildUI() {
  await esbuild.build(uiConfig);

  // Read the HTML template and the built JS
  const htmlTemplate = fs.readFileSync(
    path.join("src", "ui", "ui.html"),
    "utf8"
  );
  const jsBundle = fs.readFileSync("dist/ui-bundle.js", "utf8");

  // Inline the JS into the HTML
  const finalHtml = htmlTemplate.replace(
    "<!-- SCRIPT_PLACEHOLDER -->",
    `<script>${jsBundle}</script>`
  );

  fs.writeFileSync("dist/ui.html", finalHtml);
  console.log("  UI HTML built with inlined JS");
}

async function build() {
  // Ensure dist directory exists
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
  }

  await esbuild.build(sandboxConfig);
  await buildUI();
  console.log("✅ Build complete");
}

if (isWatch) {
  // Watch mode: rebuild sandbox on change
  const sandboxCtx = await esbuild.context(sandboxConfig);
  await sandboxCtx.watch();

  const uiCtx = await esbuild.context({
    ...uiConfig,
    plugins: [
      {
        name: "rebuild-html",
        setup(build) {
          build.onEnd(async () => {
            await buildUI();
          });
        },
      },
    ],
  });
  await uiCtx.watch();

  console.log("👀 Watching for changes...");
} else {
  await build();
}
