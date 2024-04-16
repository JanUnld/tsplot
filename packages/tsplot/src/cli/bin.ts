#!/usr/bin/env node

import { program } from 'commander';
import { setupDiagramCommand } from './commands/diagram';
import { setupStatsCommand } from './commands/stats';

setupDiagramCommand();
setupStatsCommand();

program.parse();
