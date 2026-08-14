// No-op fetch handler. Chrome requires a service worker with a fetch listener
// before it offers the Android install prompt. No caching, no offline support.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Notification', body: '' };
  event.waitUntil(
    self.registration.showNotification(data.title, { body: data.body }),
  );
});
