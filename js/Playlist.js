class Playlist {
  constructor() {
    this.songs = [];
    this.currentSongIndex = 0;
    this.fft = new p5.FFT();
  }

  addSong(song) {
    this.songs.push(song);
  }

  playSong(index) {
    if (index < this.songs.length) {
      let currentSong = this.songs[index];
      currentSong.play();
    }
  }

  nextSong() {
    this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
    this.playSong(this.currentSongIndex);
  }

  display() {
    let song = this.songs[this.currentSongIndex];
    if (song) {
      song.display();
    }
  }

  getIsPlaying() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      return currentSong.getIsPlaying();
    }
    return false;
  }

  resetPlay() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      currentSong.resetPlay();
    }
  }

  togglePlay() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      currentSong.togglePlay();

      if (currentSong.getIsPlaying()) {
        console.log("playing", currentSong.title);
      } else {
        console.log("paused", currentSong.title);
      }
    } else {
      console.log("No songs in playlist");
    }
  }

  stop() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      currentSong.stop();
    }
  }

  getCurrentMeasureBeat() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      return currentSong.getCurrentMeasureBeat();
    }
    return -1;
  }

  getSecondsPerBeat() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      return currentSong.secondsPerBeat;
    }
    return -1;
  }

  getBeatPercent() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      return currentSong.getBeatPercent();
    }
    return -1;
  }

  getBeatChanged() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      return currentSong.beatChanged();
    }
    return -1;
  }
  getMeasureChanged() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      return currentSong.measureChanged();
    }
    return -1;
  }

  getTwoFourChanged() {
    if (this.songs.length > 0) {
      let currentSong = this.songs[this.currentSongIndex];
      return currentSong.twoFourChanged();
    }
    return -1;
  }
}
