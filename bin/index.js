#!/usr/bin/env node

import yargs from 'yargs';
import { init } from '../index.js';

yargs(process.argv.slice(2))
  .usage(
    `$0`,
    `Initializing isubo's configuration`,
    () => {},
    async () => init(),
  )
  .parse();
