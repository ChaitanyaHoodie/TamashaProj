import { useState } from 'react';

export const usePagination = (initialPage = 1, pageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  
  const fetchNextPage = () => {
    setLoading(true);
    setPage(prevPage => prevPage + 1);
  };
  
  return { page, pageSize, loading, fetchNextPage };
};