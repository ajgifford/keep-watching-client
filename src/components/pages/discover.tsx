import { useEffect, useState } from 'react';

import { Typography } from '@mui/material';

import { Movie } from '../../model/movies';
import { DiscoverShow } from '../../model/shows';
import { useAccount } from '../context/accountContext';
import NotLoggedIn from '../login/notLoggedIn';
import MoviesCards from '../watchableContent/moviesCards';
import ShowsCards from '../watchableContent/showsCards';

function Discover() {
  const { account } = useAccount();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<DiscoverShow[]>([]);

  async function fetchAllMovies() {
    const response = await fetch(`/api/movies`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const movies: Movie[] = JSON.parse(data);
    setMovies(movies);
  }

  async function fetchAllShows() {
    const response = await fetch(`/api/shows`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    const shows: DiscoverShow[] = JSON.parse(data);
    setShows(shows);
  }

  useEffect(() => {
    fetchAllMovies();
    fetchAllShows();
  }, []);

  return (
    <>
      {!account ? (
        <NotLoggedIn />
      ) : (
        <>
          <Typography variant="h4">Discover</Typography>
          <ShowsCards shows={shows} />
          <MoviesCards movies={movies} />
        </>
      )}
    </>
  );
}

export default Discover;
