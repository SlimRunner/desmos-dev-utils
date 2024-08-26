import esbuild from "esbuild";
import parseArgs from "minimist-lite";
import { loadFile } from "./build-utils.mjs";

const argv = parseArgs(process.argv.slice(2));

const {
  name: scriptName,
  version,
  description,
  author: { name: authorName },
} = JSON.parse(await loadFile("./package.json"));
const outfile = `./dist/${scriptName}.user.js`;

const userscriptHeader = `
// ==UserScript==
// @name        ${scriptName}
// @namespace   slidav.Desmos
// @version     ${version}
// @author      ${authorName}
// @description ${description}
// @grant       none
// @match       https://*.desmos.com/calculator*
// @match       https://*.desmos.com/geometry*
// @match       https://*.desmos.com/3d*
// ==/UserScript==

/*jshint esversion: 6 */
`.slice(1);

const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile,
  platform: "browser",
  target: "es5",
  logLevel: "info",
  sourcemap: argv.watch ? "inline" : false,
  banner: {
    js: userscriptHeader,
  },
};

if (argv.watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.rebuild();
  await ctx.watch();
} else {
  esbuild.build(buildOptions).catch(() => process.exit(1));
}
