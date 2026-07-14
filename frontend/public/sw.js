self.addEventListener('fetch', event => {
  if (event.request.url.includes('/auth/') ||
      event.request.url.includes('/entries') ||
      event.request.url.includes('/search')) {
    return
  }
  event.respondWith(fetch(event.request))
})