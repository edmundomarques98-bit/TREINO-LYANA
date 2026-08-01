const CACHE = "meu-treino-v6";
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icon.svg', './media/abduction.gif', './media/calf_raise.gif', './media/chest_press.gif', './media/curl.gif', './media/dead_bug.gif', './media/hinge.gif', './media/hip_thrust.gif', './media/lateral_raise.gif', './media/leg_curl.gif', './media/leg_extension.gif', './media/leg_press.gif', './media/lunge.gif', './media/plank.gif', './media/pulldown.gif', './media/row.gif', './media/run.gif', './media/squat.gif', './media/triceps_pushdown.gif'];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", event => event.respondWith(caches.match(event.request).then(r => r || fetch(event.request))));
