console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

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
        // Fetch songs from JSON file instead of directory listing
        let a = await fetch(`/${folder}/songs.json`);
        if (!a.ok) {
            throw new Error(`Failed to fetch songs: ${a.status}`);
        }
        let data = await a.json();
        songs = data.songs || [];
        
        console.log(`Loaded ${songs.length} songs from ${folder}`);
    } catch (error) {
        console.error('Error loading songs:', error);
        // Fallback: try to load from a predefined list
        songs = getDefaultSongs(folder);
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    
    if (songs.length === 0) {
        songUL.innerHTML = "<li>No songs found in this playlist</li>";
        return songs;
    }

    for (const song of songs) {
        const songName = song.replace(".mp3", "");
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
            const songTitle = e.querySelector(".info").firstElementChild;
            if (songTitle) {
                playMusic(songTitle.innerHTML.trim() + ".mp3");
            }
        });
    });

    return songs;
}

// Fallback function with default songs for each folder
function getDefaultSongs(folder) {
    const defaultSongs = {
        "songs/fav": [
            // Add your actual song filenames here
            "song1.mp3",
            "song2.mp3",
            "song3.mp3"
        ],
        "songs/rock": [
            // Add rock songs here
        ],
        "songs/pop": [
            // Add pop songs here
        ]
    };
    
    return defaultSongs[folder] || [];
}

const playMusic = (track, pause = false) => {
    if (!track || !currFolder) {
        console.error('Invalid track or folder');
        return;
    }

    currentSong.src = `/${currFolder}/` + track;
    
    // Add error handling for audio loading
    currentSong.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        console.error('Failed to load:', currentSong.src);
        // You could show a user-friendly message here
        document.querySelector(".songinfo").innerHTML = "Failed to load: " + decodeURI(track).replace(".mp3", "");
    });

    currentSong.addEventListener('loadstart', () => {
        console.log('Started loading:', track);
    });

    currentSong.addEventListener('canplay', () => {
        console.log('Can play:', track);
    });

    if (!pause) {
        currentSong.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        let playButton = document.getElementById("play");
        if (playButton) {
            playButton.src = "img/pause.svg";
        }
    }
    
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(".mp3", "");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("displaying albums");
    try {
        // Try to fetch albums from JSON file
        let a = await fetch(`/albums.json`);
        let albums = [];
        
        if (a.ok) {
            let data = await a.json();
            albums = data.albums || [];
        } else {
            // Fallback to default albums
            albums = getDefaultAlbums();
        }

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = ""; // Clear existing content

        for (const album of albums) {
            try {
                // Try to fetch album info
                let infoResponse = await fetch(`/songs/${album.folder}/info.json`);
                let albumInfo = {
                    title: album.title || album.folder,
                    description: album.description || "Music collection"
                };

                if (infoResponse.ok) {
                    albumInfo = await infoResponse.json();
                }

                cardContainer.innerHTML += `
                    <div data-folder="${album.folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${album.folder}/cover.jpg" alt="" onerror="this.src='img/default-cover.jpg'">
                        <h2>${albumInfo.title}</h2>
                        <p>${albumInfo.description}</p>
                    </div>`;
            } catch (error) {
                console.error(`Error loading album ${album.folder}:`, error);
            }
        }

        // Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log("Fetching Songs");
                try {
                    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                    if (songs.length > 0) {
                        playMusic(songs[0]);
                    }
                } catch (error) {
                    console.error("Error loading playlist:", error);
                }
            });
        });

    } catch (error) {
        console.error('Error in displayAlbums:', error);
        // Show default albums as fallback
        displayDefaultAlbums();
    }
}

// Fallback function for default albums
function getDefaultAlbums() {
    return [
        {
            folder: "fav",
            title: "Favorites",
            description: "My favorite songs"
        },
        {
            folder: "rock",
            title: "Rock Collection", 
            description: "Best rock songs"
        },
        {
            folder: "pop",
            title: "Pop Hits",
            description: "Popular songs"
        }
    ];
}

function displayDefaultAlbums() {
    const albums = getDefaultAlbums();
    let cardContainer = document.querySelector(".cardContainer");
    
    for (const album of albums) {
        cardContainer.innerHTML += `
            <div data-folder="${album.folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/songs/${album.folder}/cover.jpg" alt="" onerror="this.src='img/default-cover.jpg'">
                <h2>${album.title}</h2>
                <p>${album.description}</p>
            </div>`;
    }
}

async function main() {
    try {
        // Get the list of all the songs
        await getSongs("songs/fav");
        if (songs.length > 0) {
            playMusic(songs[0], true);
        }

        // Display all the albums on the page
        await displayAlbums();

        // Attach an event listener to play, next and previous
        let playButton = document.getElementById("play");
        if (playButton) {
            playButton.addEventListener("click", () => {
                if (currentSong.paused) {
                    currentSong.play().catch(error => {
                        console.error('Error playing:', error);
                    });
                    playButton.src = "img/pause.svg";
                } else {
                    currentSong.pause();
                    playButton.src = "img/play.svg";
                }
            });
        }

        // Listen for timeupdate event
        currentSong.addEventListener("timeupdate", () => {
            const songTimeElement = document.querySelector(".songtime");
            const circleElement = document.querySelector(".circle");
            
            if (songTimeElement) {
                songTimeElement.innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            }
            
            if (circleElement && currentSong.duration) {
                circleElement.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
            }
        });

        // Add an event listener to seekbar
        const seekbar = document.querySelector(".seekbar");
        if (seekbar) {
            seekbar.addEventListener("click", e => {
                let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
                const circleElement = document.querySelector(".circle");
                if (circleElement) {
                    circleElement.style.left = percent + "%";
                }
                if (currentSong.duration) {
                    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
                }
            });
        }

        // Add an event listener for hamburger
        const hamburger = document.querySelector(".hamburger");
        if (hamburger) {
            hamburger.addEventListener("click", () => {
                const leftPanel = document.querySelector(".left");
                if (leftPanel) {
                    leftPanel.style.left = "0";
                }
            });
        }

        // Add an event listener for close button
        const closeButton = document.querySelector(".close");
        if (closeButton) {
            closeButton.addEventListener("click", () => {
                const leftPanel = document.querySelector(".left");
                if (leftPanel) {
                    leftPanel.style.left = "-120%";
                }
            });
        }

        // Add an event listener to previous
        const previousButton = document.getElementById("previous");
        if (previousButton) {
            previousButton.addEventListener("click", () => {
                currentSong.pause();
                console.log("Previous clicked");
                if (songs && songs.length > 0) {
                    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
                    if ((index - 1) >= 0) {
                        playMusic(songs[index - 1]);
                    }
                }
            });
        }

        // Add an event listener to next
        const nextButton = document.getElementById("next");
        if (nextButton) {
            nextButton.addEventListener("click", () => {
                currentSong.pause();
                console.log("Next clicked");
                if (songs && songs.length > 0) {
                    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
                    if ((index + 1) < songs.length) {
                        playMusic(songs[index + 1]);
                    }
                }
            });
        }

        // Add an event to volume
        const volumeRange = document.querySelector(".range input");
        if (volumeRange) {
            volumeRange.addEventListener("change", (e) => {
                console.log("Setting volume to", e.target.value, "/ 100");
                currentSong.volume = parseInt(e.target.value) / 100;
                const volumeImg = document.querySelector(".volume>img");
                if (currentSong.volume > 0 && volumeImg) {
                    volumeImg.src = volumeImg.src.replace("img/mute.svg", "img/volume.svg");
                }
            });
        }

        // Add event listener to mute the track
        const volumeButton = document.querySelector(".volume>img");
        if (volumeButton) {
            volumeButton.addEventListener("click", e => {
                const rangeInput = document.querySelector(".range input");
                if (e.target.src.includes("img/volume.svg")) {
                    e.target.src = e.target.src.replace("volume.svg", "mute.svg");
                    currentSong.volume = 0;
                    if (rangeInput) rangeInput.value = 0;
                } else {
                    e.target.src = e.target.src.replace("mute.svg", "volume.svg");
                    currentSong.volume = 0.10;
                    if (rangeInput) rangeInput.value = 10;
                }
            });
        }

    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();
