import esbuild from "esbuild";

console.log("Build bundle.ts -> bundle.js");
await esbuild.build({
  entryPoints: ["_assets/scripts/bundle.ts"],
  outdir: "_assets/scripts/",
  bundle: true,
  minify: true,
});

console.log("Build ni-api.ts -> ni-api.js");
await esbuild.build({
  entryPoints: ["_assets/scripts/ni-api.ts"],
  outdir: "_assets/scripts/",
  bundle: true,
  minify: false,
});

console.log("Build speech-api.ts -> speech-api.js");
await esbuild.build({
  entryPoints: ["_assets/scripts/speech-api.ts"],
  outdir: "_assets/scripts/",
  bundle: true,
  minify: false,
});

console.log("Build labs-vitals.ts -> labs-vitals.js");
await esbuild.build({
  entryPoints: ["_assets/scripts/labs-vitals.ts"],
  outdir: "_assets/scripts/",
  bundle: true,
  minify: false,
});
