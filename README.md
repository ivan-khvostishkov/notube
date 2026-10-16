# NoTube (aka BookTube) - Hands-Free YouTube Player

*YouTube without the feed.*

A lightweight web application for playing long-form YouTube content hands-free. Built for audiobooks and podcasts, and just as useful for lectures, language lessons, music albums and workout routines — anything you want to start with one tap and keep running: sleep timer, saved position, random start, loop and playlist shuffle.

- 📖 **BookTube** - https://booktube.nosocial.net - the original name and domain: book logo, red on black, starter favorites are the audiobooks. Support: booktube@nosocial.net
- ∞ **NoTube** - https://notube.nosocial.net - the same app under the other name: ∞ logo, blue on black, starter favorites are everything that is not a book - music, language lessons, workouts. Support: notube@nosocial.net

One deployment serves both - the brand comes from the hostname, and favorites, saved positions and shared links work the same on either.

**Author:** Ivan Khvostishkov & NoSocial.Net

## 📱 Hands-Free on iPhone

The best part of using this on a phone: once playback starts, you can put the phone away and
keep listening. In Safari on iOS:

1. Enter a video, a playlist or pick a favorite, and press **Play**
2. Tap the **full-screen** button in the player
3. **Swipe up** to the Home screen - the video keeps playing in a floating Picture in Picture window
4. Carry on with other apps, or **lock the screen** - the audio continues, with play and pause
   on the lock screen

That is what turns it into an audiobook and music player: a full-length book or album runs for
hours in the background, the sleep timer still pauses it on time, and your position is saved
for the next session. The exact gestures depend on your iOS and Safari version - if playback
stops when you leave the page, start Picture in Picture from the full-screen player first.

## Features

- 🎵 **YouTube Integration** - Play any YouTube video by ID or URL
- ⏱️ **Sleep Timer** - Set timers from 15 minutes to 3 hours with visual countdown
- 🔁 **Loop Playback** - Automatically restart videos when they end
- 📍 **Position Memory** - Resume from where you left off
- 🎲 **Random Start** - Begin playback from a random position
- 🔖 **Bookmarkable URLs** - Save and share your playback settings
- 📝 **Custom Titles** - Set personalized titles for anything you play
- 📋 **Playlist Support** - Play YouTube playlists or multiple videos in sequence
- 🔀 **Playlist Shuffling** - Randomize the order of videos in playlists
- ❤️ **Favorites List** - Save and manage your favorite books, lessons and routines with quick access
- 📤 **Export/Import** - Backup and restore your favorites and app data
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🌙 **Dark Theme** - Easy on the eyes for nighttime listening, in red on black as BookTube or blue on black as NoTube
- 💙 **Sponsor Button** - Support development from the About box or on [GitHub Sponsors](https://github.com/sponsors/ivan-khvostishkov)

## Usage

Some samples to start with:

* [The Bhagavad Gita, The Lord's Song](https://booktube.nosocial.net/?v=IIEJNUO1BoQ&sleep=15&loop=false&pos=saved&title=The+Bhagavad+Gita%2C+The+Lord%27s+Song&edit=true)
* [The Stories of Mahabharata](https://booktube.nosocial.net/?v=PLAQ6vzFKj_1uqRv3OCX-Elexz9C8vfENs&sleep=30&loop=false&pos=saved&title=The+Stories+of+Mahabharata&edit=true)
* [Siddhartha by Hermann Hesse](https://booktube.nosocial.net/?v=vS4ble0Uznk&sleep=30&loop=false&pos=saved&title=Siddhartha+By+Hermann+Hesse&edit=true)
* [The Master and Margarita by Mikhail Bulgakov](https://booktube.nosocial.net/?v=PL-lY2fdb59Of61NGdOmXUagd0f1B_RUXC&sleep=30&loop=false&pos=saved&title=The+Master+and+Margarita+by+Mikhail+Bulgakov&edit=true)
* [Home Exercise Guide: Abs](https://notube.nosocial.net/?v=PLG9bZb7LskJM&sleep=0&loop=true&pos=random&title=Home+Exercise+Guide%3A+Abs&edit=true) - a workout playlist on endless random repeat
* [Default Music for Generic People (rmnz)](https://notube.nosocial.net/?v=OLAK5uy_kZPrWNRLjJnjHMA31GyiFwmphn_4a-rE0&sleep=0&loop=true&pos=saved&title=Default+Music+for+Generic+People+%28rmnz%29&edit=true) - an album looping indefinitely, no sleep timer

The full collection is the favorites ❤️ list inside the app: audiobooks on [BookTube](https://booktube.nosocial.net), music, lessons and workouts on [NoTube](https://notube.nosocial.net).

## Use Cases

- 📚 **Audiobooks**: Listening to full-length books on YouTube
- 🎙️ **Podcasts**: Long podcast episodes with position memory
- 📖 **Educational Content**: Lectures, courses, and tutorials
- 🛌 **Sleep Stories**: Bedtime content with automatic shutoff
- 🗣️ **Language Learning**: Perfect for learning foreign language phrases - see more at [Language Learning Tips](#language-learning-tips)
    - Works for video lessons too, not only audio: phrase collections with on-screen text and translations play hands-free the same way
    - Use random position to hear different phrases each session
    - Set a 15-30 minute timer for daily practice
    - Loop feature helps with repetition and memorization
    - No specific order means uniform exposure to all material
- 🏋️ **Workouts & Training**: Exercise playlists on random position with loop enabled, so a different routine starts on every tap and keeps going without touching the screen
- 🎵 **Music Albums**: Album playlists (`OLAK5uy_...`) with loop for continuous background listening
- 🚗 **Road Trips**: Entertainment for long drives (passenger use only!)

### Basic Playback

0. Navigate to https://notube.nosocial.net/ or https://booktube.nosocial.net/

1. Enter a YouTube video ID, full URL, or playlist ID in the input field — on Play the field is normalized to plain video IDs
2. Optionally set a custom title for what you are playing
3. For playlists, use a YouTube playlist ID (PLxxx, OLAK5xxx album, RDxxx mix) or add multiple video IDs separated by spaces
4. Select your desired settings:
    - **Sleep Timer**: Choose when to automatically pause playback
    - **Loop**: Enable to replay the video indefinitely
    - **Position**: Start from beginning (no position saving), last saved position (default), or random (no position saving)
    - **Save to favorites**: Automatically enabled to save your configuration for quick access later
5. Click the Play button

### Favorites Management

- **Access Favorites**: Click the heart icon (❤️) in the top-right corner to view your favorites list
- **Quick Play**: Click any favorite item to instantly load its settings into the form
- **Presets**: The app ships with a starter collection. Each preset is copied into your own list the first time you open the app, so the list you see is exactly the list that is stored and exported. Presets added in a later release are copied in on your next visit
- **Remove Items**: Click the × button next to any favorite to remove it from your list — presets included, and a removed preset is not copied back
- **Auto-Save**: Anything you play is automatically saved to favorites when the "Save to favorites" checkbox is checked (enabled by default); replaying something already saved updates that entry instead of adding a duplicate
- **Export Data**: Use the "Export App Data" button in the help modal to download your favorites and playback positions as a JSON file
- **Import Data**: Use the "Import App Data" button to restore favorites and positions from a previously exported JSON file
- **Reset**: Use the "Reset App Data" button in the help modal to clear your list and copy the presets in again
- **Presets Per Brand**: BookTube starts you with the audiobooks, NoTube with the music, lessons and workouts. Anything you save yourself shows up on whichever domain you saved it

### URL Parameters

NoTube supports URL parameters for bookmarking and sharing:

```
?v=VIDEO_ID_OR_PLAYLIST&title=CUSTOM_TITLE&sleep=MINUTES&loop=true/false&pos=beginning/saved/random/shuffle&edit=true/false
```

**Note**: Position defaults to 'saved'. Use 'beginning' or 'random' for no position saving. Use 'shuffle' to play a playlist in random order.

Examples:
- Auto-play with custom title (30-minute timer): `?v=vS4ble0Uznk&title=My%20Audiobook&sleep=30`
- YouTube playlist: `?v=PL-lY2fdb59Of61NGdOmXUagd0f1B_RUXC`
- Shuffled playlist: `?v=PLAQ6vzFKj_1uqRv3OCX-Elexz9C8vfENs&pos=shuffle`
- Multiple videos (played in sequence): `?v=NSfkgr5TTYM+yPnhdK9touU+YjvTqHfFqEc`
- Indefinite loop - a music album that restarts when it ends: `?v=OLAK5uy_kZPrWNRLjJnjHMA31GyiFwmphn_4a-rE0&loop=true&pos=saved`
- Random position - a workout playlist starting at a random video and a random point in it, looping forever: `?v=PLG9bZb7LskJM&pos=random&loop=true&sleep=0`
- Open in edit mode: `?v=vS4ble0Uznk&sleep=60&edit=true`

### Edit Mode

When playing a video, click the NoTube logo to return to the configuration screen. The URL will preserve all your settings with `edit=true`, allowing you to:
- Modify settings before replaying
- Share a pre-configured link that doesn't auto-play
- Create bookmark collections with different settings
- Save modified configurations to your favorites list

### Sleep Timer

When active, the remaining time appears in the top-right corner:
- Fixed-width display for easy reading
- Turns red and pulses when less than 1 minute remains
- Automatically pauses playback when timer expires

## Keyboard Shortcuts

The player uses standard YouTube keyboard shortcuts:
- `Space`: Play/Pause
- `←/→`: Seek backward/forward
- `↑/↓`: Volume up/down
- `F`: Fullscreen
- `M`: Mute/Unmute

## Browser Compatibility

NoTube works best on:
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Requires JavaScript and YouTube IFrame API access.

## Privacy

NoTube is a client-side application that:
- Stores playback positions and favorites locally in your browser
- Doesn't collect or transmit any personal data
- Only connects to YouTube for video playback
- All favorites and settings remain on your device

## Technical Details

- **No Backend Required**: Runs entirely in the browser
- **Local Storage**: Saves playback positions per video and favorites list
- **YouTube IFrame API**: Official YouTube player integration, also used to resolve playlist contents without a proxy or API key (up to 200 videos; longer playlists fall back to page scraping through a CORS proxy)
- **Responsive CSS**: Adapts to any screen size
- **URL State Management**: All settings preserved in URL
- **Favorites Management**: Persistent local storage with default curated collection



## Language Learning Tips

NoTube is especially useful for language learners using YouTube phrase collections:

1. **Daily Random Practice**: Set position to "random" and timer to 15-20 minutes for daily exposure to different phrases
2. **Spaced Repetition**: The random feature naturally creates spaced repetition as you'll hear phrases at different intervals
3. **Passive Learning**: Use while commuting, exercising, or doing chores
4. **Sleep Learning**: Set a 30-45 minute timer to listen while falling asleep
5. **Bookmarkable Progress**: Create different URLs for different difficulty levels or topics

Example setup for language learning:
```
?v=PHRASE_VIDEO_ID&sleep=20&loop=true&pos=random
```

Sample YouTube videos for German language from the [German Hands-Free Trainer](https://github.com/ivan-khvostishkov/german-a1-trainer) project - all three are NoTube presets, on random position with an indefinite loop and a one-hour timer:

* German A1 (Start Deutsch 1): https://notube.nosocial.net/?v=tSCrnPUt-pU&sleep=60&loop=true&pos=random&edit=true
* German A2: https://notube.nosocial.net/?v=esvhhEGLTNA&sleep=60&loop=true&pos=random&edit=true
* German B1 (three parts, played in random order): https://notube.nosocial.net/?v=wNoTY_TZvqI+UBcIZf76mIs+JYDI_HhWIgs&sleep=60&loop=true&pos=random&edit=true

## Troubleshooting

**Video won't play:**
- Check if the video is available in your region
- Ensure the video ID is correct
- Try refreshing the page

**Position not saving:**
- Enable cookies/local storage in your browser
- Note: Random position mode doesn't save progress

**Sleep timer not visible:**
- Only appears when a timer is active
- Check top-right corner of the player

## License

Copyright © 2013-2025 NoSocial.Net

For support, contact: booktube@nosocial.net

## Acknowledgments

- Font Awesome for icons
- YouTube for the IFrame Player API
- All audiobook, lesson and workout creators on YouTube

---

Enjoy your listening! 📚🎧
