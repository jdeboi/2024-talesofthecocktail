let socket;

// projection mapping objects
let pMapper;
let quadMap1;
let quadMap2;

let myFont;
const lineMaps = [];

function preload() {
  playlist = new Playlist();
  playlist.addSong(new Song("Lalinea_Midnight_Dreams3", 85, 4, 0.5));
  myFont = loadFont("assets/Roboto.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(myFont);

  pMapper = createProjectionMapper(this);

  quadMap1 = pMapper.createQuadMap(800, windowHeight - 100);
  quadMap2 = pMapper.createQuadMap(800, windowHeight - 100);

  for (let i = 0; i < 40; i++) {
    let lineMap = pMapper.createLineMap();
    lineMaps.push(lineMap);
  }

  pMapper.load("maps/map.json", () => {
    for (let i = 0; i < lineMaps.length; i++) {
      let lineMap = lineMaps[i];
      lineMap.lineW = map(i, 0, 9, 2, 30);
    }
  });

  // Connect to the socket server using the Vercel URL
  socket = io("https://p5-cocktales-f5f9910ea06a.herokuapp.com/", {
    transports: ["websocket"],
  }); // Replace with your Vercel URL
  // socket = io("http://localhost:3000/", { transports: ["websocket"] });

  // Listen for the start event
  socket.on("start", () => {
    console.log("Start command received via socket");
    playlist.resetPlay(); // Start the playlist
  });

  socket.on("stop", () => {
    console.log("stop command received via socket");
    playlist.stop(); // Start the playlist
  });
}

function draw() {
  background(0);

  playlist.display();

  if (!playlist.getIsPlaying()) {
    text("hit spacebar to play", -50, 0);
  }

  displayFrameRate();
}

function keyPressed() {
  switch (key) {
    case " ":
      playlist.togglePlay();
      break;
    case "c":
      pMapper.toggleCalibration();
      break;
    case "f":
      let fs = fullscreen();
      fullscreen(!fs);
      break;
    case "l":
      pMapper.load("maps/map.json");
      break;
    case "s":
      pMapper.save("map.json");
      break;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function displayFrameRate() {
  fill(255);
  noStroke();
  text(round(frameRate()), -width / 2 + 15, -height / 2 + 50);
}
