const axios = require('axios');
const dayjs = require('dayjs');

const validDurations = ['day', 'week', 'month', 'year'];

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

async function getTrendingRepos({ duration = 'week', limit = 10 }) {
  duration = duration.toLowerCase();

  if (!validDurations.includes(duration)) {
    throw new Error(`Invalid duration: ${duration}. Valid options are: ${validDurations.join(', ')}`);
  }

  if (isNaN(limit) || limit <= 0 || limit > 100) {
    throw new Error(`Invalid limit: ${limit}. It must be between 1 and 100.`);
  }

  const startDate = getStartDate(duration);
  // const query = `created:>${startDate}`;
  const url = `https://api.github.com/search/repositories`;

  const response = await axios.get(url, {
    params: {
      q: `created:>${startDate}`,
      sort: 'stars',
      order: 'desc',
      per_page: limit,
    },
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      "User-Agent": "trending-repos-cli",
    },
    timeout: 10000,
  });

  const data = response.data;

  if (!data || !Array.isArray(data.items)) {
    throw new Error('Unexpected response format from GitHub API.');
  }

  return data.items;
}

module.exports = {
  getTrendingRepos,
  validDurations
};