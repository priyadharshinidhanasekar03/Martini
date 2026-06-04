import React, { useState } from 'react';
import { tmdbFetch, IMG_BASE } from '../api/tmdb';
import { useWhisper } from '../hooks/useWhisper';
import MovieModal from '../components/movies/MovieModal';

const QUIZ_QUESTIONS = [
  {
    q: "What do you want to feel tonight?",
    options: ["Make me laugh", "Make me cry", "Make me scared", "Make me think"],
    keys: ["comedy", "drama", "horror", "sci-fi"],
  },
  {
    q: "Which language do you want to watch in?",
    options: ["Hollywood", "Bollywood", "Korean", "Any Language"],
    keys: ["en", "hi", "ko", "any"],
  },
  {
    q: "How long can you stay awake?",
    options: ["90 mins max", "2 hours is fine", "Give me an epic", "Don't care"],
    keys: ["short", "medium", "long", "any"],
  },
  {
    q: "Who are you watching with?",
    options: ["Alone", "Partner", "Friends", "Family"],
    keys: ["thriller", "romance", "action", "comedy"],
  },
];

const GENRE_MAP = {
  comedy: 35, drama: 18, thriller: 53,
  action: 28, romance: 10749, adventure: 12,
  crime: 80, "sci-fi": 878, horror: 27,
};

const RUNTIME_MAP = {
  short: { 'with_runtime.lte': 100 },
  medium: { 'with_runtime.gte': 90, 'with_runtime.lte': 130 },
  long: { 'with_runtime.gte': 130 },
  any: {},
};

const DIRECTOR_QUOTES = [
  { quote: 'Cinema is a mirror by which we often see ourselves.', author: 'Martin Scorsese' },
  { quote: 'Film is life with the dull bits cut out.', author: 'Alfred Hitchcock' },
  { quote: 'If it can be written, or thought, it can be filmed.', author: 'Stanley Kubrick' },
  { quote: 'I steal from every movie ever made.', author: 'Quentin Tarantino' },
];

function randomQuote() {
  return DIRECTOR_QUOTES[Math.floor(Math.random() * DIRECTOR_QUOTES.length)];
}

function TonightQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quote] = useState(randomQuote());
  const [modal, setModal] = useState(null);
  const { whispers, fetchWhisper } = useWhisper();

  async function pick(key) {
    const next = [...answers, key];
    setAnswers(next);

    if (next.length < QUIZ_QUESTIONS.length) {
      setStep(s => s + 1);
      return;
    }

    setLoading(true);
    try {
      // Extract answers
      const mood = next[0];      // comedy, drama, horror, sci-fi
      const language = next[1];  // en, hi, ko, any
      const runtime = next[2];   // short, medium, long, any
      const company = next[3];   // thriller, romance, action, comedy

      // Build genre from mood + company
      const genreCounts = {};
      [mood, company].forEach(a => {
        const genre = GENRE_MAP[a];
        if (genre) genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });

      const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
      const topGenres = sorted.slice(0, 2).map(([id]) => id).join(',');

      // Build params
      const params = {
        with_genres: topGenres,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 300,
        page: Math.floor(Math.random() * 3) + 1,
        ...RUNTIME_MAP[runtime],
      };

      // Add language filter
      if (language !== 'any') {
        params.with_original_language = language;
      }

      const data = await tmdbFetch('/discover/movie', params);
      const movies = data.results || [];
      const picked = movies[Math.floor(Math.random() * Math.min(movies.length, 10))];
      setResult(picked || null);
      if (picked) await fetchWhisper(picked);
    } catch (err) {
      console.error(err);
      setResult(null);
    }
    setLoading(false);
  }

  function reset() {
    setStep(0);
    setAnswers([]);
    setResult(null);
    setModal(null);
  }

  // Loading
  if (loading) {
    return (
      <div style={{ padding: '3.5rem 3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</div>
        <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Searching the archives for tonight…
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1rem', color: 'var(--muted)' }}>
          "{quote.quote}"
        </div>
        <div style={{ fontSize: '0.58rem', color: 'var(--border)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
          — {quote.author}
        </div>
      </div>
    );
  }

  // Result
  if (result) {
    const whisper = whispers[result.id];
    return (
      <div style={{ padding: '3.5rem 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.9rem', fontWeight: 700, color: 'var(--cream)' }}>
            Tonight's <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Pick</em>
          </h2>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <div style={{
          background: 'var(--card)',
          border: '1px solid rgba(201,168,76,0.3)',
          padding: '2.5rem', textAlign: 'center',
          maxWidth: '480px', margin: '0 auto',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          <div style={{ fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.25rem' }}>
            ✦ Martini recommends ✦
          </div>

          {result.poster_path && (
            <img
              src={`${IMG_BASE}${result.poster_path}`}
              alt={result.title}
              style={{ width: '130px', margin: '0 auto 1.25rem', display: 'block', border: '1px solid var(--border)' }}
            />
          )}

          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '0.4rem' }}>
            {result.title}
          </div>

          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem' }}>
            {result.release_date?.slice(0, 4)} · ★ {result.vote_average?.toFixed(1)} · {result.original_language?.toUpperCase()}
          </div>

          {whisper && (
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic', color: 'var(--gold2)',
              fontSize: '1rem', padding: '0.75rem 1rem',
              borderLeft: '2px solid var(--gold)',
              textAlign: 'left', marginBottom: '1.25rem',
            }}>
              "{whisper}"
            </div>
          )}

          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.95rem', color: 'var(--muted)',
            fontStyle: 'italic', lineHeight: 1.65, marginBottom: '1.5rem',
          }}>{result.overview}</p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setModal(result)}
              style={{
                background: 'var(--gold)', color: 'var(--bg)', border: 'none',
                fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '0.85rem 2.2rem', cursor: 'pointer', fontWeight: 500,
              }}>
              ▶ Trailer + Where to Watch
            </button>
            <button
              onClick={reset}
              style={{
                background: 'none', color: 'var(--gold)',
                border: '1px solid rgba(201,168,76,0.4)',
                fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '0.85rem 2.2rem', cursor: 'pointer',
              }}>
              Ask Again
            </button>
          </div>
        </div>

        {modal && (
          <MovieModal
            movie={modal}
            whisper={whispers[modal?.id]}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    );
  }

  // Quiz
  const q = QUIZ_QUESTIONS[step];

  return (
    <div style={{ padding: '3.5rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.9rem', fontWeight: 700, color: 'var(--cream)' }}>
          What to Watch <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Tonight</em>
        </h2>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2.5rem' }}>
          {QUIZ_QUESTIONS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '1px',
              background: i <= step ? 'var(--gold)' : 'var(--border)',
              transition: 'background 0.4s',
            }} />
          ))}
        </div>

        <p style={{ fontSize: '0.58rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Four questions. One perfect film. · {step + 1}/{QUIZ_QUESTIONS.length}
        </p>

        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.7rem', fontStyle: 'italic', color: 'var(--cream)', marginBottom: '2rem', lineHeight: 1.3 }}>
          {q.q}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(q.keys[i])}
              style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                color: 'var(--text)', fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.05rem', padding: '1.1rem 1.25rem',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.color = 'var(--gold)';
                e.currentTarget.style.background = 'rgba(201,168,76,0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.background = 'var(--card)';
              }}
            >{opt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TonightQuiz;