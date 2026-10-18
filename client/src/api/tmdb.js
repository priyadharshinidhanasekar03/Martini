const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const BASE = `${API}/api/tmdb`;

export const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

export async function tmdbFetch(endpoint, params = {}) {
  const query = new URLSearchParams({ endpoint });

  Object.entries(params).forEach(([key, value]) => {
    query.set(key, String(value));
  });

  const res = await fetch(`${BASE}?${query.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.status_message || data.error || `TMDB error: ${res.status}`
    );
  }

  return data;
}

export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch('/movie/popular', { page });
  return data.results || [];
}

export async function getMoviesByYear(year, language = '', page = 1) {
  const params = {
    sort_by: 'popularity.desc',
    'primary_release_date.gte': `${year}-01-01`,
    'primary_release_date.lte': `${year}-12-31`,
    'vote_count.gte': 15,
    page,
  };

  if (language) params.with_original_language = language;

  const data = await tmdbFetch('/discover/movie', params);
  return data.results || [];
}

export async function searchMovies(query, page = 1) {
  const data = await tmdbFetch('/search/movie', { query, page });
  return data.results || [];
}

export async function searchPerson(query) {
  const data = await tmdbFetch('/search/person', {
    query,
    page: 1,
    include_adult: false,
  });
  return data.results || [];
}

export async function getPersonCredits(id) {
  return tmdbFetch(`/person/${id}/movie_credits`);
}

export async function getMovieDetails(id) {
  return tmdbFetch(`/movie/${id}`);
}

export async function getMovieVideos(id) {
  const data = await tmdbFetch(`/movie/${id}/videos`);
  return data.results || [];
}

export async function getWatchProviders(id) {
  const data = await tmdbFetch(`/movie/${id}/watch/providers`);
  return data.results?.IN || data.results?.US || {};
}

export async function getMoviesByGenre(genreId, page = 1) {
  const data = await tmdbFetch('/discover/movie', {
    with_genres: genreId,
    sort_by: 'vote_average.desc',
    'vote_count.gte': 400,
    page,
  });

  return data.results || [];
}