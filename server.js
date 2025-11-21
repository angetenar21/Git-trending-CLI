const express = require('express');
const cors = require('cors');
const { getTrendingRepos, validDurations } = require('./src/githubService');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Endpoint to get trending repositories
app.get('/api/trending', async (req, res) => {
  try {
    const duration = (req.query.duration || 'week').toLowerCase();
    const limit = parseInt(req.query.limit || '10', 10);

    if (!validDurations.includes(duration)) {
      return res.status(400).json({ error: `Invalid duration: ${duration}. Valid options are: ${validDurations.join(', ')}` });
    }

    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ error: `Invalid limit: ${limit}. It must be between 1 and 100.` });
    }

    const repos = await getTrendingRepos({ duration, limit });
    res.json({
      duration,
      limit,
      count: repos.length,
      items: repos,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});