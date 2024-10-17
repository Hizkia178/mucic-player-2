let trackList = [];
let trackIndex = 0;
let isPlaying = false;
let audio = new Audio();
let currentTrack = document.querySelector('.track-name');
let currentArtist = document.querySelector('.track-artist');
let trackArt = document.querySelector('.track-art');
let playpauseBtn = document.querySelector('.playpause-track i');
let wave = document.getElementById('wave');
let currentTime = document.querySelector('.current-time');
let totalDuration = document.querySelector('.total-duration');
let randomBtn = document.querySelector('.random-track i');
let repeatBtn = document.querySelector('.repeat-track i');
let progressSlider = document.getElementById('progress-slider');
let lyricContainer = document.getElementById('lyrics'); // Kontainer untuk lirik
let lyrics = []; // Array untuk menyimpan lirik yang di-load dari file LRC

// Fetch track data from JSON file
fetch('tracks.json')
    .then(response => response.json())
    .then(data => {
        trackList = data;
        loadTrack(trackIndex); // Load the first track
    })
    .catch(error => console.log('Error loading JSON:', error));

function loadTrack(trackIndex) {
    audio.src = trackList[trackIndex].path;
    currentTrack.innerText = trackList[trackIndex].name;
    currentArtist.innerText = trackList[trackIndex].artist;
    trackArt.style.backgroundImage = "url(" + trackList[trackIndex].cover + ")";
    audio.load();

    // Load lyrics for the current track
    loadLyrics(trackList[trackIndex].lyrics); // Nama file LRC
    updateTimer();
}

// Function to load lyrics from a LRC file
function loadLyrics(lrcFile) {
    fetch(lrcFile)
        .then(response => response.text())
        .then(text => {
            lyrics = parseLRC(text);  // Parse LRC file
        })
        .catch(error => console.log('Error loading lyrics:', error));
}

// Parse LRC file into an array of objects {time: seconds, text: lyric}
function parseLRC(lrcText) {
    let lines = lrcText.split('\n');
    let lrcData = [];

    lines.forEach(function (line) {
        let match = line.match(/\[(\d+):(\d+).(\d+)\](.*)/);
        if (match) {
            let minutes = parseInt(match[1]);
            let seconds = parseInt(match[2]);
            let totalSeconds = minutes * 60 + seconds;
            let text = match[4].trim();
            if (text) {
                lrcData.push({ time: totalSeconds, text: text });
            }
        }
    });
    return lrcData;
}

// Display lyric based on current time
function displayLyrics() {
    let currentTimeInSeconds = Math.floor(audio.currentTime);

    for (let i = 0; i < lyrics.length; i++) {
        if (i < lyrics.length - 1 && currentTimeInSeconds >= lyrics[i].time && currentTimeInSeconds < lyrics[i + 1].time) {
            lyricContainer.innerText = lyrics[i].text;
            break;
        } else if (i === lyrics.length - 1 && currentTimeInSeconds >= lyrics[i].time) {
            lyricContainer.innerText = lyrics[i].text;
        }
    }
}

function playTrack() {
    audio.play();
    isPlaying = true;
    playpauseBtn.classList.replace('fa-play-circle', 'fa-pause-circle');
    wave.classList.add('active');
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playpauseBtn.classList.replace('fa-pause-circle', 'fa-play-circle');
    wave.classList.remove('active');
}

playpauseBtn.addEventListener('click', function () {
    isPlaying ? pauseTrack() : playTrack();
});

function nextTrack() {
    trackIndex = (trackIndex + 1) % trackList.length;
    loadTrack(trackIndex);
    playTrack();
}

function prevTrack() {
    trackIndex = (trackIndex - 1 + trackList.length) % trackList.length;
    loadTrack(trackIndex);
    playTrack();
}

document.querySelector('.next-track').addEventListener('click', nextTrack);
document.querySelector('.prev-track').addEventListener('click', prevTrack);

function randomTrack() {
    let randomIndex = Math.floor(Math.random() * trackList.length);
    loadTrack(randomIndex);
    playTrack();
}

randomBtn.addEventListener('click', randomTrack);

function repeatTrack() {
    loadTrack(trackIndex);
    playTrack();
}

repeatBtn.addEventListener('click', repeatTrack);

audio.addEventListener('ended', function () {
    nextTrack();
});

// Update lyrics as time progresses
audio.addEventListener('timeupdate', function () {
    displayLyrics();
});

function updateTimer() {
    audio.addEventListener('timeupdate', function () {
        if (!isNaN(audio.duration)) {
            let currentMinutes = Math.floor(audio.currentTime / 60);
            let currentSeconds = Math.floor(audio.currentTime % 60);
            let durationMinutes = Math.floor(audio.duration / 60);
            let durationSeconds = Math.floor(audio.duration % 60);

            currentTime.innerText = `${currentMinutes}:${currentSeconds < 10 ? '0' + currentSeconds : currentSeconds}`;
            totalDuration.innerText = `${durationMinutes}:${durationSeconds < 10 ? '0' + durationSeconds : durationSeconds}`;
        }

        // Update progress slider based on current time
        let progress = (audio.currentTime / audio.duration) * 100;
        progressSlider.value = progress;
    });
}

// Allow user to change progress by moving the slider
progressSlider.addEventListener('input', function () {
    let seekTo = (progressSlider.value / 100) * audio.duration;
    audio.currentTime = seekTo;
});
