// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const videoList = [
    'bg5Djyh4gNs',
    'i8Iox78HK9E',
    'LB2YU6gcHtA',
    'RhnqF2L9dZQ',
    'wYM3cN-tMxw',
    'Ise5sptqk0w',
    'msBNSDawTeQ',
    'EUY7ejR9Yzs',
    'i7j0bw5TonI',
    'ht75sAd_8YE'
];

let player;
let isTvOn = false;
let currentChannelIndex = 0;
let defaultVolume = 50;

// Variables for DOM Elements
const tvCabinet = document.querySelector('.tv-cabinet');
const powerBtn = document.getElementById('power-btn');
const chUpBtn = document.getElementById('ch-up');
const chDownBtn = document.getElementById('ch-down');
const volUpBtn = document.getElementById('vol-up');
const volDownBtn = document.getElementById('vol-down');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const channelDisplay = document.getElementById('channel-display');

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoList[0],
        playerVars: {
            'playsinline': 1,
            'controls': 0, // Hide YouTube controls to simulate TV
            'disablekb': 1,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    // Error 150 or 101 means embedding is disabled by the owner
    if (event.data === 150 || event.data === 101) {
        showChannelDisplay('SINAL BLOQUEADO');
        setTimeout(() => {
            window.open(`https://www.youtube.com/watch?v=${videoList[currentChannelIndex]}`, '_blank');
        }, 1500);
    }
}

function onPlayerStateChange(event) {
    console.log('Player State Changed:', event.data);
}

function onPlayerReady(event) {
    // Player is ready, initialize volume but don't play yet (TV is off)
    player.setVolume(defaultVolume);
}

// Power functionality
powerBtn.addEventListener('click', () => {
    isTvOn = !isTvOn;
    
    if (isTvOn) {
        tvCabinet.classList.remove('tv-off');
        tvCabinet.classList.add('tv-on');
        showChannelDisplay(`CH ${String(currentChannelIndex + 1).padStart(2, '0')}`);
        
        // Start playing if player is ready
        if (player && typeof player.playVideo === 'function') {
            player.playVideo();
        }
    } else {
        tvCabinet.classList.remove('tv-on');
        tvCabinet.classList.add('tv-off');
        
        // Stop playing
        if (player && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
        }
    }
});

// Channel functionality
function changeChannel(direction) {
    if (!isTvOn) {
        // If TV is off, turn it on instead of doing nothing
        powerBtn.click();
        return;
    }

    if (direction === 'up') {
        currentChannelIndex = (currentChannelIndex + 1) % videoList.length;
    } else {
        currentChannelIndex = (currentChannelIndex - 1 + videoList.length) % videoList.length;
    }

    if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById(videoList[currentChannelIndex]);
    }

    showChannelDisplay(`CH ${String(currentChannelIndex + 1).padStart(2, '0')}`);
}

chUpBtn.addEventListener('click', () => changeChannel('up'));
chDownBtn.addEventListener('click', () => changeChannel('down'));

// Volume functionality
function changeVolume(amount) {
    if (!isTvOn || !player || typeof player.getVolume !== 'function') return;

    let currentVol = player.getVolume();
    let newVol = currentVol + amount;
    
    if (newVol > 100) newVol = 100;
    if (newVol < 0) newVol = 0;

    player.setVolume(newVol);
    showChannelDisplay(`VOL ${newVol}`);
}

volUpBtn.addEventListener('click', () => changeVolume(10));
volDownBtn.addEventListener('click', () => changeVolume(-10));

// Play/Pause functionality
playBtn.addEventListener('click', () => {
    if (isTvOn && player && typeof player.playVideo === 'function') {
        player.playVideo();
        showChannelDisplay('PLAY');
    }
});

pauseBtn.addEventListener('click', () => {
    if (isTvOn && player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
        showChannelDisplay('STOP');
    }
});

// Helper: Show on-screen display (OSD)
let displayTimeout;
function showChannelDisplay(text) {
    channelDisplay.textContent = text;
    channelDisplay.classList.add('show');
    
    clearTimeout(displayTimeout);
    displayTimeout = setTimeout(() => {
        channelDisplay.classList.remove('show');
    }, 2000);
}

// Initial state
tvCabinet.classList.add('tv-off');