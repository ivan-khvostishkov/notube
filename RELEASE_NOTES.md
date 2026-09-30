# BookTube Release Notes

## Version 1.4 - September 2026

### 📋 Playlist Loading
- **Loading Progress** - Playlist loading shows how many videos are loaded, e.g. "Loading playlist... 100/254"
- **YouTube Data API Support** - Set `YOUTUBE_API_KEY` in `booktube.js` to load playlists directly from the official API (fast, no CORS proxies)
- **Full Playlist Pagination** - Playlists larger than 100 videos are loaded completely via continuation tokens

### 🐛 Bug Fixes
- Adapted playlist parsing to YouTube's new page layout (`lockupViewModel`)
- Recommended videos no longer leak into loaded playlists
- Requests time out after 10 seconds instead of hanging on unresponsive proxies
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