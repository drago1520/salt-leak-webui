import { useState, useEffect } from 'react';

export function useWebSocket<T>(url: string, retryMs = 1000) {
  const [data, setData] = useState<T | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const ws = new WebSocket(url);
    ws.onmessage = (e) => setData(JSON.parse(e.data as string) as T);
    ws.onclose = () => {
      if (!cancelled) setTimeout(() => setRetry((r) => r + 1), retryMs);
    };
    return () => {
      cancelled = true;
      ws.close();
    };
  }, [url, retry, retryMs]);

  return data;
}
