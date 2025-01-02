import { WatchStatus } from './watchStatus';

export type Movie = {
  movie_id: number;
  tmtb_id: number;
  title: string;
  description: string;
  release_date: string;
  genres: string;
  runtime: number;
  image: string;
  user_rating: number | null;
  mpa_rating: string;
  streaming_service: string;
  watched: WatchStatus;
  profile_id: string;
};

export type ProfileMovies = {
  profile_id: string;
  movies: Movie[];
};
