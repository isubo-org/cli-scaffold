import { writeFileSync } from 'fs';
import { ensureFileSync } from 'fs-extra/esm';
import { BUILD_SCRIPT_FILE, BUILD_SCRIPT_FILEPATH, DEPENDENCIES, DEV_DEPENDENCIES, GITHUB_WORKFLOW_FILE, GITHUB_WORKFLOW_FILEPATH, NPMRC_FILE, NPMRC_FILEPATH, ROLLUP_CONF_FILE, ROLLUP_CONF_FILEPATH } from './src/constant.js';
import { execCmdSync, getPkgData } from './src/util.js';

function writePkgJson() {
  const pkgData = getPkgData();
  pkgData.type = 'module';
  pkgData.bin = {
    [pkgData.name]: 'bin/index.js',
  };
  pkgData.scripts = {
    ...pkgData.scripts,
    build: 'node ./scripts/build.js',
    postversion: 'git push && git push origin --tags',
  };
  pkgData['standard-version'] = {
    scripts: {
      posttag: 'npm run postversion'
    }
  };

  writeFileSync('package.json', JSON.stringify(pkgData, null, 2));
}

function initEntryFile() {
  const { main } = getPkgData();
  
  ensureFileSync('bin/index.js');
  ensureFileSync(main);
}

function initGithubWorkflowFile() {
  ensureFileSync(GITHUB_WORKFLOW_FILEPATH);

  writeFileSync(GITHUB_WORKFLOW_FILEPATH, GITHUB_WORKFLOW_FILE);
}

function initRollupConfFile() {
  ensureFileSync(ROLLUP_CONF_FILEPATH);

  writeFileSync(ROLLUP_CONF_FILEPATH, ROLLUP_CONF_FILE);
}

function initBuildScriptFile() {
  ensureFileSync(BUILD_SCRIPT_FILEPATH);

  writeFileSync(BUILD_SCRIPT_FILEPATH, BUILD_SCRIPT_FILE);
}

function initNpmrcFile() {
  ensureFileSync(NPMRC_FILEPATH);

  writeFileSync(NPMRC_FILEPATH, NPMRC_FILE);
}


function installDependencies() {
  execCmdSync(`pnpm add ${DEPENDENCIES.join(' ')}`);
}

function installDevDependencies() {
  execCmdSync(`pnpm add ${DEV_DEPENDENCIES.join(' ')} --save-dev`);
}

export const init = () => {
  writePkgJson();
  initEntryFile();
  initNpmrcFile();
  initGithubWorkflowFile();
  initRollupConfFile();
  initBuildScriptFile();

  installDependencies();
  installDevDependencies();
};
