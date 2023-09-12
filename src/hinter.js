import chalk from 'chalk';

export function streamlog(text) {
  process.stderr.write(text + '\n');
}

export const hinter = {
  streamlog,
  cmd(text) {
    const prefix = chalk.bgGreenBright(chalk.black(' CMD '));
    streamlog(`${prefix} ${text}`);
  }
};
