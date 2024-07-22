let socket;

// projection mapping objects
let pMapper;
let quadMap1;
let quadMapScript;

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

  quadMap1 = pMapper.createQuadMap(windowWidth, windowHeight);
  quadMapScript = pMapper.createQuadMap(900, 500);

  // for (let i = 0; i < NUM_STEPS; i++) {
  //   let lineMap = pMapper.createLineMap();
  //   lineMaps.push(lineMap);
  // }

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
  if (mouseIsPressed) {
    scale(-1, -1);
  }

  playlist.display();

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
  let cVal = pMapper.getOscillator(numSeconds * 4, 0);

  quadMapScript.displaySketch((pg) => {
    pg.textFont(scriptFont, 500);
    pg.push();
    pg.clear();
    pg.background(0);
    pg.push();
    pg.noStroke();
    pg.fill(255, cVal * 255);
    pg.scale(-1, -1);
    pg.translate((-quadMapScript.width * 19) / 20, -quadMapScript.height / 2);
    pg.text("exit", 20, 130);
    pg.textFont(scriptFont, 140);
    pg.text("Sweet Dreams...", 120, 280);

    pg.pop();

    //pg.image(logo, 0, -2, 1000 * factor, 331 * factor);
    // pg.noStroke();
    // pg.fill(0, cVal * 255);
    // pg.rect(0, 0, pg.width, pg.height);
    pg.pop();
  });
}

function displayFFTLine() {
  setSpectrum();
  if (spectrum.length == 0) return;

  quadMap1.displaySketch((pg) => {
    pg.clear();
    pg.push();
    let h = 100;
    displayLine(pg, 0, h / 2, quadMap1.width, h, mouseX / 1000);
    pg.pop();

    // const numLines = 36;
    // let h = quadMap1.height / numLines;
    // pg.clear();
    // pg.push();

    // for (let i = 0; i < numLines; i++) {
    //   let y = i * h;
    //   displayLine(pg, 0, y, quadMap1.width, h);
    // }
    // pg.pop();

    // pg.clear();
    // pg.push();
    // pg.translate(quadMap1.width / 2, quadMap1.height / 2);
    // for (let i = 0; i < numLines; i++) {
    //   let h = 30;
    //   let y = i * h;
    //   let rot = map(i, 0, numLines, -PI, PI);
    //   displayLine(pg, 0, 0, quadMap1.width / 4, h, rot);
    // }
    // pg.pop();
  });

  displayScript();
}
