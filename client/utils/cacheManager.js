class CacheManager {
  constructor() {
    this.CACHE_NAME = 'society-events-v1';
    this.API_CACHE_NAME = 'api-cache';
    this.CACHE_TIMEOUTS = {
      events: 60 * 60 * 1000, // 1 hour
      activities: 60 * 60 * 1000, // 1 hour
      images: 30 * 24 * 60 * 60 * 1000 // 30 days
    };
  }

  // Initialize cache
  async init() {
    if ('caches' in window) {
      try {
        await caches.open(this.CACHE_NAME);
        await caches.open(this.API_CACHE_NAME);
        console.log('Cache initialized');
      } catch (error) {
        console.error('Cache initialization failed:', error);
      }
    }
  }

  // Cache data with expiration
  async cacheData(key, data, cacheType = 'api') {
    if (!('caches' in window)) return;

    try {
      const cacheName = cacheType === 'api' ? this.API_CACHE_NAME : this.CACHE_NAME;
      const cache = await caches.open(cacheName);

      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (this.CACHE_TIMEOUTS[key] || 60 * 60 * 1000)
      };

      const response = new Response(JSON.stringify(cacheItem), {
        headers: { 'Content-Type': 'application/json' }
      });

      await cache.put(`/${key}`, response);
      console.log(`Cached ${key}`);
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  // Get cached data with expiration check
  async getCachedData(key) {
    if (!('caches' in window)) return null;

    try {
      const cache = await caches.open(this.API_CACHE_NAME);
      const response = await cache.match(`/${key}`);

      if (!response) return null;

      const cacheItem = await response.json();

      // Check if cache is expired
      if (Date.now() > cacheItem.expiry) {
        await cache.delete(`/${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  // // Clear expired cache
  // async clearExpiredCache() {
  //   if (!('caches' in window)) return;

  //   try {
  //     const cache = await caches.open(this.API_CACHE_NAME);
  //     const requests = await cache.keys();

  //     for (const request of requests) {
  //       const response = await cache.match(request);
  //       if (response) {
  //         const cacheItem = await response.json();
  //         if (Date.now() > cacheItem.expiry) {
  //           await cache.delete(request);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Cache cleanup error:', error);
  //   }
  // }



  // --------------------------------------------


  // Clear expired cache - FIXED VERSION

  async clearExpiredCache() {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(this.API_CACHE_NAME);
      const requests = await cache.keys();

      console.log(`Checking ${requests.length} cache entries...`);

      for (const request of requests) {
        try {
          const response = await cache.match(request);
          if (!response) continue;

          // Skip non-cache items (like HTML pages)
          const contentType = response.headers.get('content-type');
          const isCacheItem = response.headers.get('X-Cache-Item') === 'true';

          // Only process our cache items
          if (!isCacheItem) {
            console.log(`Skipping non-cache item: ${request.url}`);
            continue;
          }

          // Parse safely
          const text = await response.clone().text();

          // Skip HTML files
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.log(`Skipping HTML file: ${request.url}`);
            continue;
          }

          // Try to parse as JSON
          let cacheItem;
          try {
            cacheItem = JSON.parse(text);
          } catch (parseError) {
            console.log(`Invalid JSON in cache: ${request.url}`, parseError);
            await cache.delete(request);
            continue;
          }

          // Check expiry
          if (cacheItem.expiry && Date.now() > cacheItem.expiry) {
            console.log(`Deleting expired cache: ${request.url}`);
            await cache.delete(request);
          }

        } catch (error) {
          console.log(`Error processing ${request.url}:`, error);
          // Continue with next item
        }
      }

      console.log('Cache cleanup completed');
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  // --------------------------------------------

  // Clear all cache
  async clearAllCache() {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All cache cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Cache image
  async cacheImage(url) {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(this.CACHE_NAME);
      const response = await fetch(url);
      await cache.put(url, response.clone());
      return response;
    } catch (error) {
      console.error('Image cache error:', error);
      return null;
    }
  }

  // Get cached image
  async getCachedImage(url) {
    if (!('caches' in window)) return null;

    try {
      const cache = await caches.open(this.CACHE_NAME);
      return await cache.match(url);
    } catch (error) {
      console.error('Image cache read error:', error);
      return null;
    }
  }
}

export const cacheManager = new CacheManager();