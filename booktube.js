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
        alert('Supports video IDs, URLs, playlist IDs (PLxxx), space-separated');
    });

    // Default favorites list
    const defaultFavorites = [
        { v: 'NSfkgr5TTYM yPnhdK9touU YjvTqHfFqEc', sleep: '20', loop: false, pos: 'saved', title: 'Сумма технологии. Станислав Лем' },
        { v: 'zHtvJj5bgoo', sleep: '45', loop: false, pos: 'saved', title: 'The Aeneid by Virgil' },
        { v: 'PLQ7iliSaUiA_KHmGhRd4HpuuPM37UGSE_', sleep: '20', loop: false, pos: 'saved', title: 'История. Геродот' },
        { v: 'gKg0W5Un0PI', sleep: '20', loop: false, pos: 'saved', title: 'Дао дэ цзин. Лао-цзы' },
        { v: 'PLjPg58THfX_yQrAgXoShepHoDLtOVeKWh', sleep: '20', loop: false, pos: 'saved', title: 'Махабхарата' },
        { v: 'ZQwrt4R4XDw', sleep: '20', loop: false, pos: 'saved', title: 'Колыбель для кошки. Курт Воннегут' },
        { v: 'IIEJNUO1BoQ', sleep: '15', loop: false, pos: 'saved', title: 'The Bhagavad Gita, The Lord\'s Song' },
        { v: 'vS4ble0Uznk', sleep: '20', loop: false, pos: 'saved', title: 'Siddhartha By Hermann Hesse' },
        { v: 'PL-lY2fdb59Of61NGdOmXUagd0f1B_RUXC', sleep: '20', loop: false, pos: 'saved', title: 'The Master and Margarita by Mikhail Bulgakov' },
        { v: '-H3IjANl0V4 BR0k8I8i28U', sleep: '30', loop: false, pos: 'saved', title: 'Наши за границей. Николай Лейкин (Gennady Anatolievich)' },
        { v: 'PL5E0m9KbufwZlALCgXRHyoE99VeORMmzr', sleep: '30', loop: false, pos: 'random', title: 'Тысяча и одна ночь. Сказки' },
        { v: 'nwRoHC83wx0', sleep: '45', loop: true, pos: 'random', title: 'Gayatri Mantra – Rig Veda 3.62.10' },
        { v: 'PLAQ6vzFKj_1uqRv3OCX-Elexz9C8vfENs', sleep: '20', loop: false, pos: 'shuffle', title: 'The Stories of Mahabharata' },
        { v: 'PLb-JKoHS0AMAJ1gApOJOxuZoLsGZPLWqc', sleep: '30', loop: false, pos: 'shuffle', title: '"Модель для сборки". Радиопрограмма' },
        { v: 'PLTMnNOWf9hrpvVf_1JksytDPOmjh0JJpE', sleep: '30', loop: false, pos: 'shuffle', title: 'Сборник аудиокниг (Gennady Anatolievich)' }
    ];

    // Favorites management
    function getFavorites() {
        const stored = localStorage.getItem('booktube_favorites');
        const userFavorites = stored ? JSON.parse(stored) : [];
        // Return user favorites first, then default favorites
        return [...userFavorites, ...defaultFavorites];
    }

    function saveFavorites(userFavorites) {
        localStorage.setItem('booktube_favorites', JSON.stringify(userFavorites));
    }

    function addToFavorites(item) {
        const userFavorites = JSON.parse(localStorage.getItem('booktube_favorites') || '[]');
        const allFavorites = [...userFavorites, ...defaultFavorites];
        
        // Check if item already exists in user favorites
        const userIndex = userFavorites.findIndex(fav => fav.v === item.v && fav.title === item.title);
        const defaultIndex = defaultFavorites.findIndex(fav => fav.v === item.v && fav.title === item.title);
        
        if (userIndex !== -1) {
            // Update existing user favorite with new settings
            userFavorites[userIndex] = item;
        } else if (defaultIndex !== -1) {
            // Item exists in defaults, add updated version to user favorites
            userFavorites.unshift(item);
        } else {
            // Completely new item, add to beginning
            userFavorites.unshift(item);
        }
        
        saveFavorites(userFavorites);
    }

    function removeFromFavorites(index) {
        const userFavorites = JSON.parse(localStorage.getItem('booktube_favorites') || '[]');
        const allFavorites = [...userFavorites, ...defaultFavorites];
        
        if (index < userFavorites.length) {
            // Removing from user favorites
            userFavorites.splice(index, 1);
            saveFavorites(userFavorites);
        } else {
            // Trying to remove from default favorites - not allowed
            alert('Cannot remove default favorites. Only custom favorites can be removed.');
            return;
        }
        renderFavorites();
    }

    function resetFavorites() {
        localStorage.removeItem('booktube_favorites'); // Clear user favorites
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
                // Convert + back to spaces for the form input
                videoInput.value = fav.v.replace(/\+/g, ' ');
                sleepTimerSelect.value = fav.sleep;
                loopCheckbox.checked = fav.loop;
                positionSelect.value = fav.pos;
                titleInput.value = fav.title;
                updatePageTitle(fav.title);
                
                // Update URL with the selected favorite's parameters
                const params = {
                    videoId: fav.v.replace(/\+/g, ' '),
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

    // Extract video IDs from input (supports multiple IDs and playlist IDs)
    async function extractVideoIds(input) {
        console.log('Extracting video IDs from input:', input);
        const ids = input.trim().split(/\s+/);
        const videoRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const playlistRegex = /(?:youtube\.com\/.*[?&]list=|youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)/;
        
        const results = [];
        
        for (const id of ids) {
            console.log('Processing ID:', id);
            // Check if it's a playlist ID or URL
            const playlistMatch = id.match(playlistRegex);
            if (playlistMatch || (id.length > 11 && id.startsWith('PL'))) {
                const playlistId = playlistMatch ? playlistMatch[1] : id;
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
        const videoRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const playlistRegex = /(?:youtube\.com\/.*[?&]list=|youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)/;
        
        const results = [];
        
        for (const id of ids) {
            console.log('Processing id:', id, 'length:', id.length);
            // Check if it's a playlist ID or URL
            const playlistMatch = id.match(playlistRegex);
            if (playlistMatch || (id.length > 11 && id.startsWith('PL'))) {
                const playlistId = playlistMatch ? playlistMatch[1] : id;
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
    
    // YouTube Data API v3 key (https://console.cloud.google.com/apis/credentials).
    // Restrict it to the booktube.nosocial.net HTTP referrer. When set, playlists are
    // loaded directly from the official API (fast, CORS-enabled, no proxies needed).
    const YOUTUBE_API_KEY = '';

    // CORS proxies used as a fallback when no API key is configured
    const proxyServices = [
        'https://corsproxy.io/?url=',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
    ];
    const FETCH_TIMEOUT_MS = 10000;
    const MAX_PLAYLIST_PAGES = 100;
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

    function showPlaylistProgress(loaded, total) {
        showLoading(total ? `Loading playlist... ${loaded}/${total}` : `Loading playlist... ${loaded}`);
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
    async function fetchViaProxy(url, options = {}) {
        let lastError;
        for (let n = 0; n < proxyServices.length; n++) {
            const i = (preferredProxyIndex + n) % proxyServices.length;
            try {
                const response = await fetchWithTimeout(proxyServices[i] + encodeURIComponent(url), options);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const text = await response.text();
                preferredProxyIndex = i;
                return text;
            } catch (error) {
                console.warn(`Proxy ${proxyServices[i]} failed:`, error.message);
                lastError = error;
            }
        }
        throw lastError || new Error('All proxies failed');
    }

    // Fetch all video IDs of a YouTube playlist, reporting progress as it goes
    async function fetchPlaylistVideos(playlistId) {
        console.log('Fetching playlist videos for ID:', playlistId);
        showLoading();
        try {
            let videoIds = [];
            if (YOUTUBE_API_KEY) {
                try {
                    videoIds = await fetchPlaylistFromApi(playlistId, showPlaylistProgress);
                } catch (error) {
                    console.error('YouTube Data API failed:', error);
                }
            }
            if (videoIds.length === 0) {
                try {
                    videoIds = await fetchPlaylistFromPage(playlistId, showPlaylistProgress);
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
                return videoIds;
            }

            // Network failed everywhere: reuse the last successfully loaded list
            const cached = localStorage.getItem(`booktube_playlist_cache_${playlistId}`);
            if (cached) {
                console.log('Using cached playlist');
                return JSON.parse(cached);
            }
            throw new Error('Could not load playlist');
        } finally {
            hideLoading();
        }
    }

    // Official YouTube Data API: 50 items per request, total count known upfront
    async function fetchPlaylistFromApi(playlistId, onProgress) {
        const videoIds = [];
        let pageToken = '';
        let total = 0;
        do {
            const url = 'https://www.googleapis.com/youtube/v3/playlistItems' +
                `?part=contentDetails&maxResults=50&playlistId=${encodeURIComponent(playlistId)}` +
                `&key=${YOUTUBE_API_KEY}` + (pageToken ? `&pageToken=${pageToken}` : '');
            const response = await fetchWithTimeout(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            total = data.pageInfo?.totalResults || total;
            data.items.forEach(item => videoIds.push(item.contentDetails.videoId));
            onProgress(videoIds.length, total);
            pageToken = data.nextPageToken;
        } while (pageToken);
        return videoIds;
    }

    // Scrape the playlist page (first ~100 videos), then follow continuation tokens
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
        let page = extractPlaylistItems(ytData.contents);
        addIds(page.videoIds);
        onProgress(videoIds.length, total);

        const clientVersion = (html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/) || [])[1] || '2.20250101.00.00';
        for (let i = 0; page.continuation && i < MAX_PLAYLIST_PAGES; i++) {
            if (total && videoIds.length >= total) break;
            try {
                const json = await fetchViaProxy('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        context: { client: { clientName: 'WEB', clientVersion } },
                        continuation: page.continuation
                    })
                });
                page = extractPlaylistItems(JSON.parse(json).onResponseReceivedActions);
            } catch (error) {
                // Keep what we have rather than failing the whole playlist
                console.error('Failed to fetch playlist continuation:', error);
                break;
            }
            if (addIds(page.videoIds) === 0) break;
            onProgress(videoIds.length, total);
        }

        console.log(`Extracted ${videoIds.length}${total ? '/' + total : ''} videos from playlist page`);
        return videoIds;
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
        
        if (params.title && params.title !== 'YouTube Audiobook Player') {
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
        document.title = title && title !== 'YouTube Audiobook Player' ? `BookTube - ${title}` : 'BookTube - YouTube Audiobook Player';
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

        const inputValue = videoInput.value.trim();
        
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
        a.download = `booktube-settings-${new Date().toISOString().split('T')[0]}.json`;
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
                    renderFavorites();
                    alert('Settings imported successfully!');
                    helpModal.style.display = 'none';
                } catch (error) {
                    alert('Invalid file format. Please select a valid BookTube settings file.');
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

    // Initial load - check if we're in edit mode
    const initialParams = parseQueryParams();
    if (initialParams.videoId && initialParams.edit) {
        loadFormFromParams(initialParams);
    } else if (initialParams.title) {
        updatePageTitle(initialParams.title);
    }
});
