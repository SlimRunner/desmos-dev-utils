import { promises as fs } from "fs";
import { inspect } from "util";

// this code was copied from here
// https://github.com/DesModder/DesModder/blob/56c7dcb7a24c2cda5db70623200609b4dfac50f7/loaders/utils.mjs

export async function loadFile(path) {
  return await fs
    .readFile(path, "utf8")
    .catch((err) => printDiagnostics({ file: path, err }));
}

function printDiagnostics(...args) {
  console.log(inspect(args, false, 10, true));
}
