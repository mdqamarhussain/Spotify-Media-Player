console.log('Lets write JavaScript');
let currentSong = new Audio();
// Optimize audio loading - only load metadata initially
currentSong.preload = 'metadata';
let songs;
let currFolder;
let currentSongIndex = 0;

// Preload management
let preloadedSongs = new Map();
let nextSongPreloader = null;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        // Load songs from catalog instead of directory listing
        let catalogResponse = await fetch('./songs-catalog.json');
        if (!catalogResponse.ok) {
            throw new Error(`Failed to load catalog: ${catalogResponse.status}`);
        }
        let catalog = await catalogResponse.json();
        
        // Find the album in the catalog
        let album = catalog.albums.find(a => `songs/${a.folder}` === folder);
        songs = album ? album.songs : [];
        
        if (songs.length === 0) {
            console.warn(`No songs found for folder: ${folder}`);
        }
    } catch (error) {
        console.error("Error loading songs:", error);
        songs = [];
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        const songName = song.replace(".mp3", "");  // Remove the .mp3 extension
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${songName.replaceAll("%20", " ")}</div>
                    <div></div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info").firstElementChild.innerHTML.trim() + ".mp3";
            playMusic(songName);  // Add the .mp3 extension back
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    // Stop and reset current song first
    currentSong.pause();
    currentSong.currentTime = 0;
    
    // Show loading state
    const songInfoElement = document.querySelector(".songinfo");
    const songTimeElement = document.querySelector(".songtime");
    
    songInfoElement.innerHTML = `Loading... ${decodeURI(track).replace(".mp3", "")}`;
    songInfoElement.classList.add('loading');
    songTimeElement.innerHTML = "Loading...";
    songTimeElement.classList.add('loading');
    
    const playBtn = document.getElementById('play');
    if (playBtn) playBtn.src = "img/play.svg";
    
    currentSong.src = `./${currFolder}/` + track;
    currentSongIndex = songs.indexOf(track);
    
    // Highlight current song in playlist
    const songListItems = document.querySelector(".songlist").getElementsByTagName("li");
    Array.from(songListItems).forEach((li, index) => {
        li.style.backgroundColor = index === currentSongIndex ? "rgba(255, 255, 255, 0.1)" : "";
    });
    
    // Handle when enough data is loaded to play
    const onCanPlay = () => {
        const songInfoElement = document.querySelector(".songinfo");
        const songTimeElement = document.querySelector(".songtime");
        
        songInfoElement.innerHTML = decodeURI(track).replace(".mp3", "");
        songInfoElement.classList.remove('loading');
        songTimeElement.innerHTML = "00:00 / 00:00";
        songTimeElement.classList.remove('loading');
        
        if (!pause) {
            currentSong.play().then(() => {
                if (playBtn) playBtn.src = "img/pause.svg";
            }).catch(error => {
                console.log("Play interrupted:", error);
            });
        }
        
        // Preload next song
        preloadNextSong();
        
        // Remove event listener
        currentSong.removeEventListener('canplay', onCanPlay);
    };
    
    currentSong.addEventListener('canplay', onCanPlay);
    
    console.log(`Now playing: ${track} (index: ${currentSongIndex})`);
}

// Function to preload the next song
const preloadNextSong = () => {
    if (currentSongIndex + 1 < songs.length) {
        const nextTrack = songs[currentSongIndex + 1];
        const nextSongPath = `./${currFolder}/${nextTrack}`;
        
        if (!preloadedSongs.has(nextSongPath)) {
            if (nextSongPreloader) {
                nextSongPreloader.src = '';
            }
            
            nextSongPreloader = new Audio();
            nextSongPreloader.preload = 'auto';
            nextSongPreloader.src = nextSongPath;
            
            nextSongPreloader.addEventListener('canplaythrough', () => {
                preloadedSongs.set(nextSongPath, nextSongPreloader);
                console.log(`Preloaded: ${nextTrack}`);
            });
            
            nextSongPreloader.addEventListener('error', () => {
                console.log(`Failed to preload: ${nextTrack}`);
            });
        }
    }
}

async function displayAlbums() {
    console.log("displaying albums");
    try {
        // Load albums from catalog instead of directory listing
        let catalogResponse = await fetch('./songs-catalog.json');
        if (!catalogResponse.ok) {
            throw new Error(`Failed to load catalog: ${catalogResponse.status}`);
        }
        let catalog = await catalogResponse.json();
        let cardContainer = document.querySelector(".cardContainer");
        
        if (!cardContainer) {
            console.error("Card container not found");
            return;
        }
        
        for (const album of catalog.albums) {
            cardContainer.innerHTML += `
                <div data-folder="${album.folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="${album.cover}" alt="" onerror="this.src='img/music.svg'">
                    <h2>${album.title}</h2>
                    <p>${album.description}</p>
                </div>`;
        }
    } catch (error) {
        console.error("Error displaying albums:", error);
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}

async function main() {
    // Get references to control elements
    const play = document.getElementById('play');
    const previous = document.getElementById('previous');
    const next = document.getElementById('next');

    // Add error event listener for audio
    currentSong.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        play.src = "img/play.svg";
        document.querySelector(".songinfo").innerHTML = "Error loading song";
    });

    // Add loading progress events
    currentSong.addEventListener("loadstart", () => {
        console.log("Loading audio...");
    });

    currentSong.addEventListener("progress", () => {
        if (currentSong.buffered.length > 0) {
            const bufferedEnd = currentSong.buffered.end(currentSong.buffered.length - 1);
            const duration = currentSong.duration;
            if (duration > 0) {
                const percent = Math.round((bufferedEnd / duration) * 100);
                console.log(`Loading progress: ${percent}%`);
            }
        }
    });

    currentSong.addEventListener("canplay", () => {
        console.log("Audio ready to play");
    });

    // Get the list of all the songs
    await getSongs("songs/fav");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    // Display all the albums on the page
    await displayAlbums();

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play().then(() => {
                play.src = "img/pause.svg";
            }).catch(error => {
                console.log("Play failed:", error);
                play.src = "img/play.svg";
            });
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        
        // Only update progress if duration is valid
        if (currentSong.duration && !isNaN(currentSong.duration) && currentSong.duration > 0) {
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // Auto-play next song when current song ends
    currentSong.addEventListener("ended", () => {
        console.log("Song ended, playing next");
        if ((currentSongIndex + 1) < songs.length) {
            playMusic(songs[currentSongIndex + 1]);
        }
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        
        // Only seek if duration is valid
        if (currentSong.duration && !isNaN(currentSong.duration) && currentSong.duration > 0) {
            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        }
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous clicked, current index:", currentSongIndex);
        if ((currentSongIndex - 1) >= 0) {
            playMusic(songs[currentSongIndex - 1]);
        }
    });

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("Next clicked, current index:", currentSongIndex);
        if ((currentSongIndex + 1) < songs.length) {
            playMusic(songs[currentSongIndex + 1]);
        }
    });

    // Add an event to volume
    document.querySelector(".range input").addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg");
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
