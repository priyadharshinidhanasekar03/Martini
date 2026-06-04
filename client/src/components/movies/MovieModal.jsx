import React, { useState, useEffect } from 'react';
import { IMG_BASE } from '../../api/tmdb';

const PROXY = 'https://corsproxy.io/?';
const TMDB_KEY = 'bbf5fb3d0fdba51a15081feef6abdd2b';

// Streaming platform URLs
const PLATFORM_URLS = {
  'Netflix': 'https://www.netflix.com/search?q=',
  'Amazon Prime Video': 'https://www.amazon.com/s?k=',
  'Disney Plus': 'https://www.disneyplus.com/search/',
  'Disney+': 'https://www.disneyplus.com/search/',
  'Apple TV': 'https://tv.apple.com/search?term=',
  'Apple TV+': 'https://tv.apple.com/search?term=',
  'Hotstar': 'https://www.hotstar.com/in/search?q=',
  'JioCinema': 'https://www.jiocinema.com/search/',
  'Hulu': 'https://www.hulu.com/search?q=',
  'HBO Max': 'https://www.max.com/search?q=',
  'Max': 'https://www.max.com/search?q=',
  'Mubi': 'https://mubi.com/en/in/search?q=',
  'SonyLIV': 'https://www.sonyliv.com/search/',
  'ZEE5': 'https://www.zee5.com/search?q=',
  'Peacock': 'https://www.peacocktv.com/search?q=',
  'Paramount Plus': 'https://www.paramountplus.com/search/',
  'Paramount+': 'https://www.paramountplus.com/search/',
};

function getPlatformUrl(providerName, movieTitle) {
  const url = PLATFORM_URLS[providerName];
  if (url) return `${url}${encodeURIComponent(movieTitle)}`;
  // Fallback: Google search for any unknown platform
  return `https://www.google.com/search?q=watch+${encodeURIComponent(movieTitle)}+on+${encodeURIComponent(providerName)}`;
}

async function fetchMovieDetails(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`;
  const res = await fetch(PROXY + encodeURIComponent(url));
  return res.json();
}

async function fetchTrailer(id) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${TMDB_KEY}`;

    // Try direct fetch first (no proxy)
    let data;
    try {
      const res = await fetch(url);
      data = await res.json();
    } catch {
      // Direct failed, fall back to proxy
      const res = await fetch(PROXY + encodeURIComponent(url));
      data = await res.json();
    }

    const results = data.results || [];

    // Prefer official Trailer on YouTube
    const trailer = results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    // Fallback: any YouTube video (Teaser, Clip, Featurette, etc.)
    const fallback = results.find(v => v.site === 'YouTube');

    return trailer?.key || fallback?.key || null;
  } catch (err) {
    console.error('fetchTrailer failed:', err);
    return null;
  }
}

async function fetchProviders(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${TMDB_KEY}`;
  const res = await fetch(PROXY + encodeURIComponent(url));
  const data = await res.json();
  return data.results?.IN || data.results?.US || {};
}

function MovieModal({ movie, whisper, onClose }) {
  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [providers, setProviders] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie) return;
    setLoading(true);
    setShowTrailer(false);
    setTrailerKey(null);
    setProviders([]);

    Promise.all([
      fetchMovieDetails(movie.id),
      fetchTrailer(movie.id),
      fetchProviders(movie.id),
    ]).then(([det, trailer, prov]) => {
      setDetails(det);
      setTrailerKey(trailer);
      setProviders(prov.flatrate || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [movie]);

  if (!movie) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          maxWidth: '680px', width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          padding: '2.5rem', position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: '1.2rem',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cream)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >✕</button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎬</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Loading…
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {movie.poster_path && (
                <img
                  src={`${IMG_BASE}${movie.poster_path}`}
                  alt={movie.title}
                  style={{ width: '100px', height: '150px', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '0.4rem', lineHeight: 1.2 }}>
                  {movie.title}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
                  {movie.release_date?.slice(0, 4)}
                  {details?.runtime ? ` · ${details.runtime} min` : ''}
                  {movie.original_language ? ` · ${movie.original_language.toUpperCase()}` : ''}
                  {` · ★ ${movie.vote_average?.toFixed(1)}`}
                </div>

                {/* Genres */}
                {details?.genres?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {details.genres.map(g => (
                      <span key={g.id} style={{
                        background: 'rgba(201,168,76,0.08)',
                        border: '1px solid rgba(201,168,76,0.2)',
                        color: 'var(--gold)', fontSize: '0.55rem',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '0.2rem 0.5rem',
                      }}>{g.name}</span>
                    ))}
                  </div>
                )}

                {/* Whisper */}
                {whisper && (
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic', color: 'var(--gold2)',
                    fontSize: '0.95rem', padding: '0.6rem 0.8rem',
                    borderLeft: '2px solid var(--gold)',
                  }}>
                    "{whisper}"
                  </div>
                )}
              </div>
            </div>

            {/* Overview */}
            {movie.overview && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1rem', color: 'var(--text)',
                fontStyle: 'italic', lineHeight: 1.7,
                marginBottom: '1.5rem',
              }}>{movie.overview}</p>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {trailerKey ? (
                <button
                  onClick={() => setShowTrailer(s => !s)}
                  style={{
                    background: showTrailer ? '#9b2335' : 'var(--gold)',
                    color: 'var(--bg)', border: 'none',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.68rem', letterSpacing: '0.18em',
                    textTransform: 'uppercase', padding: '0.75rem 1.5rem',
                    cursor: 'pointer', fontWeight: 500,
                  }}>
                  {showTrailer ? '✕ Hide Trailer' : '▶ Watch Trailer'}
                </button>
              ) : (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--gold)',
                    color: 'var(--bg)', border: 'none',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.68rem', letterSpacing: '0.18em',
                    textTransform: 'uppercase', padding: '0.75rem 1.5rem',
                    cursor: 'pointer', fontWeight: 500,
                    textDecoration: 'none', display: 'inline-block',
                  }}>
                  ▶ Search Trailer ↗
                </a>
              )}
              <button
                onClick={onClose}
                style={{
                  background: 'none', color: 'var(--gold)',
                  border: '1px solid rgba(201,168,76,0.4)',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.68rem', letterSpacing: '0.18em',
                  textTransform: 'uppercase', padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                }}>
                Close
              </button>
            </div>

            {/* Trailer */}
            {showTrailer && trailerKey && (
              <div style={{ marginBottom: '1.5rem' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
                  allowFullScreen
                  allow="autoplay"
                  title="Trailer"
                />
              </div>
            )}

            {/* Where to Watch */}
            {providers.length > 0 && (
              <div>
                <div style={{
                  fontSize: '0.58rem', letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                  marginBottom: '0.75rem',
                }}>
                  Where to watch — tap to open
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {providers.map(p => (
                    <a
                      key={p.provider_id}
                      href={getPlatformUrl(p.provider_name, movie.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)', fontSize: '0.65rem',
                        letterSpacing: '0.08em', padding: '0.5rem 0.9rem',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        textDecoration: 'none', transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--gold)';
                        e.currentTarget.style.color = 'var(--gold)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text)';
                      }}
                    >
                      {p.logo_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                          alt={p.provider_name}
                          style={{ width: '18px', height: '18px', borderRadius: '3px' }}
                        />
                      )}
                      {p.provider_name} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!trailerKey && providers.length === 0 && !loading && (
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.9rem',
              }}>
                No streaming info available for this title.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MovieModal;