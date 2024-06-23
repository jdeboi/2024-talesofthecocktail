var ckf = new CodeKeyframes({
  audioPath: "/assets/Lalinea_Midnight_Dreams.mp3",
  videoElement: document.getElementById("some-video"), // if you want to sync to a video instead of an mp3
  editorOpen: false,
  waveColor: "#3AEAD2", // wave color right of the playhead
  progressColor: "#0c9fa7", // wave color left of the playhead
  bgColor: "#222", // color behind waveform
  label: "Text that appears above the waveform",
  autoplay: false,
  keyframes: [], // paste in here after exporting keyframes,

  onCanPlay: function () {
    console.log("onCanPlay triggered");
  },

  onPlay: function () {
    console.log("onPlay triggered");
    loop();
  },

  onPause: function () {
    noLoop();
  },

  onFrame: function () {
    // console.log('onFrame triggered, do/render something')
    // draw();
    // loop()
  },
});