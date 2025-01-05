import { WatchStatus } from './watchStatus';

export type ShowWithSeasons = {
  id: string;
  title: string;
  description: string;
  release_date?: string;
  genres: string[];
  streaming_service: string;
  image: string;
  user_rating?: number | null;
  tv_parental_guidelines?: string;
  number_of_seasons?: number;
  total_episodes?: number;
  watched: 'Watched' | 'Watching' | 'Not Watched';
  seasons: Season[];
  profiles: string[];
};

export type Show = {
  show_id: number;
  tmdb_id: number;
  title: string;
  description: string;
  release_date?: string;
  genres: string;
  streaming_services: string;
  image: string;
  user_rating?: number | null;
  tv_parental_guidelines?: string;
  season_count?: number;
  episode_count?: number;
  watch_status: WatchStatus;
  profile_id: string;
};

export type ShowWithProfile = {
  id: string;
  title: string;
  description: string;
  release_date?: string;
  genres: string[];
  streaming_service: string;
  image: string;
  user_rating?: number | null;
  tv_parental_guidelines?: string;
  number_of_seasons?: number;
  total_episodes?: number;
  profile: WatchProfile;
};

export type WatchProfile = {
  id: string;
  name: string;
  watched: 'Watched' | 'Watching' | 'Not Watched';
};

export type Season = {
  id: string;
  show_id: string;
  title: string;
  image: string;
  release_date: string;
  number_of_episodes: number;
  episodes: Episode[];
};

export type Episode = {
  id: string;
  season_id: string;
  title: string;
  summary: string;
  duration: number;
  episode_number: number;
  release_date: string;
  image: string;
};
