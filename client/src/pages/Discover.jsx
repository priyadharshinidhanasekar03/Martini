import React, { useState, useRef } from 'react';
import { tmdbFetch, searchPerson, getPersonCredits, IMG_BASE } from '../api/tmdb';
import { askGemini } from '../api/gemini';
import MovieModal from '../components/movies/MovieModal';

const heading = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--cream)',
};

// ─── ACTOR / DIRECTOR UNIVERSE ────────────────────────────────────
const MODES = {
  actor: {
    word: 'Actor',
    tagline: 'Every film an actor ever starred in. Ranked by greatness.',
    placeholder: 'Search an actor...',
    department: 'Acting',
    subtitle: (p) => p.known_for?.slice(0, 2).map((k) => k.title || k.name).join(', '),
    empty: 'Search Shah Rukh Khan. Search Meryl Streep. Search anyone.',
    pickFilms: (credits) =>
      (credits.cast || []).filter((m) => m.vote_count > 10 && m.poster_path),
  },
  director: {
    word: 'Director',
    tagline: 'Every film a director ever made. Ranked. Whispered.',
    placeholder: 'Search a director...',
    department: 'Directing',
    subtitle: () => 'Director',
    empty: 'Search Nolan. Search Kubrick. Search Shankar. Search anyone.',
    pickFilms: (credits) =>
      (credits.crew || []).filter(
        (m) => m.job === 'Director' && m.vote_count > 10 && m.poster_path
      ),
  },
};

function PersonUniverse({ mode }) {
  const cfg = MODES[mode];
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [person, setPerson] = useState(null);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const timer = useRef(null);

  function handleSearch(e) {
    const q = e.target.value;
    setSearch(q);
    clearTimeout(timer.current);

    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    timer.current = setTimeout(async () => {
      try {
        const people = await searchPerson(q.trim());
        setResults(
          people.filter((p) => p.known_for_department === cfg.department).slice(0, 4)
        );
        setError('');
      } catch (err) {
        console.error('Person search failed:', err);
        setError('Search failed. Is the server running?');
      }
    }, 300);
  }

  async function selectPerson(p) {
    setPerson(p);
    setResults([]);
    setSearch('');
    setFilms([]);
    setError('');
    setLoading(true);
    try {
      const credits = await getPersonCredits(p.id);
      const seen = new Set();
      const list = cfg
        .pickFilms(credits)
        .filter((m) => (seen.has(m.id) ? false : seen.add(m.id)))
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);
      setFilms(list);
    } catch (err) {
      console.error('Credits failed:', err);
      setError('Could not load filmography.');
    }
    setLoading(false);
  }

  function clear() {
    setPerson(null);
    setFilms([]);
    setError('');
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '0.75rem' }}>
        <h3 style={heading}>
          {cfg.word} <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Universe</em>
        </h3>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
        {cfg.tagline}
      </p>

      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
        <input
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', padding: '0.7rem 0.8rem', width: '100%', outline: 'none' }}
          placeholder={cfg.placeholder}
          value={search}
          onChange={handleSearch}
        />
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', zIndex: 10 }}>
            {results.map((p) => (
              <div
                key={p.id}
                onClick={() => selectPerson(p)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {p.profile_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${p.profile_path}`}
                    alt={p.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--cream)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{cfg.subtitle(p)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#c0594a', fontSize: '0.7rem', marginBottom: '1.5rem' }}>{error}</div>
      )}

      {person && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {person.profile_path && (
            <img
              src={`https://image.tmdb.org/t/p/w92${person.profile_path}`}
              alt={person.name}
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }}
            />
          )}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: 'var(--cream)', fontWeight: 700 }}>
              {person.name}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {films.length} films in the universe · click any film for details
            </div>
          </div>
          <button
            onClick={clear}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', padding: '0.4rem 0.8rem', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Clear
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Mapping the universe…
          </div>
        </div>
      )}

      {!loading && films.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.25rem' }}>
          {films.map((m, i) => (
            <div
              key={m.id}
              onClick={() => setModal(m)}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(8,8,8,0.9)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: '0.55rem', padding: '0.15rem 0.4rem', zIndex: 2, fontFamily: "'DM Mono', monospace" }}>
                #{i + 1}
              </div>
              {mode === 'actor' && m.character && (
                <div style={{ position: 'absolute', bottom: '3.5rem', left: 0, right: 0, background: 'rgba(8,8,8,0.85)', padding: '0.3rem 0.5rem', fontSize: '0.55rem', color: 'var(--muted)', textAlign: 'center', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
                  as {m.character}
                </div>
              )}
              <img
                src={`${IMG_BASE}${m.poster_path}`}
                alt={m.title}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '0.7rem 0.75rem' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.88rem', fontWeight: 600, color: 'var(--cream)', lineHeight: 1.3, marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>{m.release_date?.slice(0, 4)}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--gold)' }}>★ {m.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && person && films.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
          No ranked films found for {person.name}.
        </div>
      )}

      {!person && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🎭</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
            {cfg.empty}
          </div>
        </div>
      )}

      {modal && <MovieModal movie={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── HIDDEN GEM FINDER ────────────────────────────────────────────

// Find the TMDB movie that matches a Gemini suggestion.
// Searches by title + year first, then title only, and prefers a year match.
async function matchGemToTmdb(gem) {
  const year = Number(gem.year);

  async function search(params) {
    try {
      const data = await tmdbFetch('/search/movie', params);
      return data.results || [];
    } catch {
      return [];
    }
  }

  let results = year ? await search({ query: gem.title, year, page: 1 }) : [];
  if (results.length === 0) {
    results = await search({ query: gem.title, page: 1 });
  }
  if (results.length === 0) return null;

  if (year) {
    const byYear = results.find((m) => {
      const y = Number(m.release_date?.slice(0, 4));
      return y && Math.abs(y - year) <= 1;
    });
    if (byYear) return byYear;
  }

  return results[0];
}

function HiddenGemFinder() {
  const [inputs, setInputs] = useState(['', '', '']);
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const filledCount = inputs.filter((i) => i.trim()).length;

  function updateInput(i, val) {
    const next = [...inputs];
    next[i] = val;
    setInputs(next);
  }

  async function findGems() {
    const filled = inputs.filter((i) => i.trim());
    if (filled.length < 2) return;
    setLoading(true);
    setGems([]);
    setAnalysis('');
    setError('');
    try {
      const text = await askGemini(`You are a world-class film curator inside "Martini" — a cinema app for serious film lovers.

The user loves these films: ${filled.join(', ')}

Find exactly 5 hidden gems they've almost certainly never seen. These should be:
- Obscure, underseen films from ANY country or era
- Genuinely matching their taste
- NOT mainstream Hollywood blockbusters
- A mix of different countries and decades

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "taste_analysis": "<one sentence about their cinematic taste>",
  "gems": [
    {
      "title": "<exact original release title>",
      "year": <release year as a number>,
      "country": "<country>",
      "why": "<one sentence why they'll love it>"
    }
  ]
}`);

      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAnalysis(parsed.taste_analysis || '');

      const withMovies = await Promise.all(
        (parsed.gems || []).slice(0, 5).map(async (gem) => {
          const movie = await matchGemToTmdb(gem);
          return { ...gem, movie };
        })
      );
      setGems(withMovies);
    } catch (err) {
      console.error(err);
      setError('Could not find gems right now. Check the server and Gemini key, then try again.');
    }
    setLoading(false);
  }

  function reset() {
    setInputs(['', '', '']);
    setGems([]);
    setAnalysis('');
    setError('');
    setModal(null);
  }

  const primaryBtn = {
    background: 'var(--gold)',
    color: 'var(--bg)',
    border: 'none',
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '0.6rem 1.1rem',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-block',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '0.75rem' }}>
        <h3 style={heading}>
          Hidden <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Gem Finder</em>
        </h3>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Tell us what you love. We'll find what you've never seen.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {inputs.map((val, i) => (
          <div key={i}>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>
              Film {i + 1} {i === 2 ? '(optional)' : ''}
            </div>
            <input
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', padding: '0.7rem 0.8rem', width: '100%', outline: 'none' }}
              placeholder="A film you love..."
              value={val}
              onChange={(e) => updateInput(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <button
          onClick={findGems}
          disabled={filledCount < 2 || loading}
          style={{ background: 'var(--gold)', color: 'var(--bg)', border: 'none', fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0.85rem 2.2rem', cursor: 'pointer', fontWeight: 500, opacity: filledCount < 2 ? 0.4 : 1 }}
        >
          {loading ? 'Searching the vaults…' : 'Find My Hidden Gems'}
        </button>
      </div>

      {error && (
        <div style={{ textAlign: 'center', color: '#c0594a', fontSize: '0.75rem', marginBottom: '2rem' }}>{error}</div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💎</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Searching world cinema for your hidden gems…
          </div>
        </div>
      )}

      {!loading && gems.length > 0 && (
        <>
          {analysis && (
            <div style={{ borderLeft: '2px solid rgba(201,168,76,0.3)', padding: '1rem 1.25rem', marginBottom: '2rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.7 }}>
              {analysis}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {gems.map((gem, i) => (
              <div
                key={i}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                {gem.movie?.poster_path ? (
                  <img
                    src={`${IMG_BASE}${gem.movie.poster_path}`}
                    alt={gem.title}
                    onClick={() => setModal(gem.movie)}
                    style={{ width: '60px', height: '90px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '90px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>💎</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)' }}>{gem.title}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{gem.year}</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.1rem 0.4rem', letterSpacing: '0.1em' }}>{gem.country}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.9rem' }}>{gem.why}</div>

                  {gem.movie ? (
                    <button onClick={() => setModal(gem.movie)} style={primaryBtn}>
                      ▶ Trailer + Where to Watch
                    </button>
                  ) : (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${gem.title} ${gem.year} trailer`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={primaryBtn}
                    >
                      ▶ Search Trailer ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={reset}
              style={{ background: 'none', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.4)', fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0.85rem 2.2rem', cursor: 'pointer' }}
            >
              Find More Gems
            </button>
          </div>
        </>
      )}

      {!loading && gems.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>💎</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
            Enter 2-3 films you love. We'll find the ones the world missed.
          </div>
        </div>
      )}

      {modal && <MovieModal movie={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

// ─── DISCOVER PAGE ────────────────────────────────────────────────
function Discover() {
  const [activeFeature, setActiveFeature] = useState('actor');

  const features = [
    { id: 'actor', label: '🎭 Actor Universe' },
    { id: 'director', label: '🎬 Director Universe' },
    { id: 'gems', label: '💎 Hidden Gems' },
  ];

  return (
    <div style={{ padding: '3.5rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.9rem', fontWeight: 700, color: 'var(--cream)' }}>
          <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Discover</em>
        </h2>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '3rem' }}>
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFeature(f.id)}
            style={{ background: activeFeature === f.id ? 'var(--gold)' : 'none', border: `1px solid ${activeFeature === f.id ? 'var(--gold)' : 'var(--border)'}`, color: activeFeature === f.id ? 'var(--bg)' : 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', padding: '0.5rem 1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {activeFeature === 'actor' && <PersonUniverse mode="actor" />}
      {activeFeature === 'director' && <PersonUniverse mode="director" />}
      {activeFeature === 'gems' && <HiddenGemFinder />}
    </div>
  );
}

export default Discover;