const playlistData = [
    { title: '(OST) Dreamseeker', duration: '0:19', number: 1, filename: 'audio/1.dreamseeker.mp3' },
    { title: 'YOUtopia', duration: '4:02', number: 2, filename: 'audio/2.YOUtopia.mp3' },
    { title: 'Kool-Aid', duration: '3:48', number: 3, filename: 'audio/3.Kool-Aid.mp3' },
    { title: 'Top 10 staTues tHat CriEd bloOd', duration: '4:00', number: 4, filename: 'audio/4.Top-10-staTues-tHat-CriEd-bloOd.mp3' },
    { title: 'Limousine (featuring Aurora)', duration: '4:11', number: 5, filename: 'audio/5.liMOusIne.mp3' },
    { title: 'DArkSide', duration: '2:45', number: 6, filename: 'audio/6.DArkSide.mp3' },
    { title: 'A Bullet w/ My Name On (featuring Underoath)', duration: '4:20', number: 7, filename: 'audio/7.my_namE_On.mp3' },
    { title: '(OST) (Spi)ritual', duration: '1:54', number: 8, filename: 'audio/8.(spi)ritual.mp3' },
    { title: 'N/A', duration: '3:20', number: 9, filename: 'audio/9.NA.mp3' },
    { title: 'LosT', duration: '3:25', number: 10, filename: 'audio/10.LosT.mp3' },
    { title: 'Strangers', duration: '3:15', number: 11, filename: 'audio/11.sTraNgeRs.mp3' },
    { title: 'R.I.P. (Duskcore Remix)', duration: '3:23', number: 12, filename: 'audio/12.R.i.p.mp3' },
    { title: 'Amen! (featuring Lil Uzi Vert and Daryl Palumbo)', duration: '3:09', number: 13, filename: 'audio/13.AmEN!.mp3' },
    { title: '(OST) P.U.S.S.-E', duration: '2:49', number: 14, filename: 'audio/14.p.u.s.s.-e.mp3' },
    { title: 'Die4U', duration: '3:27', number: 15, filename: 'audio/15.DiE4u.mp3' },
    { title: 'Dig It', duration: '7:12', number: 16, filename: 'audio/16.DIg It.mp3' }
];

let currentTrackIndex = 0;
let audioPlayer;
let progressInterval;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 BMTH Music Player Initializing...');
    initializePlayer();
    populatePlaylist();
    setupEventListeners();
    
    // Load first track setelah semua setup
    setTimeout(() => loadTrack(0), 1000);
});

function initializePlayer() {
    // Buat audio element baru dengan error handling
    audioPlayer = new Audio();
    
    // Setup event listeners dengan error handling
    const setupEvent = (event, handler) => {
        try {
            audioPlayer.addEventListener(event, handler);
        } catch (e) {
            console.warn(`Could not add ${event} listener:`, e);
        }
    };
    
    setupEvent('loadedmetadata', function() {
        console.log('✅ Audio metadata loaded');
        updatePlayerStatus('READY');
    });
    
    setupEvent('canplaythrough', function() {
        console.log('✅ Audio ready to play');
        updatePlayerStatus('READY TO PLAY');
    });
    
    setupEvent('playing', function() {
        console.log('▶ Playing audio');
        updatePlayerStatus('PLAYING');
        startProgressUpdate();
        updatePlayPauseButton();
    });
    
    setupEvent('pause', function() {
        console.log('⏸ Audio paused');
        updatePlayerStatus('PAUSED');
        stopProgressUpdate();
        updatePlayPauseButton();
    });
    
    setupEvent('ended', function() {
        console.log('⏹ Audio ended');
        playNextTrack();
    });
    
    setupEvent('error', function(e) {
        console.error('❌ Audio error:', audioPlayer.error);
        updatePlayerStatus('ERROR: ' + (audioPlayer.error?.message || 'Unknown error'));
    });
    
    // Set initial volume
    audioPlayer.volume = 0.7;
}

function setupEventListeners() {
    // Playlist clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.playlist-item')) {
            const items = document.querySelectorAll('.playlist-item');
            const clickedItem = e.target.closest('.playlist-item');
            const index = Array.from(items).indexOf(clickedItem);
            
            if (index !== -1) {
                console.log('🎵 Track clicked:', index);
                loadTrack(index);
            }
        }
    });
    
    // Control buttons dengan null checking
    const playPauseBtn = document.querySelector('.play-pause');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const volumeSlider = document.querySelector('.volume-slider');
    const progressArea = document.getElementById('progressArea');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
        playPauseBtn.style.cursor = 'pointer';
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', playPreviousTrack);
        prevBtn.style.cursor = 'pointer';
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', playNextTrack);
        nextBtn.style.cursor = 'pointer';
    }
    
    if (volumeSlider) volumeSlider.addEventListener('input', updateVolume);
    if (progressArea) progressArea.addEventListener('click', seekAudio);
}

function loadTrack(index) {
    if (index < 0 || index >= playlistData.length) {
        console.error('❌ Invalid track index:', index);
        return;
    }
    
    currentTrackIndex = index;
    const track = playlistData[index];
    
    console.log('🎵 Loading track:', track.title, 'File:', track.filename);
    
    // Stop current playback
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
    
    // Coba load file dengan timeout dan error handling
    const loadAudioFile = (filename) => {
        return new Promise((resolve, reject) => {
            const testAudio = new Audio();
            testAudio.src = filename;
            
            testAudio.addEventListener('canplaythrough', () => {
                resolve(filename);
            });
            
            testAudio.addEventListener('error', () => {
                reject(new Error(`File not found: ${filename}`));
            });
            
            // Timeout setelah 3 detik
            setTimeout(() => {
                reject(new Error(`Timeout loading: ${filename}`));
            }, 3000);
            
            testAudio.load();
        });
    };
    
    // Coba load file
    loadAudioFile(track.filename)
        .then((file) => {
            console.log('✅ File found:', file);
            audioPlayer.src = file;
            audioPlayer.load();
            
            updateCurrentTrackInfo(track);
            updateActivePlaylistItem(index);
            updateNowPlaying(track);
            updatePlayerStatus('LOADED - CLICK PLAY');
            
            // Enable play button
            const playBtn = document.querySelector('.play-pause');
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.style.opacity = '1';
            }
        })
        .catch((error) => {
            console.error('❌ File loading failed:', error);
            updatePlayerStatus('FILE NOT FOUND: ' + track.filename);
            
            // Disable play button
            const playBtn = document.querySelector('.play-pause');
            if (playBtn) {
                playBtn.disabled = true;
                playBtn.style.opacity = '0.5';
            }
        });
}

function togglePlayPause() {
    if (!audioPlayer.src) {
        console.log('⚠️ No audio source loaded, loading track...');
        loadTrack(currentTrackIndex);
        return;
    }
    
    try {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(error => {
                console.error('❌ Play failed:', error);
                updatePlayerStatus('PLAY FAILED: ' + error.message);
                
                // Fallback: coba load ulang track
                setTimeout(() => loadTrack(currentTrackIndex), 1000);
            });
        } else {
            audioPlayer.pause();
        }
    } catch (error) {
        console.error('❌ Play/Pause error:', error);
        updatePlayerStatus('ERROR: ' + error.message);
    }
}

function playPreviousTrack() {
    let newIndex = currentTrackIndex - 1;
    if (newIndex < 0) newIndex = playlistData.length - 1;
    loadTrack(newIndex);
}

function playNextTrack() {
    let newIndex = currentTrackIndex + 1;
    if (newIndex >= playlistData.length) newIndex = 0;
    loadTrack(newIndex);
}

function updateVolume() {
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider && audioPlayer) {
        audioPlayer.volume = volumeSlider.value / 100;
    }
}

function seekAudio(e) {
    if (!audioPlayer || !audioPlayer.duration) {
        console.log('⚠️ Cannot seek - no audio loaded');
        return;
    }
    
    const progressArea = document.getElementById('progressArea');
    if (!progressArea) return;
    
    const rect = progressArea.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    
    const seekTime = (clickX / progressWidth) * audioPlayer.duration;
    audioPlayer.currentTime = Math.max(0, Math.min(seekTime, audioPlayer.duration));
}

// Progress update functions
function startProgressUpdate() {
    stopProgressUpdate();
    progressInterval = setInterval(updateProgressBar, 100);
}

function stopProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgressBar() {
    if (!audioPlayer || !audioPlayer.duration || isNaN(audioPlayer.duration)) return;
    
    try {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        
        const progressPercent = (currentTime / duration) * 100;
        const progressBar = document.getElementById('progressBar');
        const currentTimeEl = document.querySelector('.current-time');
        const maxDurationEl = document.querySelector('.max-duration');
        
        if (progressBar) progressBar.style.width = `${progressPercent}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
        if (maxDurationEl && duration > 0) maxDurationEl.textContent = formatTime(duration);
        
        updateLyricsHighlight(currentTime);
    } catch (error) {
        console.warn('Progress update error:', error);
    }
}

function updateLyricsHighlight(currentTime) {
    try {
        const lyricsLines = document.querySelectorAll('.lyrics p');
        let currentLine = null;
        
        lyricsLines.forEach(line => {
            const lineTime = parseFloat(line.dataset.time) || 0;
            if (currentTime >= lineTime) {
                currentLine = line;
            }
            line.classList.remove('current-line');
        });
        
        if (currentLine) {
            currentLine.classList.add('current-line');
        }
    } catch (error) {
        console.warn('Lyrics highlight error:', error);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// UI Update functions
function updatePlayPauseButton() {
    const btn = document.querySelector('.play-pause');
    if (btn) {
        btn.innerHTML = audioPlayer.paused ? '▶' : '⏸';
        btn.title = audioPlayer.paused ? 'Play' : 'Pause';
    }
}

function updatePlayerStatus(status) {
    const statusElement = document.getElementById('playerStatus');
    if (statusElement) {
        statusElement.textContent = status;
        console.log('📢 Player Status:', status);
    }
}

function updateCurrentTrackInfo(track) {
    const currentTrackElement = document.getElementById('currentTrack');
    if (currentTrackElement) {
        currentTrackElement.innerHTML = `
            <div class="track-title">${track.title}</div>
            <div class="track-artist">BRING ME THE HORIZON • TRACK ${track.number}</div>
        `;
    }
}

function updateActivePlaylistItem(index) {
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

function updateNowPlaying(track) {
    const nowPlayingElement = document.getElementById('nowPlaying');
    if (nowPlayingElement) {
        nowPlayingElement.querySelector('.np-track').textContent = `${track.title} - BMTH`;
    }
}

function populatePlaylist() {
    const playlistElement = document.getElementById('playlist');
    if (!playlistElement) {
        console.error('❌ Playlist element not found');
        return;
    }
    
    playlistElement.innerHTML = '';
    
    playlistData.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = `playlist-item ${index === 0 ? 'active' : ''}`;
        item.innerHTML = `
            <div class="track-number">${track.number.toString().padStart(2, '0')}</div>
            <div class="track-info">
                <div class="track-name">${track.title}</div>
                <div class="track-duration">${track.duration}</div>
            </div>
            <div class="play-icon">▶</div>
        `;
        playlistElement.appendChild(item);
    });
}

// Helper function
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '255, 255, 255';
}