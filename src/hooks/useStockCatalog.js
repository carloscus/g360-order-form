/**
 * useStockCatalog.js
 * Hook React para consumir el catálogo/stock en vivo del servicio stockApi.
 * Devuelve el estado del store (items, metadata, status, error, frescura) + refresh().
 */
import { useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import stockApi from '../services/stockApi';

const getServerState = () => stockApi.getState();

export function useStockCatalog() {
  const state = useSyncExternalStore(stockApi.subscribe, stockApi.getState, getServerState);

  const refresh = useCallback(() => stockApi.refresh(), []);

  return { ...state, refresh };
}

export default useStockCatalog;
