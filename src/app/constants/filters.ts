export const watchStatuses = [
  { value: '', display: '--All--' },
  { value: 'NOT_WATCHED', display: 'Not Watched' },
  { value: 'WATCHING', display: 'Watching' },
  { value: 'WATCHED', display: 'Watched' },
];

const genres = [
  { value: '', display: '--All--' },
  { value: 'Action', display: 'Action' },
  { value: 'Action & Adventure', display: 'Action & Adventure' },
  { value: 'Adventure', display: 'Adventure' },
  { value: 'Animation', display: 'Animation' },
  { value: 'Comedy', display: 'Comedy' },
  { value: 'Crime', display: 'Crime' },
  { value: 'Documentary', display: 'Documentary' },
  { value: 'Drama', display: 'Drama' },
  { value: 'Family', display: 'Family' },
  { value: 'Fantasy', display: 'Fantasy' },
  { value: 'History', display: 'History' },
  { value: 'Horror', display: 'Horror' },
  { value: 'Kids', display: 'Kids' },
  { value: 'Music', display: 'Music' },
  { value: 'Mystery', display: 'Mystery' },
  { value: 'News', display: 'News' },
  { value: 'Reality', display: 'Reality' },
  { value: 'Romance', display: 'Romance' },
  { value: 'Sci-fi & Fantasy', display: 'Sci-fi & Fantasy' },
  { value: 'Science Fiction', display: 'Science Fiction' },
  { value: 'Soap', display: 'Soap' },
  { value: 'Talk', display: 'Talk' },
  { value: 'Thriller', display: 'Thriller' },
  { value: 'TV Movie', display: 'TV Movie' },
  { value: 'War', display: 'War' },
  { value: 'War & Politics', display: 'War & Politics' },
  { value: 'Western', display: 'Western' },
];

const streamingServices = [
  { value: '', display: '--All--' },
  { value: 'Max', display: 'Max' },
  { value: 'Netflix', display: 'Netflix' },
  { value: 'Disney+', display: 'Disney+' },
  { value: 'Amazon Prime', display: 'Amazon Prime' },
  { value: 'Hulu', display: 'Hulu' },
  { value: 'Peacock', display: 'Peacock' },
  { value: 'Paramount+', display: 'Paramount+' },
  { value: 'Apple TV', display: 'Apple TV' },
];

export const sortedStreamingServices = streamingServices.sort((a, b) => (a.display < b.display ? -1 : 1));
export const sortedGenres = genres.sort((a, b) => (a.display < b.display ? -1 : 1));
