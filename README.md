# Spotify Media Player 🎶

A sleek, web-based music player inspired by Spotify, allowing you to browse, play, and manage your music collection with ease. 🎧✨

## Features 🌟
- **Responsive Design** 📱: Adapts to different screen sizes for a consistent user experience.
- **Playlist Management** 🎼: View and manage your music library and playlists.
- **Audio Controls** 🎛️: Play, pause, next, previous, and volume control functionalities.
- **Interactive UI** ✨: Dynamic user interface with hover effects and animations.
- **Song Metadata** 📝: Displays song information and album covers.
- **Seekbar and Volume Control** 🔊: Navigate through songs and adjust the volume easily.
- **GitHub Pages Compatible** 🌐: Now works perfectly with GitHub Pages hosting!

## Technologies Used 💻
- **HTML5** 📝: Structuring the web pages.
- **CSS3** 🎨: Styling and responsive design.  
- **JavaScript** ⚙️: Interactivity and audio control.
- **Static JSON Catalog** 📊: Song catalog system for GitHub Pages compatibility.

## GitHub Pages Hosting Fix 🔧
This project has been updated to work with GitHub Pages hosting. The main changes include:
- Replaced dynamic directory listing with a static `songs-catalog.json` file
- Fixed all absolute paths to use relative paths
- Removed dependency on Apache `.htaccess` files

## Adding New Songs and Albums �
To add new songs and albums:

1. **Create a new folder** in the `songs/` directory (e.g., `songs/rock/`)
2. **Add your songs** (.mp3 files) to the folder
3. **Add a cover image** named `cover.jpg` to the folder
4. **Create an `info.json`** file in the folder with album metadata:
   ```json
   {
     "title": "Rock Classics",
     "description": "Best rock songs of all time"
   }
   ```
5. **Update `songs-catalog.json`** to include your new album:
   ```json
   {
     "albums": [
       {
         "folder": "fav",
         "title": "Favourite",
         "description": "Your favourite playlists! ~ Delusion.",
         "cover": "songs/fav/cover.jpg",
         "songs": ["I Love You.mp3", "Jannatein Kahan.mp3", "Mat Aazma Re.mp3", "Mere Mehboob Qayamat Hogi.mp3"]
       },
       {
         "folder": "rock",
         "title": "Rock Classics", 
         "description": "Best rock songs of all time",
         "cover": "songs/rock/cover.jpg",
         "songs": ["Song1.mp3", "Song2.mp3", "Song3.mp3"]
       }
     ]
   }
   ```## Getting Started 🚀
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/spotify-media-player.git
   cd spotify-media-player
   ```
2. **Open the Project**:
   Open `index.html` in your favorite web browser to view and interact with the media player.

## Usage 🎵
- **Navigation**: Use the sidebar to browse through playlists and songs.
- **Playback Control**: Click on songs to play them. Use the playback controls at the bottom of the screen to play, pause, skip, and adjust the volume.
- **Responsive Design**: Enjoy a consistent experience across all devices.
