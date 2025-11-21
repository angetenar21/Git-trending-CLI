#!/usr/bin/env node

const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const _chalk = require('chalk');
const chalk = _chalk && _chalk.default ? _chalk.default : _chalk;
const dayjs = require('dayjs');

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
const validDurations = ['day', 'week', 'month', 'year'];
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

//compute the date based on duration
function getStartDate(duration) {
  const now = dayjs();
  switch (duration) {
    case 'day':
      return now.subtract(1, 'day').format('YYYY-MM-DD');
    case 'week':
      return now.subtract(7, 'day').format('YYYY-MM-DD');
    case 'month':
      return now.subtract(1, 'month').format('YYYY-MM-DD');
    case 'year':
      return now.subtract(1, 'year').format('YYYY-MM-DD');
    default:
      return now.subtract(7, 'day').format('YYYY-MM-DD');
  }
}
const startDate = getStartDate(duration);

// Build the GitHub API url

const githubApiUrl = "https://api.github.com/search/repositories";

async function fetchTrendingRepos() {
  try {
    console.log(chalk.blue(`Fetching top ${limit} trending repositories since ${startDate}...`));
    const response = await axios.get(githubApiUrl, {
      params: {
        q: `created:>${startDate}`,
        sort: 'stars',
        order: 'desc',
        per_page: limit,
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        "User-Agent": "trending-repos-cli"
      },
      timeout: 10000,
    });

    const data = response.data;
    if (!data || !Array.isArray(data.items)) {
      console.error(chalk.red('Unexpected response format from GitHub API.'));
      process.exit(1);
    }

    if (data.items.length === 0) {
      console.log(chalk.yellow('No trending repositories found for the specified duration.'));
      return;
    }
    // Display the repositories
    console.log(chalk.green(`\nTop ${limit} trending repositories since ${startDate}:\n`));

    data.items.forEach((repo, index) => {
      console.log(chalk.yellow(`${index + 1}. ${repo.full_name}`));
      console.log(`   ${chalk.cyan(repo.html_url)}`);
      console.log(`   ⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count} | ${chalk.magenta(repo.language || 'unknown')}`);
      console.log(`   📝 Description: ${repo.description ? repo.description : 'No description provided.'}\n`);
    });
  } catch (error) {
    if (error.response) {
      console.error(chalk.red(`GitHub API Error: ${error.response.status} - ${error.response.data.message}`));
    } else if (error.request) {
      console.error(chalk.red('No response received from GitHub API.'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}

fetchTrendingRepos();