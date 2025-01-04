export const watchStatuses = [
  { value: '', display: '--All--' },
  { value: 'NOT_WATCHED', display: 'Not Watched' },
  { value: 'WATCHING', display: 'Watching' },
  { value: 'WATCHED', display: 'Watched' },
];

interface ContentItem {
  genres: string;
  streaming_service: string;
}

export function generateGenreFilterValues(items: ContentItem[]): string[] {
  const genreSet: Set<string> = new Set();

  items.forEach((item) => {
    const itemGenres = item.genres || '';
    const genres = itemGenres.split(',').map((genre) => genre.trim());
    genres.forEach((genre) => {
      genreSet.add(genre);
    });
  });

  return Array.from(genreSet).sort();
}

export function generateStreamingServiceFilterValues(items: ContentItem[]): string[] {
  const servicesSet: Set<string> = new Set();

  items.forEach((item) => {
    if (item.streaming_service) {
      servicesSet.add(item.streaming_service);
    }
  });

  return Array.from(servicesSet).sort();
}
