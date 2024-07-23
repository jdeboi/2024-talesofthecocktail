class Playlist {
  constructor() {
    this.currentSong;
    this.fft = new p5.FFT();
  }

  addSong(song) {
    // this.songs.push(song);
    this.currentSong = song;
  }

  playSong() {
      this.currentSong.play();
  }

  nextSong() {
    this.playSong();
  }

  display() {

    this.currentSong.display();
  }
 
  getIsPlaying() {
    return this.currentSong.getIsPlaying();
  }

  resetPlay() {

    this.currentSong.resetPlay();
  }

  togglePlay() {
    this.currentSong.togglePlay();

      if (this.currentSong.getIsPlaying()) {
        console.log("playing", this.currentSong.title);
      } else {
        console.log("paused", this.currentSong.title);
      }
  }

  stop() {
    this.currentSong.stop();
  }

  getCurrentMeasureBeat() {

      return this.currentSong.getCurrentMeasureBeat();
   
  }

  getSecondsPerBeat() {
   return this.currentSong.secondsPerBeat;
    
  }

  getBeatPercent() {
   return this.currentSong.getBeatPercent();
   
  }

  getBeatChanged() {
      return this.currentSong.beatChanged();
  }

  getMeasureChanged() {
    return this.currentSong.measureChanged();
   
  }

  getTwoFourChanged() {
    return this.currentSong.twoFourChanged();
   
  }
}
