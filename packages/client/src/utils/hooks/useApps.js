import { useEffect, useState, useCallback } from 'react';
import { apiURL } from '../../apiURL';

export function useApps({
  orderBy,
  filteredCategories,
  filteredPricing,
  filteredDetails,
  filtersSubmitted,
  searchParam,
  tagSlugParam,
}) {
  const [apps, setApps] = useState({ data: [], lastItem: null, hasMore: true });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // reset apps whenever filters/search change
  useEffect(() => {
    setPage(0);
    setApps({ data: [], lastItem: null, hasMore: true });
  }, [
    filteredCategories,
    orderBy,
    filteredDetails,
    filteredPricing,
    filtersSubmitted,
    searchParam,
    tagSlugParam,
  ]);

  const buildUrl = useCallback(
    (pageNumber) => {
      return `${apiURL()}/apps?page=${pageNumber}&column=${
        orderBy.column
      }&direction=${orderBy.direction}${
        filteredCategories.length > 0
          ? `&categories=${filteredCategories.join(',')}`
          : ''
      }${
        filtersSubmitted && filteredPricing.length > 0
          ? `&filteredPricing=${encodeURIComponent(filteredPricing)}`
          : ''
      }${
        filtersSubmitted && filteredDetails.length > 0
          ? `&filteredDetails=${encodeURIComponent(filteredDetails)}`
          : ''
      }${searchParam !== undefined ? `&search=${searchParam}` : ''}${
        tagSlugParam !== undefined ? `&tag=${tagSlugParam}` : ''
      }`;
    },
    [
      orderBy,
      filteredCategories,
      filteredPricing,
      filteredDetails,
      filtersSubmitted,
      searchParam,
      tagSlugParam,
    ],
  );

  const fetchApps = useCallback(
    async (pageNumber = page) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(buildUrl(pageNumber));
        const json = await response.json();

        let hasMore = true;
        if (
          json.data.length === 0 ||
          json.data.some((item) => item.id === json.lastItem?.id)
        ) {
          hasMore = false;
        }

        setApps((prev) => {
          if (pageNumber === 0) {
            // fresh load (filters/search changed)
            return {
              data: json.data,
              lastItem: json.lastItem,
              hasMore,
            };
          }
          return {
            data: [...prev.data, ...json.data],
            lastItem: json.lastItem,
            hasMore,
          };
        });

        setPage(pageNumber + 1);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [buildUrl, page],
  );

  // initial fetch
  useEffect(() => {
    fetchApps(0);
  }, [fetchApps]);

  return { apps, isLoading, error, fetchApps };
}
