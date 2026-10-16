// YouTube IFrame API
let player;
let playerReady = false;
let positionSaveInterval;
let sleepTimerTimeout;
let sleepTimerInterval;
let sleepTimerEndTime;
let currentPlaylist = [];
let currentVideoIndex = 0;
let currentPlaylistId = '';
let isShuffledPlaylist = false;


// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Shown in the About box. Keep in step with the version in package.json and RELEASE_NOTES.md
const APP_VERSION = '2.0';

// The title placeholder, i.e. "no custom title given". 'YouTube Audiobook Player' is the
// placeholder from versions before the app covered more than audiobooks; links and favorites
// still carrying it are treated as having no title of their own.
const DEFAULT_TITLE = 'Hands-Free YouTube Player';
const LEGACY_DEFAULT_TITLES = ['YouTube Audiobook Player'];

function isDefaultTitle(title) {
    return title === DEFAULT_TITLE || LEGACY_DEFAULT_TITLES.includes(title);
}

// Two faces of one app, chosen by hostname: BookTube - the original name and domain - keeps
// the book logo and the audiobook presets, NoTube gets the logo ∞ and everything that is not
// a book. Same code, same storage format; only the preset selection and the wording differ.
// ?brand=booktube or ?brand=notube overrides the hostname, for testing and dev.
const BRANDS = {
    booktube: {
        key: 'booktube',
        name: 'BookTube',
        icon: 'fa-book-reader',
        tagline: 'Audiobooks on YouTube, hands-free: full-length books, lectures and readings.',
        email: 'booktube@nosocial.net',
        note: 'Looking for music, language lessons and workouts? Same app, as ',
        isPreset: preset => !!preset.book
    },
    notube: {
        key: 'notube',
        name: 'NoTube',
        icon: 'fa-infinity',
        tagline: 'YouTube without the feed. Hands-free playback of lectures, language ' +
            'lessons, music and workouts.',
        email: 'notube@nosocial.net',
        note: 'Looking for the audiobook collection? Same app, as ',
        isPreset: preset => !preset.book
    }
};
BRANDS.booktube.other = BRANDS.notube;
BRANDS.notube.other = BRANDS.booktube;

const BRAND = (function detectBrand() {
    const override = new URLSearchParams(window.location.search).get('brand');
    if (override && BRANDS[override]) return BRANDS[override];
    return /booktube/i.test(window.location.hostname) ? BRANDS.booktube : BRANDS.notube;
})();

// Runs at script load (the script tag is last in the body) so the brand is in place before
// the first paint, whichever domain served the identical index.html
(function applyBranding() {
    console.log('Brand:', BRAND.name);
    document.title = `${BRAND.name} - ${DEFAULT_TITLE}`;
    // Picks the brand palette in styles.css: red on black for BookTube, blue for NoTube
    document.documentElement.dataset.brand = BRAND.key;

    document.querySelectorAll('.brand-icon').forEach(icon => {
        icon.classList.remove(BRAND.other.icon);
        icon.classList.add(BRAND.icon);
    });

    const set = (id, apply) => {
        const el = document.getElementById(id);
        if (el) apply(el);
    };
    // The shipped favicon.ico is the BookTube book; NoTube draws its ∞ inline
    if (BRAND.key === 'notube') {
        set('favicon', el => {
            el.type = 'image/svg+xml';
            el.href = 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
                '<rect width="64" height="64" rx="12" fill="#14171f"/>' +
                '<g fill="none" stroke="#4d8dff" stroke-width="7">' +
                '<circle cx="23" cy="32" r="11"/><circle cx="41" cy="32" r="11"/>' +
                '</g></svg>');
        });
    }
    set('brandName', el => el.textContent = BRAND.name);
    set('appVersion', el => el.textContent = `Version ${APP_VERSION}`);
    set('aboutTitle', el => el.textContent = `About ${BRAND.name}`);
    set('aboutTagline', el => el.textContent = BRAND.tagline);
    set('brandNote', el => {
        const link = document.createElement('a');
        link.href = `https://${BRAND.other.key}.nosocial.net/`;
        link.textContent = BRAND.other.name;
        el.textContent = BRAND.note;
        el.appendChild(link);
        el.appendChild(document.createTextNode('.'));
    });
    set('supportEmail', el => {
        el.textContent = BRAND.email;
        el.href = `mailto:${BRAND.email}`;
    });
})();

// DOM Elements - Get them after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const mainScreen = document.getElementById('mainScreen');
    const playerScreen = document.getElementById('playerScreen');
    const playForm = document.getElementById('playForm');
    const videoInput = document.getElementById('videoInput');
    const sleepTimerSelect = document.getElementById('sleepTimer');
    const loopCheckbox = document.getElementById('loopVideo');
    const positionSelect = document.getElementById('position');
    const backToMain = document.getElementById('backToMain');
    const helpIcon = document.getElementById('helpIcon');
    const helpModal = document.getElementById('helpModal');
    const closeModal = document.querySelector('.close');
    const currentYearSpan = document.getElementById('currentYear');
    const sleepTimerOverlay = document.getElementById('sleepTimerOverlay');
    const sleepTimerDisplay = document.getElementById('sleepTimerDisplay');
    const timerResetSelect = document.getElementById('timerResetSelect');
    const titleInput = document.getElementById('titleInput');
    const resetAppButton = document.getElementById('resetAppButton');
    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const importFile = document.getElementById('importFile');
    const favoritesIcon = document.getElementById('favoritesIcon');
    const favoritesScreen = document.getElementById('favoritesScreen');
    const closeFavorites = document.getElementById('closeFavorites');
    const backFromFavorites = document.getElementById('backFromFavorites');
    const favoritesList = document.getElementById('favoritesList');
    const saveToFavoritesCheckbox = document.getElementById('saveToFavorites');

    // Set current year
    currentYearSpan.textContent = new Date().getFullYear();

    // Video input info tooltip
    const videoInputInfo = document.getElementById('videoInputInfo');
    videoInputInfo.addEventListener('click', () => {
        alert('Supports video IDs, URLs, playlist IDs (PLxxx, OLAK5xxx), space-separated');
    });

    // Default favorites list
    const defaultFavorites = [
        { v: 'NSfkgr5TTYM yPnhdK9touU YjvTqHfFqEc', book: true, sleep: '20', loop: false, pos: 'saved', title: 'Сумма технологии. Станислав Лем' },
        { v: 'zHtvJj5bgoo', book: true, sleep: '45', loop: false, pos: 'saved', title: 'The Aeneid by Virgil' },
        { v: 'PLQ7iliSaUiA_KHmGhRd4HpuuPM37UGSE_', book: true, sleep: '20', loop: false, pos: 'saved', title: 'История. Геродот' },
        { v: 'gKg0W5Un0PI', book: true, sleep: '20', loop: false, pos: 'saved', title: 'Дао дэ цзин. Лао-цзы' },
        { v: 'PLjPg58THfX_yQrAgXoShepHoDLtOVeKWh', book: true, sleep: '20', loop: false, pos: 'saved', title: 'Махабхарата' },
        { v: 'ZQwrt4R4XDw', book: true, sleep: '20', loop: false, pos: 'saved', title: 'Колыбель для кошки. Курт Воннегут' },
        { v: 'IIEJNUO1BoQ', book: true, sleep: '15', loop: false, pos: 'saved', title: 'The Bhagavad Gita, The Lord\'s Song' },
        { v: 'vS4ble0Uznk', book: true, sleep: '20', loop: false, pos: 'saved', title: 'Siddhartha By Hermann Hesse' },
        { v: 'PL-lY2fdb59Of61NGdOmXUagd0f1B_RUXC', book: true, sleep: '20', loop: false, pos: 'saved', title: 'The Master and Margarita by Mikhail Bulgakov' },
        { v: '-H3IjANl0V4 BR0k8I8i28U', book: true, sleep: '30', loop: false, pos: 'saved', title: 'Наши за границей. Николай Лейкин (Gennady Anatolievich)' },
        { v: 'PLa-hUuSspM0GdvkB-YHW5KVyuCe2QrhMx', book: true, sleep: '30', loop: false, pos: 'saved', title: 'Suetonius\' The Lives of the Caesars (Classics in Audiobook)' },
        { v: 'OLAK5uy_kZPrWNRLjJnjHMA31GyiFwmphn_4a-rE0', sleep: '0', loop: true, pos: 'saved', title: 'Default Music for Generic People (rmnz)' },
        { v: 'PL5E0m9KbufwZlALCgXRHyoE99VeORMmzr', book: true, sleep: '30', loop: false, pos: 'random', title: 'Тысяча и одна ночь. Сказки' },
        { v: 'nwRoHC83wx0', sleep: '45', loop: true, pos: 'random', title: 'Gayatri Mantra – Rig Veda 3.62.10' },
        { v: 'PLG9bZb7LskJM', sleep: '0', loop: true, pos: 'random', title: 'Home Exercise Guide: Abs' },
        { v: 'tSCrnPUt-pU', sleep: '60', loop: true, pos: 'random', title: 'German A1 Hands-Free Trainer' },
        { v: 'esvhhEGLTNA', sleep: '60', loop: true, pos: 'random', title: 'German A2 Hands-Free Trainer' },
        { v: 'wNoTY_TZvqI UBcIZf76mIs JYDI_HhWIgs', sleep: '60', loop: true, pos: 'random', title: 'German B1 Hands-Free Trainer' },
        { v: 'PLAQ6vzFKj_1uqRv3OCX-Elexz9C8vfENs', book: true, sleep: '20', loop: false, pos: 'shuffle', title: 'The Stories of Mahabharata' },
        { v: 'PLb-JKoHS0AMAJ1gApOJOxuZoLsGZPLWqc', book: true, sleep: '30', loop: false, pos: 'shuffle', title: '"Модель для сборки". Радиопрограмма' },
        { v: 'PLTMnNOWf9hrpvVf_1JksytDPOmjh0JJpE', book: true, sleep: '30', loop: false, pos: 'shuffle', title: 'Сборник аудиокниг (Gennady Anatolievich)' }
    ];

    // Which presets have already been copied into the favorites list of this browser
    const PRESET_SEED_KEY = 'booktube_seeded_presets';

    // Presets of the current brand: the books on BookTube, everything else on NoTube.
    // The flag is internal, it is not copied into the favorites list.
    function brandPresets() {
        return defaultFavorites.filter(BRAND.isPreset).map(({ book, ...preset }) => preset);
    }

    // Favorites management
    // Favorites hold normalized IDs; compare on those so the same video saved as a URL and
    // as a bare ID counts as one entry
    function favoriteKey(value) {
        return convertToVideoIds(value.replace(/\+/g, ' ')) || value;
    }

    // The favorites list, exactly as stored - and exactly as exported
    function getFavorites() {
        return JSON.parse(localStorage.getItem('booktube_favorites') || '[]');
    }

    function saveFavorites(favorites) {
        localStorage.setItem('booktube_favorites', JSON.stringify(favorites));
    }

    // Presets ship in the app code and are copied into the stored favorites list, each one
    // only once. That keeps the list the user sees identical to the list that is stored and
    // exported, while deletes and edits of a preset stick and presets added in a later
    // release still reach everyone.
    function seedPresetFavorites() {
        const stored = localStorage.getItem('booktube_favorites');
        const favorites = stored ? JSON.parse(stored) : [];
        const seeded = new Set(JSON.parse(localStorage.getItem(PRESET_SEED_KEY) || '[]'));
        const present = new Set(favorites.map(fav => favoriteKey(fav.v)));
        let added = 0;

        brandPresets().forEach(preset => {
            const key = favoriteKey(preset.v);
            if (seeded.has(key)) return;   // already copied once: the user may have deleted it since
            seeded.add(key);
            if (present.has(key)) return;  // the user already has their own version of it
            favorites.push({ ...preset, v: key });
            added++;
        });

        if (added > 0 || !stored) saveFavorites(favorites);
        localStorage.setItem(PRESET_SEED_KEY, JSON.stringify([...seeded]));
        if (added > 0) console.log('Copied', added, 'preset favorites into the favorites list');
    }

    function addToFavorites(item) {
        const favorites = getFavorites();
        const key = favoriteKey(item.v);
        const existingIndex = favorites.findIndex(fav => favoriteKey(fav.v) === key);

        if (existingIndex !== -1) {
            // Same video(s) already saved, as a URL or as an ID: update that entry in place
            favorites[existingIndex] = { ...item, v: key };
        } else {
            favorites.unshift({ ...item, v: key });
        }

        saveFavorites(favorites);
    }

    // Clean up favorites saved before input normalization: full URLs, and several entries
    // for one video. The first entry of a video wins, since newest is saved first.
    function normalizeStoredFavorites() {
        const favorites = getFavorites();
        const seen = new Set();
        const normalized = [];
        favorites.forEach(fav => {
            const v = favoriteKey(fav.v);
            if (seen.has(v)) return;
            seen.add(v);
            normalized.push({ ...fav, v });
        });
        if (JSON.stringify(normalized) !== JSON.stringify(favorites)) {
            console.log('Normalized stored favorites:', favorites.length, '->', normalized.length);
            saveFavorites(normalized);
        }
    }

    // Any favorite can be removed, presets included; the preset is not copied back in
    function removeFromFavorites(index) {
        const favorites = getFavorites();
        favorites.splice(index, 1);
        saveFavorites(favorites);
        renderFavorites();
    }

    // Drop the user's list and copy the presets in again
    function resetFavorites() {
        localStorage.removeItem('booktube_favorites');
        localStorage.removeItem(PRESET_SEED_KEY);
        seedPresetFavorites();
        renderFavorites();
    }

    function renderFavorites() {
        const favorites = getFavorites();
        favoritesList.innerHTML = '';
        
        favorites.forEach((fav, index) => {
            const item = document.createElement('div');
            item.className = 'favorite-item';
            
            const info = document.createElement('div');
            info.className = 'favorite-info';
            info.innerHTML = `
                <div class="favorite-title">${fav.title}</div>
                <div class="favorite-details">${fav.sleep === '0' ? 'No timer' : fav.sleep + ' min'} • ${fav.loop ? 'Loop' : 'No loop'} • ${fav.pos}</div>
            `;
            
            const deleteBtn = document.createElement('i');
            deleteBtn.className = 'fas fa-trash favorite-delete';
            deleteBtn.onclick = () => removeFromFavorites(index);
            
            info.onclick = async () => {
                // Normalize older favorites saved as URLs, so the edit screen shows plain IDs
                // and playing it again saves it normalized
                const normalizedIds = favoriteKey(fav.v);
                videoInput.value = normalizedIds;
                sleepTimerSelect.value = fav.sleep;
                loopCheckbox.checked = fav.loop;
                positionSelect.value = fav.pos;
                titleInput.value = fav.title;
                updatePageTitle(fav.title);

                // Update URL with the selected favorite's parameters
                const params = {
                    videoId: normalizedIds,
                    sleepTimer: fav.sleep,
                    loop: fav.loop,
                    position: fav.pos,
                    title: fav.title
                };
                await updateURL(params, true);
                
                showMainScreen();
            };
            
            item.appendChild(info);
            item.appendChild(deleteBtn);
            favoritesList.appendChild(item);
        });
    }

    // Video ID in a watch, embed, shorts, live or youtu.be URL (m. and music. hosts included)
    const VIDEO_URL_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

    // Playlist ID of a token: from a list= URL parameter, or a bare ID — anything longer
    // than an 11-character video ID ('PLxxx', but also 'OLAK5uy_xxx' albums, 'RDxxx' mixes)
    function detectPlaylistId(token) {
        const urlMatch = token.match(/[?&]list=([a-zA-Z0-9_-]+)/);
        if (urlMatch) return urlMatch[1];
        return /^[a-zA-Z0-9_-]{12,}$/.test(token) ? token : null;
    }

    // Extract video IDs from input (supports multiple IDs and playlist IDs)
    async function extractVideoIds(input) {
        console.log('Extracting video IDs from input:', input);
        const ids = input.trim().split(/\s+/);
        const videoRegex = VIDEO_URL_REGEX;

        const results = [];

        for (const id of ids) {
            console.log('Processing ID:', id);
            // Check if it's a playlist ID or URL
            const playlistId = detectPlaylistId(id);
            if (playlistId) {
                console.log('Detected playlist ID:', playlistId);
                currentPlaylistId = playlistId;
                try {
                    const playlistVideos = await fetchPlaylistVideos(playlistId);
                    console.log('Fetched playlist videos:', playlistVideos);
                    results.push(...playlistVideos);
                } catch (error) {
                    console.error('Failed to fetch playlist:', error);
                }
            } else {
                // Handle single video ID or URL
                const videoMatch = id.match(videoRegex);
                const videoId = videoMatch ? videoMatch[1] : id;
                console.log('Processing video ID:', videoId, 'Length:', videoId.length);
                if (videoId.length === 11) {
                    results.push(videoId);
                }
            }
        }
        
        console.log('Final extracted video IDs:', results);
        return results;
    }

    // Convert URLs to video IDs for URL parameter
    function convertToVideoIds(input) {
        console.log('convertToVideoIds input:', input);
        // Split by both spaces and + signs
        const ids = input.trim().split(/[\s+]+/);
        console.log('convertToVideoIds split ids:', ids);
        const videoRegex = VIDEO_URL_REGEX;

        const results = [];

        for (const id of ids) {
            console.log('Processing id:', id, 'length:', id.length);
            // Check if it's a playlist ID or URL
            const playlistId = detectPlaylistId(id);
            if (playlistId) {
                console.log('Found playlist:', playlistId);
                results.push(playlistId);
            } else {
                // Handle single video ID or URL
                const videoMatch = id.match(videoRegex);
                if (videoMatch) {
                    console.log('Found video from URL:', videoMatch[1]);
                    results.push(videoMatch[1]);
                } else if (id.length === 11) {
                    // It's already a video ID
                    console.log('Found video ID:', id);
                    results.push(id);
                } else {
                    console.log('Skipping invalid ID:', id);
                }
            }
        }
        
        console.log('convertToVideoIds results:', results);
        const result = results.join(' ');
        console.log('convertToVideoIds final result:', result);
        return result;
    }
    
    // CORS proxies, tried in order starting with the last one that worked.
    // r.jina.ai returns the raw page with X-Return-Format: html; the others are
    // intermittently available fallbacks.
    const proxyServices = [
        { prefix: 'https://r.jina.ai/', encode: false, headers: { 'X-Return-Format': 'html' } },
        { prefix: 'https://api.allorigins.win/raw?url=', encode: true },
        { prefix: 'https://api.codetabs.com/v1/proxy?quest=', encode: true },
    ];
    const FETCH_TIMEOUT_MS = 20000;
    const MAX_PLAYLIST_PAGES = 50;
    let preferredProxyIndex = 0;

    // Show/hide loading indicator
    function showLoading(text = 'Loading playlist...') {
        const indicator = document.getElementById('loadingIndicator');
        indicator.querySelector('span').textContent = text;
        indicator.classList.add('active');
        // Force reflow to restart animation
        indicator.offsetHeight;
    }

    function hideLoading() {
        document.getElementById('loadingIndicator').classList.remove('active');
    }

    let playlistTotal = 0;
    const PLAYLIST_LOADED_PAUSE_MS = 2000;

    function showPlaylistProgress(loaded, total) {
        playlistTotal = total;
        // Total stays 0 until the first page reveals it; '?' if the page doesn't state it
        showLoading(`Loading playlist... ${loaded}/${total || (loaded ? '?' : 0)}`);
    }

    // Show the final count for a moment so the user can check it before playback starts
    async function showPlaylistLoaded(loaded, label = 'Loaded playlist') {
        showLoading(`${label}: ${loaded}/${playlistTotal || loaded}`);
        await new Promise(resolve => setTimeout(resolve, PLAYLIST_LOADED_PAUSE_MS));
    }

    // fetch() that gives up after a timeout instead of hanging on a dead proxy
    async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { ...options, signal: controller.signal });
        } finally {
            clearTimeout(timer);
        }
    }

    // Fetch a URL through the proxies, starting with the last one that worked
    async function fetchViaProxy(url) {
        let lastError;
        for (let n = 0; n < proxyServices.length; n++) {
            const i = (preferredProxyIndex + n) % proxyServices.length;
            const proxy = proxyServices[i];
            try {
                const proxyUrl = proxy.prefix + (proxy.encode ? encodeURIComponent(url) : url);
                const response = await fetchWithTimeout(proxyUrl, { headers: proxy.headers || {} });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const text = await response.text();
                preferredProxyIndex = i;
                return text;
            } catch (error) {
                console.warn(`Proxy ${proxy.prefix} failed:`, error.message);
                lastError = error;
            }
        }
        throw lastError || new Error('All proxies failed');
    }

    // The embedded player caps a playlist at 200 videos
    const IFRAME_PLAYLIST_LIMIT = 200;
    const IFRAME_PLAYLIST_TIMEOUT_MS = 15000;

    // The IFrame API script loads asynchronously; a quick form submit can beat it
    function waitForYT(timeoutMs = 5000) {
        if (window.YT && YT.Player) return Promise.resolve(true);
        return new Promise(resolve => {
            const start = Date.now();
            const timer = setInterval(() => {
                if (window.YT && YT.Player) {
                    clearInterval(timer);
                    resolve(true);
                } else if (Date.now() - start > timeoutMs) {
                    clearInterval(timer);
                    resolve(false);
                }
            }, 100);
        });
    }

    // Ask a hidden player for the playlist contents: no proxy and no API key needed, and it
    // works for auto-generated playlists (OLAK5 albums, RD mixes) that have no RSS feed
    async function fetchPlaylistViaIframe(playlistId) {
        if (!await waitForYT()) return [];

        // The player replaces the element it is given, so put it in a removable wrapper
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;top:-9999px';
        const host = document.createElement('div');
        wrapper.appendChild(host);
        document.body.appendChild(wrapper);

        return new Promise(resolve => {
            let settled = false;
            let tempPlayer, probe, timeout;
            const finish = ids => {
                if (settled) return;
                settled = true;
                clearInterval(probe);
                clearTimeout(timeout);
                try {
                    if (tempPlayer && tempPlayer.destroy) tempPlayer.destroy();
                } catch (e) { /* player may not be initialised yet */ }
                wrapper.remove();
                console.log('Iframe playlist resolution returned', ids.length, 'videos');
                resolve(ids);
            };

            timeout = setTimeout(() => finish([]), IFRAME_PLAYLIST_TIMEOUT_MS);
            try {
                tempPlayer = new YT.Player(host, {
                    width: 200,
                    height: 200,
                    // listType + list cues the playlist without playing it
                    playerVars: { listType: 'playlist', list: playlistId },
                    events: {
                        onReady: () => {
                            probe = setInterval(() => {
                                const ids = tempPlayer.getPlaylist();
                                if (ids && ids.length) finish(ids);
                            }, 250);
                        },
                        onError: event => {
                            console.warn('Iframe playlist resolution error:', event.data);
                            finish([]);
                        }
                    }
                });
            } catch (error) {
                console.warn('Iframe playlist resolution failed:', error);
                finish([]);
            }
        });
    }

    // Fetch all video IDs of a YouTube playlist, reporting progress as it goes
    async function fetchPlaylistVideos(playlistId) {
        console.log('Fetching playlist videos for ID:', playlistId);
        showPlaylistProgress(0, 0);
        try {
            // The embedded player resolves any playlist without a proxy or API key, but
            // only up to 200 videos, so longer playlists still need the page scraping
            let videoIds = await fetchPlaylistViaIframe(playlistId);
            const cappedByPlayer = videoIds.length === IFRAME_PLAYLIST_LIMIT;
            if (videoIds.length > 0) {
                showPlaylistProgress(videoIds.length, cappedByPlayer ? 0 : videoIds.length);
            }
            if (videoIds.length === 0 || cappedByPlayer) {
                try {
                    const scraped = await fetchPlaylistFromPage(playlistId, showPlaylistProgress);
                    if (scraped.length > videoIds.length) videoIds = scraped;
                } catch (error) {
                    console.error('Playlist page scraping failed:', error);
                }
            }
            if (videoIds.length === 0) {
                try {
                    videoIds = await fetchPlaylistVideosRSS(playlistId);
                } catch (error) {
                    console.error('RSS fallback failed:', error);
                }
            }

            if (videoIds.length > 0) {
                localStorage.setItem(`booktube_playlist_cache_${playlistId}`, JSON.stringify(videoIds));
                await showPlaylistLoaded(videoIds.length);
                return videoIds;
            }

            // Network failed everywhere: reuse the last successfully loaded list
            const cached = localStorage.getItem(`booktube_playlist_cache_${playlistId}`);
            if (cached) {
                console.log('Using cached playlist');
                const cachedIds = JSON.parse(cached);
                await showPlaylistLoaded(cachedIds.length, 'Loaded cached playlist');
                return cachedIds;
            }
            throw new Error('Could not load playlist');
        } finally {
            hideLoading();
        }
    }

    // Scrape the playlist page (first 100 videos), then page through the rest using the
    // watch page playlist panel, which lists ~200 videos around the requested index
    async function fetchPlaylistFromPage(playlistId, onProgress) {
        const html = await fetchViaProxy(`https://www.youtube.com/playlist?list=${playlistId}`);
        const ytData = extractYtInitialData(html);
        if (!ytData) throw new Error('ytInitialData not found (consent page or layout change?)');

        const videoIds = [];
        const seenIds = new Set();
        const addIds = ids => {
            let added = 0;
            ids.forEach(id => {
                if (!seenIds.has(id)) {
                    seenIds.add(id);
                    videoIds.push(id);
                    added++;
                }
            });
            return added;
        };

        const total = extractPlaylistTotal(ytData);
        const firstPage = extractPlaylistItems(ytData.contents);
        addIds(firstPage.videoIds);
        onProgress(videoIds.length, total);

        let hasMore = total ? videoIds.length < total : !!firstPage.continuation;
        let index = videoIds.length;
        for (let i = 0; hasMore && i < MAX_PLAYLIST_PAGES; i++) {
            let panel = null;
            const lastId = videoIds[videoIds.length - 1];
            for (let attempt = 0; attempt < 2 && !panel; attempt++) {
                try {
                    const watchHtml = await fetchViaProxy(
                        `https://www.youtube.com/watch?v=${lastId}&list=${playlistId}&index=${index}`);
                    panel = extractPlaylistPanel(extractYtInitialData(watchHtml));
                } catch (error) {
                    console.error('Failed to fetch more playlist videos:', error);
                }
            }
            // Keep what we have rather than failing the whole playlist
            if (!panel || addIds(panel.videoIds) === 0) break;
            onProgress(videoIds.length, total);
            // The panel reaches ~200 videos past the requested index; a shorter reach means
            // the end of the playlist (the total may include hidden unavailable videos)
            const reachedEnd = panel.lastIndex && panel.lastIndex - index < 190;
            index = panel.lastIndex || videoIds.length;
            hasMore = !reachedEnd && (!total || videoIds.length < total);
        }

        console.log(`Extracted ${videoIds.length}${total ? '/' + total : ''} videos from playlist`);
        return videoIds;
    }

    // Videos from the watch page playlist panel and the playlist index of the last one
    function extractPlaylistPanel(ytData) {
        const contents = ytData?.contents?.twoColumnWatchNextResults?.playlist?.playlist?.contents || [];
        const items = contents.map(item => item.playlistPanelVideoRenderer).filter(Boolean);
        const last = items[items.length - 1];
        return {
            videoIds: items.map(item => item.videoId),
            lastIndex: parseInt(last?.indexText?.simpleText, 10) || 0
        };
    }

    function extractYtInitialData(html) {
        const marker = 'var ytInitialData = ';
        const start = html.indexOf(marker);
        if (start === -1) return null;
        const end = html.indexOf(';</script>', start);
        try {
            return JSON.parse(html.slice(start + marker.length, end));
        } catch (e) {
            console.error('Failed to parse ytInitialData:', e);
            return null;
        }
    }

    // Collect only playlist entries (not recommendations) and the first continuation token
    // (the one continuing the video list; later ones belong to other page sections)
    function extractPlaylistItems(root) {
        const videoIds = [];
        let continuation = null;
        (function traverse(obj) {
            if (typeof obj !== 'object' || obj === null) return;
            const lockup = obj.lockupViewModel;
            if (lockup && lockup.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO' && lockup.contentId) {
                videoIds.push(lockup.contentId);
            }
            if (obj.playlistVideoRenderer && obj.playlistVideoRenderer.videoId) {
                videoIds.push(obj.playlistVideoRenderer.videoId);
            }
            if (!continuation && obj.continuationCommand && obj.continuationCommand.token) {
                continuation = obj.continuationCommand.token;
            }
            for (const key in obj) {
                traverse(obj[key]);
            }
        })(root);
        return { videoIds, continuation };
    }

    // Total video count from the playlist sidebar, e.g. "1.819 Videos" -> 1819
    function extractPlaylistTotal(ytData) {
        const stats = ytData.sidebar?.playlistSidebarRenderer?.items?.[0]
            ?.playlistSidebarPrimaryInfoRenderer?.stats?.[0];
        const text = stats?.runs?.[0]?.text || stats?.simpleText || '';
        return parseInt(text.replace(/\D/g, ''), 10) || 0;
    }

    // Fallback RSS method (returns only 15 videos)
    async function fetchPlaylistVideosRSS(playlistId) {
        const xmlText = await fetchViaProxy(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`);
        const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
        const entries = xmlDoc.getElementsByTagName('entry');

        const videoIds = [];
        for (let j = 0; j < entries.length; j++) {
            const videoId = entries[j].getElementsByTagName('yt:videoId')[0]?.textContent;
            if (videoId) {
                videoIds.push(videoId);
            }
        }

        console.log('RSS fallback extracted video IDs:', videoIds.length);
        return videoIds;
    }

    // Parse query parameters
    function parseQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const videoParam = params.get('v');
        return {
            videoId: videoParam ? videoParam.replace(/\+/g, ' ') : null,
            sleepTimer: params.get('sleep') || '0',
            loop: params.get('loop') === 'true',
            position: params.get('pos') || 'saved',
            edit: params.get('edit') === 'true',
            title: params.get('title') || ''
        };
    }

    // Update URL with parameters
    async function updateURL(params, includeEdit = false) {
        const url = new URL(window.location);
        
        url.searchParams.set('v', convertToVideoIds(params.videoId));
        url.searchParams.set('sleep', params.sleepTimer);
        url.searchParams.set('loop', params.loop);
        url.searchParams.set('pos', params.position);
        
        if (params.title && !isDefaultTitle(params.title)) {
            url.searchParams.set('title', params.title);
        } else {
            url.searchParams.delete('title');
        }

        if (includeEdit) {
            url.searchParams.set('edit', 'true');
        } else {
            url.searchParams.delete('edit');
        }

        window.history.pushState({}, '', url);
    }

    // Save position to localStorage
    function savePosition(videoId, position) {
        localStorage.setItem(`booktube_position_${videoId}`, position);
    }

    // Get saved position from localStorage
    function getSavedPosition(videoId) {
        return parseFloat(localStorage.getItem(`booktube_position_${videoId}`) || '0');
    }

    // Save playlist position
    function savePlaylistPosition(playlistKey, videoIndex, position) {
        const data = { videoIndex, position };
        localStorage.setItem(`booktube_playlist_${playlistKey}`, JSON.stringify(data));
    }

    // Get saved playlist position
    function getSavedPlaylistPosition(playlistKey) {
        const data = localStorage.getItem(`booktube_playlist_${playlistKey}`);
        return data ? JSON.parse(data) : { videoIndex: 0, position: 0 };
    }

    // Generate playlist key from video IDs
    function getPlaylistKey(videoIds) {
        return videoIds.join('_');
    }

    // Get random video index (true random, not shuffled)
    function getRandomVideoIndex(arrayLength, excludeIndex = -1) {
        if (arrayLength <= 1) return 0;
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * arrayLength);
        } while (randomIndex === excludeIndex && arrayLength > 1);
        return randomIndex;
    }

    // Format time for display
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Update sleep timer display
    function updateSleepTimerDisplay() {
        if (!sleepTimerEndTime) {
            sleepTimerOverlay.classList.remove('active');
            return;
        }

        const now = Date.now();
        const remainingMs = sleepTimerEndTime - now;

        if (remainingMs <= 0) {
            sleepTimerOverlay.classList.remove('active');
            clearInterval(sleepTimerInterval);
            return;
        }

        const remainingSeconds = Math.ceil(remainingMs / 1000);
        sleepTimerDisplay.textContent = formatTime(remainingSeconds);

        // Add warning class when less than 1 minute remaining
        if (remainingSeconds <= 60) {
            sleepTimerOverlay.classList.add('warning');
        } else {
            sleepTimerOverlay.classList.remove('warning');
        }
    }

    // Get random start time for video
    function getRandomStartTime(videoId, callback) {
        // Create a temporary player to get duration
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        const tempPlayer = new YT.Player(tempDiv, {
            videoId: videoId,
            events: {
                onReady: function(event) {
                    const duration = event.target.getDuration();
                    const randomTime = Math.floor(Math.random() * duration * 0.9); // Use 90% to avoid very end
                    tempPlayer.destroy();
                    document.body.removeChild(tempDiv);
                    callback(randomTime);
                }
            }
        });
    }

    // Switch to player screen
    window.showPlayerScreen = function() {
        console.log('Switching to player screen');
        mainScreen.style.display = 'none';
        mainScreen.classList.remove('active');
        playerScreen.style.display = 'block';
        playerScreen.classList.add('active');
    }

    // Switch to main screen
    window.showMainScreen = function() {
        console.log('Switching to main screen');
        
        // Stop player when switching to main screen
        if (player) {
            try {
                if (player.stopVideo) player.stopVideo();
                // Give time for video to stop before destroying
                setTimeout(() => {
                    if (player && player.destroy) player.destroy();
                    player = null;
                    // Clear player div after stopping
                    const playerDiv = document.getElementById('youtubePlayer');
                    if (playerDiv) {
                        playerDiv.innerHTML = '';
                    }
                }, 100);
            } catch (e) {
                player = null;
            }
        }
        
        playerScreen.classList.remove('active');
        playerScreen.style.display = 'none';
        favoritesScreen.classList.remove('active');
        mainScreen.classList.add('active');
        hideLoading();
    }

    // Switch to favorites screen
    function showFavoritesScreen() {
        console.log('Switching to favorites screen');
        console.log('favoritesScreen element:', favoritesScreen);
        console.log('Before - favoritesScreen classes:', favoritesScreen.className);
        mainScreen.classList.remove('active');
        playerScreen.classList.remove('active');
        favoritesScreen.classList.add('active');
        console.log('After - favoritesScreen classes:', favoritesScreen.className);
        console.log('favoritesScreen computed style:', window.getComputedStyle(favoritesScreen).display);
    }

    // Update page title
    function updatePageTitle(title) {
        const shown = title && !isDefaultTitle(title) ? title : DEFAULT_TITLE;
        document.title = `${BRAND.name} - ${shown}`;
    }

    // Load form values from params
    function loadFormFromParams(params) {
        if (params.videoId) {
            videoInput.value = params.videoId;
            sleepTimerSelect.value = params.sleepTimer;
            loopCheckbox.checked = params.loop;
            positionSelect.value = params.position;
            titleInput.value = params.title || '';
            updatePageTitle(params.title);
        }
    }

    // Create YouTube player
    window.createPlayer = function(videoId, startSeconds, params) {
        console.log('Creating player for video:', videoId, 'starting at', startSeconds);

        // Clear any existing player
        const playerDiv = document.getElementById('youtubePlayer');
        playerDiv.innerHTML = '';

        const playerVars = {
            autoplay: 1,
            start: Math.floor(startSeconds),
            modestbranding: 1,
            rel: 0,
            fs: 1
        };

        player = new YT.Player('youtubePlayer', {
            width: '100%',
            height: '100%',
            videoId: videoId,
            playerVars: playerVars,
            events: {
                onReady: function(event) {
                    window.onPlayerReady(event, params);
                },
                onStateChange: window.onPlayerStateChange
            }
        });
    }

    // Player ready handler
    window.onPlayerReady = function(event, params) {
        console.log('Player ready');
        event.target.playVideo();

        // Start position saving if not random or beginning
        if (params.position !== 'random' && params.position !== 'beginning') {
            positionSaveInterval = setInterval(() => {
                if (player && player.getCurrentTime) {
                    const currentTime = player.getCurrentTime();
                    const currentVideoId = currentPlaylist[currentVideoIndex];
                    savePosition(currentVideoId, currentTime);
                    
                    // Save playlist position if multiple videos (but not for shuffled playlists)
                    if (currentPlaylist.length > 1 && !isShuffledPlaylist) {
                        const playlistKey = getPlaylistKey(currentPlaylist);
                        savePlaylistPosition(playlistKey, currentVideoIndex, currentTime);
                    }
                }
            }, 5000); // Save every 5 seconds
        }
    }

    // Player state change handler
    window.onPlayerStateChange = function(event) {
        if (event.data === YT.PlayerState.ENDED) {
            const params = parseQueryParams();
            
            // Handle playlist progression
            if (currentPlaylist.length > 1) {
                if (isShuffledPlaylist) {
                    // True random: pick any video (including current one)
                    currentVideoIndex = getRandomVideoIndex(currentPlaylist.length);
                } else {
                    // Sequential: go to next video
                    currentVideoIndex++;
                    if (currentVideoIndex >= currentPlaylist.length) {
                        if (params.loop) {
                            currentVideoIndex = 0;
                        } else {
                            return; // End of playlist
                        }
                    }
                }
                
                const nextVideoId = currentPlaylist[currentVideoIndex];
                if (isShuffledPlaylist) {
                    const savedTime = getSavedPosition(nextVideoId);
                    player.loadVideoById(nextVideoId, savedTime);
                } else {
                    player.loadVideoById(nextVideoId);
                }
            } else if (params.loop) {
                player.seekTo(0);
                player.playVideo();
            }
        }
    }

    // Start player
    window.startPlayer = async function(params) {
        console.log('Starting player with params:', params);



        // Extract video IDs and set up playlist first (before switching screens)
        const videoIds = await extractVideoIds(params.videoId);
        if (videoIds.length === 0) {
            alert('No valid video IDs found');
            return;
        }

        // Now show the player screen after playlist is loaded
        window.showPlayerScreen();
        
        // Set up playlist (no pre-shuffling for random mode)
        currentPlaylist = videoIds;
        isShuffledPlaylist = params.position === 'shuffle';
        if (isShuffledPlaylist) {
            console.log('Random mode enabled for', currentPlaylist.length, 'videos');
        }
        currentVideoIndex = 0;

        // Update URL (remove edit mode when playing)
        await updateURL(params, false);

        // Set sleep timer
        if (params.sleepTimer !== '0') {
            const minutes = parseInt(params.sleepTimer);
            sleepTimerEndTime = Date.now() + (minutes * 60 * 1000);

            // Show sleep timer overlay
            sleepTimerOverlay.classList.add('active');
            updateSleepTimerDisplay();

            // Update display every second
            sleepTimerInterval = setInterval(updateSleepTimerDisplay, 1000);

            // Set timeout to pause video
            sleepTimerTimeout = setTimeout(() => {
                if (player && player.pauseVideo) {
                    player.pauseVideo();
                }
                sleepTimerOverlay.classList.remove('active');
                clearInterval(sleepTimerInterval);
            }, minutes * 60 * 1000);
        }

        // Determine start position and video index for playlist
        let startSeconds = 0;
        const actualVideoId = currentPlaylist[currentVideoIndex];
        
        if (params.position === 'saved') {
            if (currentPlaylist.length > 1) {
                const playlistKey = getPlaylistKey(currentPlaylist);
                const savedPlaylist = getSavedPlaylistPosition(playlistKey);
                currentVideoIndex = savedPlaylist.videoIndex;
                startSeconds = savedPlaylist.position;
            } else {
                startSeconds = getSavedPosition(actualVideoId);
            }
        } else if (params.position === 'shuffle') {
            // For shuffle mode, pick random video and start from saved position
            currentVideoIndex = getRandomVideoIndex(currentPlaylist.length);
            startSeconds = getSavedPosition(currentPlaylist[currentVideoIndex]);
        } else if (params.position === 'random' && currentPlaylist.length > 1) {
            currentVideoIndex = getRandomVideoIndex(currentPlaylist.length);
        }

        // Create player after screen transition
        setTimeout(() => {
            if (playerReady) {
                const videoToPlay = currentPlaylist[currentVideoIndex];
                if (params.position === 'random') {
                    // For random position, get duration first then create player
                    getRandomStartTime(videoToPlay, (randomTime) => {
                        window.createPlayer(videoToPlay, randomTime, params);
                    });
                } else {
                    window.createPlayer(videoToPlay, startSeconds, params);
                }
            } else {
                console.error('YouTube API not ready yet');
            }
        }, 100);
    }

    // Form submit handler
    playForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');

        const rawValue = videoInput.value.trim();
        // Normalize the input to IDs first: that is what gets shown, saved and put in the URL
        const inputValue = convertToVideoIds(rawValue) || rawValue;
        videoInput.value = inputValue;

        const params = {
            videoId: inputValue,
            sleepTimer: sleepTimerSelect.value,
            loop: loopCheckbox.checked,
            position: positionSelect.value,
            title: titleInput.value.trim()
        };

        // Save to favorites if checkbox is checked
        if (saveToFavoritesCheckbox.checked) {
            addToFavorites({
                v: params.videoId,
                sleep: params.sleepTimer,
                loop: params.loop,
                pos: params.position,
                title: params.title || 'ID: ' + params.videoId
            });
        }

        window.startPlayer(params);
    });

    // Back to main handler (edit mode)
    backToMain.addEventListener('click', async () => {
        console.log('Back to main clicked - entering edit mode');

        // Clear intervals and timeouts
        if (positionSaveInterval) {
            clearInterval(positionSaveInterval);
            positionSaveInterval = null;
        }
        if (sleepTimerTimeout) {
            clearTimeout(sleepTimerTimeout);
            sleepTimerTimeout = null;
        }
        if (sleepTimerInterval) {
            clearInterval(sleepTimerInterval);
            sleepTimerInterval = null;
        }

        // Clear sleep timer and hide overlay
        sleepTimerEndTime = null;
        sleepTimerOverlay.classList.remove('active', 'warning');

        // Player will be stopped in showMainScreen()

        // Update URL to include edit mode with current form values
        const currentParams = {
            videoId: videoInput.value.trim(),
            sleepTimer: sleepTimerSelect.value,
            loop: loopCheckbox.checked,
            position: positionSelect.value,
            title: titleInput.value.trim()
        };
        await updateURL(currentParams, true);

        // Switch screens
        window.showMainScreen();
        
        // Double-check player is cleared after screen switch
        setTimeout(() => {
            document.getElementById('youtubePlayer').innerHTML = '';
        }, 50);
    });

    // Favorites screen handlers
    if (favoritesIcon) {
        favoritesIcon.addEventListener('click', () => {
            console.log('Favorites icon clicked');
            renderFavorites();
            showFavoritesScreen();
        });
    } else {
        console.error('Favorites icon not found');
    }

    if (closeFavorites) {
        closeFavorites.addEventListener('click', () => {
            showMainScreen();
        });
    }

    if (backFromFavorites) {
        backFromFavorites.addEventListener('click', () => {
            showMainScreen();
        });
    }

    // Help modal handlers
    helpIcon.addEventListener('click', () => {
        helpModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // Escape key handler for closing modals and screens
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close help modal if open
            if (helpModal.style.display === 'block') {
                helpModal.style.display = 'none';
            }
            // Close favorites screen if active
            else if (favoritesScreen.classList.contains('active')) {
                showMainScreen();
            }
        }
    });

    // Export settings handler
    exportButton.addEventListener('click', (e) => {
        e.preventDefault();
        const data = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('booktube_')) {
                data[key] = localStorage.getItem(key);
            }
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notube-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import settings handler
    importButton.addEventListener('click', (e) => {
        e.preventDefault();
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    Object.keys(data).forEach(key => {
                        if (key.startsWith('booktube_')) {
                            localStorage.setItem(key, data[key]);
                        }
                    });
                    normalizeStoredFavorites();
                    // Presets the imported file never had still get copied in
                    seedPresetFavorites();
                    renderFavorites();
                    alert('Settings imported successfully!');
                    helpModal.style.display = 'none';
                } catch (error) {
                    alert('Invalid file format. Please select a valid NoTube settings file.');
                }
            };
            reader.readAsText(file);
        }
        e.target.value = '';
    });

    // Reset app data handler
    resetAppButton.addEventListener('click', () => {
        if (confirm('This will delete all saved playback positions and reset favorites to default. Are you sure?')) {
            // Clear all localStorage items that start with 'booktube_'
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('booktube_')) {
                    localStorage.removeItem(key);
                }
            });
            resetFavorites();
            alert('App data has been reset successfully!');
            helpModal.style.display = 'none';
        }
    });

    // YouTube API callback
    window.onYouTubeIframeAPIReady = async function() {
        console.log('YouTube API ready');
        playerReady = true;

        // Check if we should auto-start based on URL params
        const params = parseQueryParams();
        if (params.videoId) {
            // Load form values
            loadFormFromParams(params);

            // Only auto-play if not in edit mode
            if (!params.edit) {
                window.startPlayer(params);
            }
        }
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const params = parseQueryParams();
        if (params.videoId) {
            loadFormFromParams(params);
            if (!params.edit) {
                window.startPlayer(params);
            } else {
                window.showMainScreen();
            }
        } else {
            window.showMainScreen();
        }
    });

    // Title input real-time update
    titleInput.addEventListener('input', () => {
        updatePageTitle(titleInput.value.trim());
    });

    // Sleep timer reset functionality
    sleepTimerOverlay.addEventListener('click', (e) => {
        if (e.target === timerResetSelect) return; // Don't toggle when clicking select
        sleepTimerOverlay.classList.toggle('show-select');
    });

    timerResetSelect.addEventListener('change', (e) => {
        const newMinutes = parseInt(e.target.value);
        
        // Clear existing timer
        if (sleepTimerTimeout) {
            clearTimeout(sleepTimerTimeout);
        }
        
        // Set new timer
        sleepTimerEndTime = Date.now() + (newMinutes * 60 * 1000);
        
        // Set new timeout
        sleepTimerTimeout = setTimeout(() => {
            if (player && player.pauseVideo) {
                player.pauseVideo();
            }
            sleepTimerOverlay.classList.remove('active');
            clearInterval(sleepTimerInterval);
        }, newMinutes * 60 * 1000);
        
        // Hide select dropdown
        sleepTimerOverlay.classList.remove('show-select');
        
        // Update display immediately
        updateSleepTimerDisplay();
    });

    // Hide timer select when clicking outside
    document.addEventListener('click', (e) => {
        if (!sleepTimerOverlay.contains(e.target)) {
            sleepTimerOverlay.classList.remove('show-select');
        }
    });

    // Initial load - clean up favorites saved by older versions, copy in any presets this
    // browser has not seen yet, then check for edit mode
    normalizeStoredFavorites();
    seedPresetFavorites();
    const initialParams = parseQueryParams();
    if (initialParams.videoId && initialParams.edit) {
        loadFormFromParams(initialParams);
    } else if (initialParams.title) {
        updatePageTitle(initialParams.title);
    }
});
