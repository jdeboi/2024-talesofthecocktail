class Song {
  constructor(title, bpm, beatsPerMeasure = 4, startTime = 0) {
    this.title = title;
    this.startTime = startTime;
    this.bpm = bpm;
    this.secondsPerBeat = 60 / bpm;
    this.beatsPerMeasure = beatsPerMeasure;
    this.audioFile = loadSound("../assets/" + title + ".mp3");
    this.previousBeat = 0;
    // this.audioFile.setVolume(0);
  }

  play() {
    this.audioFile.play();
  }

  stop() {
    if (this.audioFile.isPlaying()) {
      this.audioFile.pause();
    }
  }

  resetPlay() {
    if (this.audioFile.isPlaying()) {
      this.audioFile.stop();
    }
    this.audioFile.currentTime(0);
    this.audioFile.play();
  }

  togglePlay() {
    if (this.audioFile.isPlaying()) {
      this.audioFile.pause();
    } else {
      this.audioFile.play();
    }
  }

  display() {
    if (this.hasEnded()) {
      this.audioFile.stop();
      playlist.nextSong();
    } else if (this.audioFile.isPlaying()) {
      displayMode();
    }
  }

  hasEnded() {
    return this.audioFile.currentTime() >= this.audioFile.duration() - 0.2;
  }
  getCurrentBeatTotal() {
    return (
      (this.audioFile.currentTime() - this.startTime) / this.secondsPerBeat
    );
  }

  getBeatPercent() {
    if (this.getCurrentBeatTotal() < 0) {
      return 0;
    }
    return this.getCurrentBeatTotal() % 1;
  }

  getIsPlaying() {
    return this.audioFile.isPlaying();
  }

  getCurrentMeasureBeat() {
    return Math.floor(this.getCurrentBeatTotal()) % this.beatsPerMeasure;
  }

  twoFourChanged() {
    let changed = this.beatChanged() && this.getCurrentMeasureBeat() % 2 === 0;
    return changed;
  }

  beatChanged() {
    let currentBeat = this.getCurrentMeasureBeat();
    if (currentBeat < 0) currentBeat = 0;
    if (currentBeat !== this.previousBeat) {
      // console.log("beat", `${currentBeat + 1}/${this.beatsPerMeasure}`);

      this.previousBeat = currentBeat;
      return true;
    }
    return false;
  }

  measureChanged() {
    let change = this.beatChanged() && this.getCurrentMeasureBeat() === 0;
    if (change) {
      // console.log("measure changed");
    }
    return change;
  }
}
