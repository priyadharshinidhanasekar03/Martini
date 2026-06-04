const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
const PROXY = 'https://corsproxy.io/?';
const BASE = 'https://api.themoviedb.org/3';

export const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

export async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(PROXY + encodeURIComponent(url.toString()));
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

// Get popular movies
export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch('/movie/popular', { page });
  return data.results || [];
}

// Get movies by year and language
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

// Search movies
export async function searchMovies(query, page = 1) {
  const data = await tmdbFetch('/search/movie', { query, page });
  return data.results || [];
}

// Get movie details
export async function getMovieDetails(id) {
  return await tmdbFetch(`/movie/${id}`);
}

// Get movie videos/trailers
export async function getMovieVideos(id) {
  const data = await tmdbFetch(`/movie/${id}/videos`);
  return data.results || [];
}

// Get where to watch
export async function getWatchProviders(id) {
  const data = await tmdbFetch(`/movie/${id}/watch/providers`);
  return data.results?.IN || data.results?.US || {};
}

// Get movies by genre
export async function getMoviesByGenre(genreId, page = 1) {
  const data = await tmdbFetch('/discover/movie', {
    with_genres: genreId,
    sort_by: 'vote_average.desc',
    'vote_count.gte': 400,
    page,
  });
  return data.results || [];
}