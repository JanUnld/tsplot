#!/usr/bin/env node

import { program } from 'commander';
import {
  setupDiagramCommand,
  setupRenderCommand,
  setupStatsCommand,
} from './commands';

let bin = program;

setupDiagramCommand(bin);
setupStatsCommand(bin);
setupRenderCommand(bin);

bin.parse();
