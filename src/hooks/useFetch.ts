import { useCallback, useEffect, useMemo, useState } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

interface UseFetchResult<TData> {
  data: TData | null;
  error: Error | null;
  loading: boolean;
  revalidate: () => Promise<void>;
}

/**
 * Hook genérico para requisições HTTP.
 * ```ts
 * const { data, loading, revalidate } = useFetch<UserProfile[]>('/api/users');
 * ```
 */
const useFetch = <TData = unknown>(url: string, config?: AxiosRequestConfig): UseFetchResult<TData> => {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const stableConfig = useMemo(() => config, [JSON.stringify(config)]);

  const request = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.request<TData>({ url, ...(stableConfig ?? {}) });
      setData(response.data);
      setError(null);
    } catch (requestError: any) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [url, stableConfig]);

  useEffect(() => {
    request();
  }, [request]);

  return { data, error, loading, revalidate: request };
};

export default useFetch;
