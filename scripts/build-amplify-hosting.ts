import * as fsp from "node:fs/promises";
import * as child_process from "node:child_process";
import * as util from "node:util";

async function copyComputeFiles() {
  await Promise.all([
    //fsp.cp("server.js", "./.amplify-hosting/compute/default/server.js"),
    // fsp.cp("build/server", ".amplify-hosting/compute/default/build/server", {
    //recursive: true,
    //}),
    buildServer(),
    //installDependencies(),
  ]);
}

async function buildServer() {
  await util.promisify(child_process.exec)("node scripts/build.mjs");
}

async function installDependencies() {
  await fsp.cp(
    "package.json",
    "./.amplify-hosting/compute/default/package.json",
  );
  await fsp.cp(
    "package-lock.json",
    "./.amplify-hosting/compute/default/package-lock.json",
  );
  await util.promisify(child_process.exec)("npm ci --omit=dev", {
    cwd: "./.amplify-hosting/compute/default",
  });
}

async function copyStaticFiles() {
  // Copy static files to the Amplify Hosting directory
  await Promise.all([
    fsp.cp("build/client", ".amplify-hosting/static", {
      recursive: true,
    }),
  ]);
}

async function copyDeployManifest() {
  await fsp.cp("deploy-manifest.json", ".amplify-hosting/deploy-manifest.json");
}

async function main() {
  console.log("Building Amplify Hosting...");
  await Promise.all([
    copyComputeFiles(),
    copyStaticFiles(),
    copyDeployManifest(),
  ]);
}

main();
