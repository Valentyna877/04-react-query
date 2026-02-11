import { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import { fetchMovies, type FetchMoviesResponse } from '../../services/movieService';
import type { Movie } from '../../types/movie';
import toast from 'react-hot-toast';
import css from './App.module.css';
import { useQuery } from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';

export default function App() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const {
    data,
    isLoading,
    isError,
    isFetched,
    isFetching, 
  } = useQuery<FetchMoviesResponse>({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query.trim(),
    placeholderData: (prev: FetchMoviesResponse | undefined) => prev,
    initialData: { page: 1, results: [], total_pages: 0, total_results: 0 },
  });

  const { results: movies = [], total_pages: totalPages = 0 } = data ?? {};

  useEffect(() => {
    if (!query.trim()) return;

    if (isFetched && !isLoading && movies.length === 0) {
      toast.error('No movies found for your request.');
    }
  }, [isFetched, isLoading, movies, query]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
    setSelectedMovie(null);
  };

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />

      {(isLoading || isFetching) && <Loader />}
      {isError && <ErrorMessage />}

      {movies.length > 0 && (
        <>
          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }: { selected: number }) => setPage(selected + 1)}
              forcePage={page - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
              renderOnZeroPageCount={null}
            />
          )}
          <MovieGrid movies={movies} onSelect={setSelectedMovie} />
        </>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}