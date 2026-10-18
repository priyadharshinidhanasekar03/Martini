const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3003',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
  })
);

app.use(express.json({ limit: '50kb' }));

// ─── HEALTH CHECK ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    tmdbKeyLoaded: Boolean(process.env.TMDB_API_KEY),
    geminiKeyLoaded: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ─── TMDB API PROXY ─────────────────────────────────────
const STATIC_ENDPOINTS = [
  '/movie/popular',
  '/discover/movie',
  '/search/movie',
  '/search/person',
];

const DYNAMIC_ENDPOINTS = [
  /^\/movie\/\d+(\/(videos|watch\/providers))?$/,
  /^\/person\/\d+\/movie_credits$/,
];

function isAllowedEndpoint(endpoint) {
  if (typeof endpoint !== 'string') return false;
  if (STATIC_ENDPOINTS.includes(endpoint)) return true;
  return DYNAMIC_ENDPOINTS.some((re) => re.test(endpoint));
}

app.get('/api/tmdb', async (req, res) => {
  try {
    const { endpoint, ...params } = req.query;

    if (!isAllowedEndpoint(endpoint)) {
      return res.status(400).json({ error: 'Invalid TMDB endpoint' });
    }

    if (!process.env.TMDB_API_KEY) {
      return res
        .status(500)
        .json({ error: 'TMDB_API_KEY is missing from server env' });
    }

    const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
    url.searchParams.set('api_key', process.env.TMDB_API_KEY);

    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'string') {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('TMDB error:', response.status, data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('TMDB request failed:', error.message);
    res.status(500).json({ error: 'TMDB request failed' });
  }
});

// ─── GEMINI API PROXY ───────────────────────────────────
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: 'GEMINI_API_KEY is missing from server env' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', response.status, data);
      return res.status(response.status).json(data);
    }

    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';

    res.json({ text });
  } catch (error) {
    console.error('Gemini request failed:', error.message);
    res.status(500).json({ error: 'Gemini request failed' });
  }
});

// ─── CLAUDE API PROXY (optional) ────────────────────────
app.post('/api/claude', async (req, res) => {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'CLAUDE_API_KEY is missing' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Claude API failed:', error.message);
    res.status(500).json({ error: 'Claude API failed' });
  }
});

// ─── START SERVER ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🍸 Martini server running on port ${PORT}`);
});