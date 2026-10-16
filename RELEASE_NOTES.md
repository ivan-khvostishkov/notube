# NoTube Release Notes

## Version 2.0 - October 2026

### 📋 Playlist Loading
- **Playlists Load Without a Proxy** - The embedded player itself reports the playlist contents, so loading no longer depends on r.jina.ai or the other CORS proxies being up
- **Auto-Generated Playlists** - Album (`OLAK5uy_...`) and mix (`RD...`) playlists load now; they have no RSS feed and previously failed with "0/0" and "No valid video IDs found"
- **Shared Playlist Links** - A link with a non-`PL` playlist ID in `?v=` plays instead of reporting no valid video IDs
- **Long Playlists** - Playlists over 200 videos (the embedded player's limit) still load in full via page scraping

### ❤️ Favorites
- **Presets Are Part of Your List** - Each preset is copied into the stored favorites list the first time it is seen, so the list on screen is exactly the list that is stored and exported. Exporting on a fresh browser no longer produces an empty `{}` while 18 favorites are on screen
- **Presets Can Be Removed** - The × button now works on presets too, and a removed preset stays removed; "Cannot remove default favorites" is gone
- **Presets Still Ship With Releases** - A preset added in a later release is copied into existing users' lists on their next visit, tracked per preset in `booktube_seeded_presets`
- **Normalized Input** - Pressing Play rewrites the input field to plain video IDs; that normalized form is what gets saved to favorites and put in the URL, so no more `https://m.youtube.com/...` entries
- **No Duplicates** - Saving a video that is already in favorites updates that entry instead of adding a second one, whichever form (URL or ID) it was saved in
- **Legacy Cleanup** - Favorites saved as URLs by older versions are normalized and de-duplicated on load, and when opened for editing
- **Overridden Defaults** - A default favorite that has been re-saved with your own settings appears once in the list

### 🏷️ Two Names, One App
- **NoTube** - The app is now also **NoTube** - "YouTube without the feed" - matching what it is used for beyond books: ∞ logo, blue on black, and starter favorites made of music, language lessons and workouts
- **BookTube Stays** - booktube.nosocial.net keeps the name, the book logo, the red on black palette and the audiobook starter favorites. The brand is picked from the hostname, so one deployment serves both
- **Both Addresses** - booktube@nosocial.net on BookTube, notube@nosocial.net on NoTube
- **Nothing to Migrate** - Same storage, same favorites, same saved positions, same shared links. Exported data files are now named `notube-settings-<date>.json`, and older `booktube-settings-*.json` files still import

### 💙 Support
- **Sponsor Button** - In the About box, and a Sponsor button on the GitHub repository

### 📱 About Box
- Opens near the top of the screen instead of a third of the way down, and fits a phone screen without scrolling; the long description was trimmed and the links moved into one compact line
- Shows the app version

### 📚 Content
- **Beyond Audiobooks** - App description now covers what it is actually used for: audiobooks and podcasts, lectures, language video lessons (with on-screen text and translations), music albums and workout routines. Default title placeholder changed from "YouTube Audiobook Player" to "Hands-Free YouTube Player"; links still carrying the old one keep working
- Added to the default favorites: Suetonius' The Lives of the Caesars (Classics in Audiobook) on BookTube; Default Music for Generic People (rmnz, looping indefinitely), Home Exercise Guide: Abs and the German A1/A2/B1 Hands-Free Trainers (random position, indefinite loop, one-hour timer) on NoTube
- README examples now show an indefinite loop (music album) and random position (workout playlist)
- Removed Books.md: the selected books are the favorites list inside the app
- **Hands-Free on iPhone** - README now opens with the iOS flow that makes the app useful on a phone: play, full screen, swipe up to Picture in Picture, then keep using the phone or lock the screen while playback continues

### 🐛 Bug Fixes
- `youtube.com/shorts/...` and `youtube.com/live/...` URLs are recognized as video IDs
- Input label corrected to "YouTube Video IDs or URL"

---

## Version 1.4 - September 2026

### 📋 Playlist Loading
- **Loading Progress** - Playlist loading shows how many videos are loaded, starting at "Loading playlist... 0/0" and updating after every page; the final count stays visible for 2 seconds before playback starts
- **Working CORS Proxy** - Playlists load through r.jina.ai; the previous free proxies (corsproxy.io, cors-anywhere) no longer work without an API key
- **Full Playlist Pagination** - Playlists larger than 100 videos are loaded completely via the watch page playlist panel (~200 videos per request)

### 🐛 Bug Fixes
- Adapted playlist parsing to YouTube's new page layout (`lockupViewModel`)
- Recommended videos no longer leak into loaded playlists
- Requests time out after 20 seconds instead of hanging on unresponsive proxies; failed pages are retried once
- Last successfully loaded playlist is cached and reused when loading fails

### 📚 Content
- Removed unavailable books from the default favorites and Books.md: The Glass Bead Game, The Epic Of Gilgamesh, One Hundred Years of Solitude, Дзэн и искусство ухода за мотоциклом
- Fixed URL parameter examples in README (`pos=shuffle` instead of the unsupported `shuffle=true`, real video IDs)

---

## Version 1.3 - November 2025

### ❤️ Major Features
- **Favorites Management** - Save and manage your favorite audiobooks with quick access
- **Export/Import Data** - Backup and restore your favorites and app data as JSON files
- **Auto-Save to Favorites** - New audiobooks automatically saved to favorites (enabled by default)
- **Quick Play from Favorites** - One-click loading of saved configurations

### 🔧 Improvements
- **Favorites UI** - Heart icon (❤️) in top-right corner for easy access to favorites list
- **Data Persistence** - Enhanced local storage for favorites and playback positions
- **Default Favorites Collection** - Curated starter collection of quality audiobooks
- **Favorites Management** - Remove items with × button, export/import functionality

### 📚 Content & Documentation
- **Favorites Management Section** - Comprehensive guide for using the new favorites system
- **Enhanced Privacy Section** - Updated to reflect favorites storage and data handling
- **Technical Details Updates** - Added favorites management and persistent storage information

### 🐛 Bug Fixes
- Improved local storage reliability for favorites and positions
- Enhanced data export/import validation
- Better error handling for favorites operations

### 🎯 Technical Enhancements
- Persistent favorites storage with JSON export/import
- Enhanced local storage management
- Improved data backup and restore functionality
- Auto-save checkbox integration with favorites system

### Key Features
- Heart icon (❤️) for favorites access
- "Save to favorites" checkbox (auto-enabled)
- Export/Import App Data buttons in help modal
- Reset App Data functionality
- Quick play from favorites list

---

This release transforms BookTube into a personal audiobook library with persistent favorites management and data portability.

## Version 1.2 - September 2025

### 🎵 Major Features
- **Playlist Support** - Full YouTube playlist integration with automatic video loading
- **Playlist Shuffling** - Randomize playlist order for varied listening experience  
- **Enhanced Random Playback** - Improved randomization logic with increased limits

### 🔧 Improvements
- **TV Screen Optimization** - Better display fitting for large screens and TV viewing
- **Faster Playlist Loading** - Optimized fetching with multiple proxy fallbacks
- **Clean URLs** - Improved URL handling and formatting
- **App Data Management** - Added reset button to clear stored app data

### 📚 Content Updates
- **Expanded Book Collection** - Added new audiobook examples and curated selections
- **BookTube Selected Books** - New dedicated books catalog (Books.md)
- **Enhanced Documentation** - Updated README with playlist features and usage examples

### 🐛 Bug Fixes
- Fixed playlist loading issues with multiple proxy support
- Improved playlist ID preservation during shuffling
- Enhanced playlist fetching reliability
- Better error handling for playlist operations

### 🎯 Technical Enhancements
- Optimized playlist video extraction algorithms
- Added comprehensive logging for playlist operations
- Improved rate limiting for API requests
- Enhanced playlist shuffling algorithms

### Key URLs & Examples
- Main app: https://booktube.nosocial.net
- Playlist support: `?v=PLxxx&shuffle=true&loop=true`
- Multiple videos: `?v=video1 video2 video3&loop=true`

---

This release significantly expands BookTube's capabilities for handling YouTube playlists and provides a more robust, TV-friendly audiobook listening experience.