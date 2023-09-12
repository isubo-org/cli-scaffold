import { execSync } from 'child_process';
import { hinter } from './hinter.js';
import { readFileSync } from 'fs';

/**
 * Delete first and last lines
 * @param {string} str
 * @return {string}
 */
export function delFirstAndLastLines(str = '') {
  const lines = str.split('\n');
  return lines.slice(1, -1).join('\n');
}

export function execCmdSync(cmd) {
  hinter.cmd(cmd);

  execSync(cmd, {
    stdio: 'inherit',
    shell: true,
  });
}

export function getPkgData() {
  return JSON.parse(readFileSync('package.json'));
}