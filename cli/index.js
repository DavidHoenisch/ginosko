#!/usr/bin/env node

import { Command } from 'commander';
import { processJaneAustenWorks } from './process-texts.js';

const program = new Command();

program
  .name('gnoskos-cli')
  .description('CLI tool for processing Jane Austen works into vectors')
  .version('1.0.0');

program
  .command('process')
  .description('Process Jane Austen works and create vectors')
  .action(async () => {
    console.log('Processing Jane Austen works...');
    try {
      await processJaneAustenWorks();
      console.log('Processing completed successfully!');
    } catch (error) {
      console.error('Error processing works:', error);
      process.exit(1);
    }
  });

program.parse();