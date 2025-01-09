import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["_assets/scripts/bundle.ts"],
  outdir: "_assets/scripts/",
  bundle: true,
  minify: true,
});
