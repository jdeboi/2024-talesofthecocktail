let socket;

// projection mapping objects
let pMapper;
let quadMap1;
let quadMapScript;
let quadOutline;
let isFlipped = false;
let isShowingFrameRate = false;
let myFont;
let scriptFont;
const lineMaps = [];

const NUM_STEPS = 4;

function preload() {
  playlist = new Playlist();
  playlist.addSong(new Song("Lalinea_Midnight_Dreams2", 85, 4, 0.5));
  myFont = loadFont("../assets/Roboto.ttf");

  logo = loadImage("../assets/logo.png");
  scriptFont = loadFont("../assets/BacklashScript.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  pMapper = createProjectionMapper(this);

  // quadOutline = pMapper.createQuadMap(1200, 800);

  quadMap1 = pMapper.createQuadMap(800, 800);
  quadMapScript = pMapper.createQuadMap(900, 500);

  pMapper.load("maps/map.json", () => {});

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
  if (isFlipped) {
    scale(-1, -1);
  }

  playlist.display();

  if (isShowingFrameRate) {
    displayFrameRate();
  }
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
    case "p":
      isFlipped = !isFlipped;
      break;
    case "r":
      isShowingFrameRate = !isShowingFrameRate;
      break;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function displayFrameRate() {
  textFont(myFont);
  fill(255);
  noStroke();
  text(round(frameRate()), -width / 2 + 15, -height / 2 + 50);
}

function displayLine(pg, x = 0, y = 0, w = 200, h = 20, rot = 0) {
  pg.push();

  pg.rotate(rot);
  pg.translate(x, y);
  let numPeriods = 1;

  let numSeconds = playlist.getSecondsPerBeat();
  let xSpace = 10; // + 5 * sin(millis() / 2000);
  let beat = playlist.getCurrentMeasureBeat();

  pg.strokeWeight(4);

  for (let i = 0; i < w / 2; i += xSpace) {
    let x0 = map(i, 0, w / 2, w / 2, 0);
    let x1 = map(i, 0, w / 2, w / 2, w);
    if (!spectrum[i * 2]) {
      spectrum[i * 2] = 0;
    }

    let cVal =
      pMapper.getOscillator(numSeconds * 4, i / 80 + h / 80) * 170 + 85;
    let strokeC = cVal;
    if (beat % 2 == 0) {
      strokeC = 255 - cVal;
    }

    strokeC = constrain(strokeC, 100, 255);

    let startOut = 600;
    let endOut = 900;
    if (y > startOut) {
      strokeC = map(y, startOut, endOut, strokeC, 0, true);
    }
    pg.stroke(strokeC);

    let scaleHFactor = map(h, 20, 400, 2, 1, true);
    let hLine = constrain(
      map(spectrum[i * 2], 0, 255, 0, h * scaleHFactor),
      2,
      h * 0.8
    );

    if (beat == 1 || beat == 3) {
      pg.line(x0, hLine / 2, x0, -hLine / 2);
      pg.line(x1, hLine / 2, x1, -hLine / 2);
    } else if (beat == 0) {
      pg.line(x0, hLine / 2, x0, hLine * 0.8 - hLine / 2);
      pg.line(x1, hLine / 2, x1, -hLine / 2);
    } else if (beat == 2) {
      pg.line(x0, hLine / 2, x0, hLine * 0.8 - hLine / 2);
      pg.line(x1, hLine / 2, x1, hLine * 0.8 - hLine / 2);
    }
  }
  pg.pop();
}

function setSpectrum() {
  if (frameCount % 4 == 0) {
    spectrum = playlist.fft.analyze();
  }
}

function displayScript() {
  let numSeconds = playlist.getSecondsPerBeat();

  quadMapScript.displaySketch((pg) => {
    pg.textFont(scriptFont, 500);
    pg.push();
    pg.clear();
    // pg.background(0);
    pg.push();
    pg.noStroke();
    pg.fill(255); //, cVal * 255
    pg.scale(-1, -1);
    pg.translate((-quadMapScript.width * 19) / 20, -quadMapScript.height / 2);
    pg.text("exit", 20, 90);
    pg.textFont(scriptFont, 140);
    pg.text("Sweet Dreams...", 120, 240);

    pg.pop();

    for (let i = 0; i < quadMapScript.width; i++) {
      let cVal = pMapper.getOscillator(numSeconds * 2, i / 200);

      pg.strokeWeight(1);
      pg.stroke(0, cVal * 255);
      pg.line(i, 0, i, quadMapScript.height);
    }
    pg.pop();
  });
}

function displayFFTLine() {
  setSpectrum();
  if (spectrum.length == 0) return;

  displayScript();
  quadMap1.displaySketch((pg) => {
    const numLines = 36;
    pg.clear();
    pg.push();
    pg.translate(quadMap1.width / 2, quadMap1.height / 2);
    for (let i = 0; i < numLines; i++) {
      let h = 30;
      let y = i * h;
      let rot = map(i, 0, numLines, -PI, PI);
      displayLine(pg, 0, 0, (quadMap1.width / 2) * (18 / 20), h, rot);
    }
    pg.pop();
  });
}
