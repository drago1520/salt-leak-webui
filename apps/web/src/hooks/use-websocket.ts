import { useState, useEffect } from 'react';

export function useWebSocket<T>(url: string, retryMs = 1000) {
  const [data, setData] = useState<T | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const ws = new WebSocket(url);
    ws.onopen = () => console.log('[ws] open', url);
    ws.onerror = () => console.error('[ws] error', url);
    ws.onmessage = (e) => setData(JSON.parse(e.data as string) as T);
    ws.onclose = (e) => {
      console.log('[ws] close', url, {
        code: e.code,
        reason: e.reason,
        wasClean: e.wasClean,
        willRetry: !cancelled,
      });
      if (!cancelled) setTimeout(() => setRetry((r) => r + 1), retryMs);
    };
    return () => {
      cancelled = true;
      ws.close();
    };
  }, [url, retry, retryMs]);

  return data;
}
