import { delFirstAndLastLines } from './util.js';

export const GITHUB_WORKFLOW_FILEPATH = '.github/workflows/npm-publish.yml';
export const GITHUB_WORKFLOW_FILE = delFirstAndLastLines(`
# This workflow will run tests using node and then publish a package to GitHub Packages when a release is created
# For more information see: https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages

name: Node.js Package

on:
  workflow_dispatch:
  create:
    tags:
      - "*"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16

      - name: Cache dependencies
        id: cache-dependencies
        uses: actions/cache@v3
        with:
          path: ./node_modules
          key: \${{ runner.os }}-node-\${{ hashFiles('./pnpm-lock.yaml') }}
      
      - name: Install dependencies
        if: steps.cache-dependencies.outputs.cache-hit != 'true'
        run: npm install -g pnpm && pnpm install    

      - name: Build artifact
        run: node ./scripts/build.js

      - name: Upload build artifact
        uses: actions/upload-artifact@v3
        with:
          name: build-artifact
          path: ./dist

  publish-npm:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          registry-url: https://registry.npmjs.org/

      # - name: Install pnpm
      #   run: npm install -g pnpm

      # - name: Install dependencies
      #   run: pnpm install

      - name: Restore dependencies cache
        uses: actions/cache@v3
        with:
          path: ./node_modules
          key: \${{ runner.os }}-node-\${{ hashFiles('./pnpm-lock.yaml') }}

      - name: Download build artifact
        uses: actions/download-artifact@v3
        with:
          name: build-artifact
          path: ./dist

      - name: Publish artifact to npm
        run: npx isubo-publish --skin-login --skin-build
        env:
          NODE_AUTH_TOKEN: \${{secrets.ISUBO_ORG_NPM_TOKEN}}

`);

export const ROLLUP_CONF_FILEPATH = 'rollup.config.js';
export const ROLLUP_CONF_FILE = delFirstAndLastLines(`
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: {
    index: 'index.js',
    'bin/index': 'bin/index.js',
  },
  output: {
    dir: 'dist',
    format: 'es',
    plugins: [terser()],
  },
  plugins: [
    copy({
      targets: [
        // { src: 'assets/conf.template.yml', dest: 'dist/assets' },
        { src: ['package.json', 'README.md'], dest: 'dist/' },
      ],
    }),
  ],
};
`);

export const BUILD_SCRIPT_FILEPATH = 'scripts/build.js';
export const BUILD_SCRIPT_FILE = delFirstAndLastLines(`
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const conf = {
  pkgJsonPath: './package.json',
  distDirPath: './dist'
};

function streamlog(text) {
  process.stderr.write(text + '\\n');
}

function getPkgData() {
  const ret = JSON.parse(fs.readFileSync(conf.pkgJsonPath, 'utf8'));
  return ret;
}

function excludeProps(src, ...keys) {
  const ret = {};
  for (const [key, val] of Object.entries(src)) {
    if (!keys.includes(key)) {
      ret[key] = val;
    }
  }
  return ret;
}

export function deleteScripts() {
  const pkgJson = getPkgData();
  let distPkg = pkgJson;
  const PUBLISH_CWD = conf.distDirPath;
  const distPkgPath = path.join(PUBLISH_CWD, 'package.json');
  let shouldUpdate = false;

  if (!fs.existsSync(distPkgPath)) {
    throw new Error(\`\${distPkgPath} not exist!\`);
  }

  if (pkgJson?.scripts) {
    distPkg = {
      ...pkgJson,
      scripts: excludeProps(
        pkgJson.scripts,
        'build',
        'prepare',
        'publish',
        'postversion'
      )
    };

    shouldUpdate = true;
  }

  if (shouldUpdate) {
    fs.writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2));
  }
}

function main() {
  let cmd = \`rm -rf dist && npx rollup -c rollup.config.js && sed -i '1i#!/usr/bin/env node' dist/bin/index.js\`;
  streamlog(cmd);

  execSync(cmd, {
    stdio: 'inherit',
    shell: true
  });

  deleteScripts();

  cmd = 'du -sh dist';
  streamlog('\\n' + cmd);

  execSync(cmd, {
    stdio: 'inherit',
    shell: true
  });

  process.exit(0);
}

main();
`);

export const DEPENDENCIES = [
  'yargs',
];

export const DEV_DEPENDENCIES = [
  'rollup',
  'rollup-plugin-copy',
  'rollup-plugin-terser',
  '@isubo-org/publish',
  '@isubo-org/version',
];
