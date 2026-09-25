import { useState, useCallback } from 'react';

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook personalizado para manejar operaciones asíncronas
 * @param asyncFunction - Función asíncrona a ejecutar
 * @returns {UseAsyncReturn} - Estado y función de ejecución
 */
export function useAsync<T>(asyncFunction: (...args: any[]) => Promise<T>): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error inesperado';
      setError(message);
      console.error('useAsync error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

export default useAsync;
