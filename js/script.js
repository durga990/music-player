// ---------- 1. Song list (add your own songs here) ----------
const songs = [
  { title: "bujjigadu-mix", artist: "Demo Artist", src: "songs/song1.mpeg", cover: "covers/cover1.png" },
  { title: "ye_tune_kya_kiya",   artist: "Demo Artist", src: "songs/song2.mpeg", cover: "covers/cover2.png" },
  { title: "shape of u",    artist: "Demo Artist", src: "songs/song3.mpeg", cover: "covers/cover3.png" },
  { title: "Sunny Day",     artist: "Demo Artist", src: "songs/song4.wav", cover: "covers/cover4.png" },
  { title: "Focus Mode",    artist: "Demo Artist", src: "songs/song5.wav", cover: "covers/cover5.png" }

 

];

// ---------- 2. Get HTML elements ----------
const player      = document.getElementById("player");
const audio       = new Audio();
const coverEl     = document.getElementById("cover");
const titleEl     = document.getElementById("title");
const artistEl    = document.getElementById("artist");
const progressEl  = document.getElementById("progress");
const currentEl   = document.getElementById("currentTime");
const durationEl  = document.getElementById("duration");
const playBtn     = document.getElementById("playBtn");
const prevBtn     = document.getElementById("prevBtn");
const nextBtn     = document.getElementById("nextBtn");
const volumeEl    = document.getElementById("volume");
const muteBtn     = document.getElementById("muteBtn");
const volumeBox   = document.querySelector(".volume");
const playlistEl  = document.getElementById("playlist");
const themeBtn    = document.getElementById("themeBtn");

let currentIndex = 0;
let isPlaying = false;
let lastVolume = 0.7;

// ---------- 3. Helper functions ----------
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + String(s).padStart(2, "0");
}

// Fills the coloured part of a slider
function setFill(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty("--fill", pct + "%");
}

// ---------- 4. Build the playlist ----------
function renderPlaylist() {
  playlistEl.innerHTML = "";
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.className = "track";
    li.tabIndex = 0;
    li.innerHTML =
      '<img src="' + song.cover + '" alt="">' +
      '<div class="meta"><strong>' + song.title + '</strong><span>' + song.artist + '</span></div>' +
      '<span class="dur" id="dur-' + index + '">--:--</span>';

    li.addEventListener("click", () => { loadSong(index); playSong(); });
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { loadSong(index); playSong(); }
    });
    playlistEl.appendChild(li);

    // Read each song's length for the playlist
    const temp = new Audio();
    temp.preload = "metadata";
    temp.src = song.src;
    temp.addEventListener("loadedmetadata", () => {
      document.getElementById("dur-" + index).textContent = formatTime(temp.duration);
    });
  });
}

function highlightActive() {
  document.querySelectorAll(".track").forEach((el, i) => {
    el.classList.toggle("active", i === currentIndex);
  });
}

// ---------- 5. Load / play / pause ----------
function loadSong(index) {
  currentIndex = index;
  const song = songs[index];
  audio.src = song.src;
  coverEl.src = song.cover;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  progressEl.value = 0;
  setFill(progressEl);
  currentEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  highlightActive();
}

function playSong() {
  audio.play().then(() => {
    isPlaying = true;
    player.classList.add("playing");
    playBtn.setAttribute("aria-label", "Pause");
  }).catch((err) => console.log("Playback blocked:", err));
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  player.classList.remove("playing");
  playBtn.setAttribute("aria-label", "Play");
}

function togglePlay() { isPlaying ? pauseSong() : playSong(); }

function nextSong() {
  loadSong((currentIndex + 1) % songs.length);
  playSong();
}

function prevSong() {
  // If the song has played for more than 3 seconds, restart it
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadSong((currentIndex - 1 + songs.length) % songs.length);
  playSong();
}

// ---------- 6. Audio events ----------
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  progressEl.value = (audio.currentTime / audio.duration) * 100;
  setFill(progressEl);
  currentEl.textContent = formatTime(audio.currentTime);
});

// Autoplay: when a song ends, play the next one
audio.addEventListener("ended", nextSong);

// ---------- 7. Button and slider events ----------
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// Seek by moving the progress slider
progressEl.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (progressEl.value / 100) * audio.duration;
  setFill(progressEl);
});

// Volume
function setVolume(value) {
  audio.volume = value;
  volumeEl.value = value * 100;
  setFill(volumeEl);
  volumeBox.classList.toggle("muted", value === 0);
}
volumeEl.addEventListener("input", () => {
  setVolume(volumeEl.value / 100);
  if (audio.volume > 0) lastVolume = audio.volume;
});
muteBtn.addEventListener("click", () => {
  if (audio.volume > 0) { lastVolume = audio.volume; setVolume(0); }
  else { setVolume(lastVolume || 0.7); }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.classList.contains("track")) return;
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  else if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || 0);
  else if (e.key === "ArrowLeft")  audio.currentTime = Math.max(audio.currentTime - 5, 0);
  else if (e.key.toLowerCase() === "n") nextSong();
  else if (e.key.toLowerCase() === "p") prevSong();
});

// Dark / light theme
themeBtn.addEventListener("click", () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
});

// ---------- 8. Start ----------
renderPlaylist();
loadSong(0);
setVolume(0.7);
