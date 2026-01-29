/**
 * BioinformaticsHub Service Worker
 * Provides offline support, caching, and push notifications
 */

const CACHE_NAME = "biohub-v1";
const RUNTIME_CACHE = "biohub-runtime";

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// API routes to cache with network-first strategy
const API_CACHE_ROUTES = [
  "/api/public/tools",
  "/api/public/categories",
  "/api/badges",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Pages - Stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Push notification event
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body || "New notification from BioinformaticsHub",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
    tag: data.tag || "biohub-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "BioinformaticsHub",
      options
    )
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync event
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-analytics") {
    event.waitUntil(syncAnalytics());
  }
});

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "update-content") {
    event.waitUntil(updateCachedContent());
  }
});

// ============ Caching Strategies ============

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(
      JSON.stringify({ error: "Offline", cached: false }),
      { 
        status: 503,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // Return offline page for navigation requests
      if (request.mode === "navigate") {
        return caches.match("/offline") || new Response("Offline", { status: 503 });
      }
      return new Response("Offline", { status: 503 });
    });

  return cached || fetchPromise;
}

// ============ Helper Functions ============

function isStaticAsset(pathname) {
  const staticExtensions = [
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", 
    ".woff", ".woff2", ".ttf", ".eot", ".ico", ".webp"
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

async function syncAnalytics() {
  // Get queued analytics from IndexedDB and send to server
  console.log("[SW] Syncing analytics...");
  // Implementation would use IndexedDB to store and sync analytics
}

async function updateCachedContent() {
  // Periodically update cached API responses
  console.log("[SW] Updating cached content...");
  const cache = await caches.open(RUNTIME_CACHE);
  
  for (const route of API_CACHE_ROUTES) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
      }
    } catch (error) {
      console.log(`[SW] Failed to update cache for ${route}`);
    }
  }
}
