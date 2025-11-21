#!/usr/bin/env node


const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const _chalk = require('chalk');
const chalk = _chalk && _chalk.default ? _chalk.default : _chalk;
const { getTrendingRepos, validDurations } = require('./src/githubService');


// Configure yargs to parse command line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: trending-repos [options]')
  .option('duration', {
    alias: 'd',
    describe: 'Duration to fetch trending repositories for (day|week|month|year)',
    type: 'string',
    default: 'week',
  })
  .option('limit', {
    alias: 'l',
    describe: 'Number of repositories to display',
    type: 'number',
    default: 10,
  })
  .help('h')
  .alias('h', 'help')
  .argv;

// Validate duration input

const duration = argv.duration.toLowerCase();
if (!validDurations.includes(duration)) {
  console.error(chalk.red(`Invalid duration: ${duration}. Valid options are: ${validDurations.join(', ')}`));
  process.exit(1);
}

// Validate limit input
const limit = argv.limit;

if (isNaN(limit) || limit <= 0 || limit > 100) {
  console.error(chalk.red(`Invalid limit: ${limit}. It must be between 1 and 100.`));
  process.exit(1);
}



async function runCli() {
  try {
    console.log(
      chalk.blue(
        `\nFetching trending repositories (duration: ${duration}, limit: ${limit})...\n`
      )
    );

    const repos = await getTrendingRepos({ duration, limit });

    if (repos.length === 0) {
      console.log(chalk.yellow("No repositories found for this duration."));
      return;
    }
    console.log(chalk.green.bold("Trending Repositories:\n"));

    repos.forEach((repo, index) => {
      console.log(
        chalk.bold(`${index + 1}. ${repo.full_name}`) +
        chalk.gray(`  ⭐ ${repo.stargazers_count}`)
      );
      console.log(
        "   " + (repo.description ? repo.description : chalk.gray("No description"))
      );
      console.log(
        "   " +
        chalk.cyan(repo.html_url) +
        "  " +
        chalk.magenta(repo.language || "Unknown")
      );
      console.log();
    });
  } catch (error) {
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

runCli();