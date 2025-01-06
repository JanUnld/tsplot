#!/usr/bin/env node

import { program } from 'commander';
import { setupRenderCommand, setupStatsCommand } from './commands';

let bin = program;

setupStatsCommand(bin);
setupRenderCommand(bin);

bin.parse();
