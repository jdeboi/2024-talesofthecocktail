let socket;

// projection mapping objects
let pMapper;

let quadStairs;
let quadSmall;
let quadLogo;

let myFont;
let logo;
const lineMaps = [];

function preload() {
  playlist = new Playlist();
  playlist.addSong(new Song("Lalinea_Midnight_Dreams3", 85, 4, 0.5));
  myFont = loadFont("../assets/Roboto.ttf");
  logo = loadImage("../assets/logo.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(myFont);

  pMapper = createProjectionMapper(this);

  quadStairs = pMapper.createQuadMap(800, windowHeight - 100);
  quadSmall = pMapper.createQuadMap(800, 400);
  quadLogo = pMapper.createQuadMap(300, 80);

  for (let i = 0; i < 2; i++) {
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

  // if (!playlist.getIsPlaying()) {
  //   text("visuals 1; hit spacebar to play", -50, 0);
  // }

  // displayFrameRate();
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

function displayScript() {
  let numSeconds = playlist.getSecondsPerBeat();
  quadLogo.displaySketch((pg) => {
    pg.push();
    pg.clear();

    let factor = 0.25;
    let cVal = pMapper.getOscillator(numSeconds * 4, 0);

    pg.image(logo, 0, -2, 1000 * factor, 331 * factor);
    pg.noStroke();
    pg.fill(0, cVal * 255);
    pg.rect(0, 0, pg.width, pg.height);
    pg.pop();
  });
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

    let cVal =
      pMapper.getOscillator(numSeconds * 4, i / 80 + y / 80) * 170 + 85;
    let strokeC = cVal;
    if (beat % 2 == 0) {
      strokeC = 255 - cVal;
    }

    pg.stroke(constrain(strokeC, 100, 255));
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

function displayFFTLine() {
  setSpectrum();
  if (spectrum.length == 0) return;

  displayScript();

  quadStairs.displaySketch((pg) => {
    const numLines = 36;
    let h = quadStairs.height / numLines;
    pg.clear();
    pg.push();

    for (let i = 0; i < numLines; i++) {
      let y = i * h;
      displayLine(pg, 0, y, quadStairs.width, h);
    }
    pg.pop();
  });

  quadSmall.displaySketch((pg) => {
    const numLines = 4;
    let h = quadSmall.height / numLines;
    pg.clear();
    pg.push();
    pg.translate(0, 0);
    for (let i = 0; i < numLines; i++) {
      let y = i * h;
      displayLine(pg, 0, y, quadSmall.width, h);
    }
    pg.pop();
  });
}
