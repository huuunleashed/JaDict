'use strict';

const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const AdmZip = require('adm-zip');

const TARGETS = new Set(['chrome', 'firefox']);

(async () => {
  const target = process.argv[2];
  if (!TARGETS.has(target)) {
    console.error(`Usage: node scripts/build.js <target>\n  <target>: chrome | firefox`);
    process.exitCode = 1;
    return;
  }

  const rootDir = path.resolve(__dirname, '..');
  const distRoot = path.join(rootDir, 'dist');
  const targetDist = path.join(distRoot, target);

  await fsp.rm(targetDist, { recursive: true, force: true });
  await fsp.mkdir(targetDist, { recursive: true });

  const exclusions = new Set([
    'dist',
    'node_modules',
    '.git',
    '.github',
  '.vscode',
    'scripts',
    '.gitignore',
    '.gitattributes',
    'package-lock.json',
    'package.json'
  ]);

  const copyEntry = async (relativeSource) => {
    const sourcePath = path.join(rootDir, relativeSource);
    const targetPath = path.join(targetDist, relativeSource);
    const stats = await fsp.stat(sourcePath);

    if (stats.isDirectory()) {
      if (exclusions.has(relativeSource)) {
        return;
      }

      await fsp.mkdir(targetPath, { recursive: true });
      const entries = await fsp.readdir(sourcePath);
      for (const entry of entries) {
        await copyEntry(path.join(relativeSource, entry));
      }
      return;
    }

    if (exclusions.has(relativeSource)) {
      return;
    }

    await fsp.mkdir(path.dirname(targetPath), { recursive: true });
    await fsp.copyFile(sourcePath, targetPath);
  };

  const rootEntries = await fsp.readdir(rootDir);
  for (const entry of rootEntries) {
    await copyEntry(entry);
  }

  if (target === 'firefox') {
    const firefoxManifest = path.join(rootDir, 'manifest.firefox.json');
    const manifestDest = path.join(targetDist, 'manifest.json');
    await fsp.copyFile(firefoxManifest, manifestDest);
    await fsp.rm(path.join(targetDist, 'manifest.firefox.json'), { force: true });
  }

  if (target === 'chrome') {
    await fsp.rm(path.join(targetDist, 'manifest.firefox.json'), { force: true });
  }

  const zip = new AdmZip();
  zip.addLocalFolder(targetDist);
  const zipName = `jadict-${target}.zip`;
  const zipPath = path.join(distRoot, zipName);
  await fsp.mkdir(distRoot, { recursive: true });
  zip.writeZip(zipPath);

  if (target === 'firefox') {
    const xpiPath = path.join(distRoot, 'jadict-firefox.xpi');
    await fsp.copyFile(zipPath, xpiPath);
  }

  console.log(`Built ${target} package at ${zipPath}`);
})();
