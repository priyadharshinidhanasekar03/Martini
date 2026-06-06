import React, { useState } from 'react';
import { searchMovies, IMG_BASE } from '../api/tmdb';
import { askClaude } from '../api/claude';

// ─── ACTOR UNIVERSE ───────────────────────────────────────────────
function ActorUniverse() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [actor, setActor] = useState(null);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
  setSearch(e.target.value);
  if (e.target.value.length < 2) { setResults([]); return; }
  try {
    const PROXY = 'https://corsproxy.io/?';
    const url = `https://api.themoviedb.org/3/search/person?api_key=bbf5fb3d0fdba51a15081feef6abdd2b&query=${encodeURIComponent(e.target.value)}&page=1&include_adult=false`;
    const res = await fetch(PROXY + encodeURIComponent(url));
    const data = await res.json();
    console.log('Actor search results:', data);
    setResults((data.results || []).slice(0, 4));
  } catch (err) { console.error('Actor search error:', err); }
}

  async function selectActor(person) {
    setActor(person);
    setResults([]);
    setSearch('');
    setLoading(true);
    try {
      const PROXY = 'https://corsproxy.io/?';
      const url = `https://api.themoviedb.org/3/person/${person.id}/movie_credits?api_key=bbf5fb3d0fdba51a15081feef6abdd2b`;
      const res = await fetch(PROXY + encodeURIComponent(url));
      const data = await res.json();
      const acted = (data.cast || [])
        .filter(m => m.vote_count > 10 && m.poster_path)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);
      setFilms(acted);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '0.75rem' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--cream)' }}>
          Actor <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Universe</em>
        </h3>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Every film an actor ever starred in. Ranked by greatness.
      </p>

      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
        <input
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', padding: '0.7rem 0.8rem', width: '100%', outline: 'none' }}
          placeholder="Search an actor..."
          value={search}
          onChange={handleSearch}
        />
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', zIndex: 10 }}>
            {results.map(p => (
              <div key={p.id} onClick={() => selectActor(p)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {p.profile_path && (
                  <img src={`https://image.tmdb.org/t/p/w92${p.profile_path}`} alt={p.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--cream)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
                    {p.known_for?.slice(0, 2).map(k => k.title || k.name).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {actor && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {actor.profile_path && (
            <img src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`} alt={actor.name}
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
          )}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: 'var(--cream)', fontWeight: 700 }}>{actor.name}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{films.length} films in the universe</div>
          </div>
          <button onClick={() => { setActor(null); setFilms([]); }}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', padding: '0.4rem 0.8rem', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Clear
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Mapping the universe…</div>
        </div>
      )}

      {!loading && films.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.25rem' }}>
          {films.map((m, i) => (
            <div key={m.id}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(8,8,8,0.9)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: '0.55rem', padding: '0.15rem 0.4rem', zIndex: 2, fontFamily: "'DM Mono', monospace" }}>#{i + 1}</div>
              {m.character && (
                <div style={{ position: 'absolute', bottom: '3.5rem', left: 0, right: 0, background: 'rgba(8,8,8,0.85)', padding: '0.3rem 0.5rem', fontSize: '0.55rem', color: 'var(--muted)', textAlign: 'center', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
                  as {m.character}
                </div>
              )}
              <img src={`${IMG_BASE}${m.poster_path}`} alt={m.title} loading="lazy"
                style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '0.7rem 0.75rem' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.88rem', fontWeight: 600, color: 'var(--cream)', lineHeight: 1.3, marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>{m.release_date?.slice(0, 4)}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--gold)' }}>★ {m.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!actor && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🎭</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
            Search Shah Rukh Khan. Search Meryl Streep. Search anyone.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DIRECTOR UNIVERSE ────────────────────────────────────────────
function DirectorUniverse() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [director, setDirector] = useState(null);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    setSearch(e.target.value);
    if (e.target.value.length < 2) { setResults([]); return; }
    try {
      const PROXY = 'https://corsproxy.io/?';
      const url = `https://api.themoviedb.org/3/search/person?api_key=bbf5fb3d0fdba51a15081feef6abdd2b&query=${encodeURIComponent(e.target.value)}&page=1`;
      const res = await fetch(PROXY + encodeURIComponent(url));
      const data = await res.json();
      setResults((data.results || []).filter(p => p.known_for_department === 'Directing').slice(0, 4));
    } catch (err) { console.error(err); }
  }

  async function selectDirector(person) {
    setDirector(person);
    setResults([]);
    setSearch('');
    setLoading(true);
    try {
      const PROXY = 'https://corsproxy.io/?';
      const url = `https://api.themoviedb.org/3/person/${person.id}/movie_credits?api_key=bbf5fb3d0fdba51a15081feef6abdd2b`;
      const res = await fetch(PROXY + encodeURIComponent(url));
      const data = await res.json();
      const directed = (data.crew || [])
        .filter(m => m.job === 'Director' && m.vote_count > 5)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);
      setFilms(directed);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '0.75rem' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--cream)' }}>
          Director <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Universe</em>
        </h3>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Every film a director ever made. Ranked. Whispered.
      </p>

      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
        <input
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--cream)', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', padding: '0.7rem 0.8rem', width: '100%', outline: 'none' }}
          placeholder="Search a director..."
          value={search}
          onChange={handleSearch}
        />
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', zIndex: 10 }}>
            {results.map(p => (
              <div key={p.id} onClick={() => selectDirector(p)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {p.profile_path && (
                  <img src={`https://image.tmdb.org/t/p/w92${p.profile_path}`} alt={p.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--cream)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>Director</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {director && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {director.profile_path && (
            <img src={`https://image.tmdb.org/t/p/w92${director.profile_path}`} alt={director.name}
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />
          )}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: 'var(--cream)', fontWeight: 700 }}>{director.name}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{films.length} films in the universe</div>
          </div>
          <button onClick={() => { setDirector(null); setFilms([]); }}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', padding: '0.4rem 0.8rem', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Clear
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Mapping the universe…</div>
        </div>
      )}

      {!loading && films.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.25rem' }}>
          {films.map((m, i) => (
            <div key={m.id}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(8,8,8,0.9)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: '0.55rem', padding: '0.15rem 0.4rem', zIndex: 2, fontFamily: "'DM Mono', monospace" }}>#{i + 1}</div>
              {m.poster_path ? (
                <img src={`${IMG_BASE}${m.poster_path}`} alt={m.title} loading="lazy"
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '2/3', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎬</div>
              )}
              <div style={{ padding: '0.7rem 0.75rem' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.88rem', fontWeight: 600, color: 'var(--cream)', lineHeight: 1.3, marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>{m.release_date?.slice(0, 4)}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--gold)' }}>★ {m.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!director && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🎭</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
            Search Nolan. Search Kubrick. Search Shankar. Search anyone.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HIDDEN GEM FINDER ────────────────────────────────────────────
function HiddenGemFinder() {
  const [inputs, setInputs] = useState(['', '', '']);
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');

  function updateInput(i, val) {
    const next = [...inputs];
    next[i] = val;
    setInputs(next);
  }

  async function findGems() {
    const filled = inputs.filter(i => i.trim());
    if (filled.length < 2) return;
    setLoading(true);
    setGems([]);
    setAnalysis('');
    try {
      const text = await askClaude(`You are a world-class film curator inside "Martini" — a cinema app for serious film lovers.

The user loves these films: ${filled.join(', ')}

Find 5 hidden gems they've almost certainly never seen. These should be:
- Obscure, underseen films from ANY country or era
- Genuinely matching their taste
- NOT mainstream Hollywood blockbusters
- Mix of different countries and decades

Respond ONLY with raw JSON (no markdown, no backticks):
{
  "taste_analysis": "<one sentence about their cinematic taste>",
  "gems": [
    {
      "title": "<exact film title>",
      "year": <year>,
      "country": "<country>",
      "why": "<one sentence why they'll love it>"
    }
  ]
}`);
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAnalysis(parsed.taste_analysis);
      const withPosters = await Promise.all(
        (parsed.gems || []).map(async gem => {
          const results = await searchMovies(`${gem.title} ${gem.year}`);
          const match = results[0];
          return { ...gem, poster: match?.poster_path };
        })
      );
      setGems(withPosters);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function reset() {
    setInputs(['', '', '']);
    setGems([]);
    setAnalysis('');
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2rem', marginBottom: '0.75rem' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--cream)' }}>
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
              onChange={e => updateInput(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <button onClick={findGems} disabled={inputs.filter(i => i.trim()).length < 2 || loading}
          style={{ background: 'var(--gold)', color: 'var(--bg)', border: 'none', fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0.85rem 2.2rem', cursor: 'pointer', fontWeight: 500, opacity: inputs.filter(i => i.trim()).length < 2 ? 0.4 : 1 }}>
          {loading ? 'Searching the vaults…' : 'Find My Hidden Gems'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💎</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Searching world cinema for your hidden gems…</div>
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
              <div key={i}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {gem.poster ? (
                  <img src={`${IMG_BASE}${gem.poster}`} alt={gem.title} style={{ width: '60px', height: '90px', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '60px', height: '90px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>💎</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)' }}>{gem.title}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{gem.year}</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)', padding: '0.1rem 0.4rem', letterSpacing: '0.1em' }}>{gem.country}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.6 }}>{gem.why}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button onClick={reset} style={{ background: 'none', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.4)', fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0.85rem 2.2rem', cursor: 'pointer' }}>
              Find More Gems
            </button>
          </div>
        </>
      )}

      {!loading && gems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>💎</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--muted)' }}>
            Enter 2-3 films you love. We'll find the ones the world missed.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DISCOVER PAGE ────────────────────────────────────────────────
function Discover() {
  const [activeFeature, setActiveFeature] = useState('actor');

  const features = [
    { id: 'actor',    label: '🎭 Actor Universe' },
    { id: 'director', label: '🎬 Director Universe' },
    { id: 'gems',     label: '💎 Hidden Gems' },
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
        {features.map(f => (
          <button key={f.id} onClick={() => setActiveFeature(f.id)}
            style={{ background: activeFeature === f.id ? 'var(--gold)' : 'none', border: `1px solid ${activeFeature === f.id ? 'var(--gold)' : 'var(--border)'}`, color: activeFeature === f.id ? 'var(--bg)' : 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', padding: '0.5rem 1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {activeFeature === 'actor'    && <ActorUniverse />}
      {activeFeature === 'director' && <DirectorUniverse />}
      {activeFeature === 'gems'     && <HiddenGemFinder />}
    </div>
  );
}

export default Discover;