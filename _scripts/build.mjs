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
