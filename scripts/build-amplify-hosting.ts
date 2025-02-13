import * as fsp from "node:fs/promises";

async function copyComputeFiles() {
  await Promise.all([
    fsp.cp("server.js", "./.amplify-hosting/compute/default/server.js"),
    fsp.cp("build/server", ".amplify-hosting/compute/default/build/server", {
      recursive: true,
    }),
    fsp.cp("node_modules", ".amplify-hosting/compute/default/node_modules", {
      recursive: true,
    }),
  ]);
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
