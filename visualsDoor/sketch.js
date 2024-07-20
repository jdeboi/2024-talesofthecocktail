let socket;

// projection mapping objects
let pMapper;
let quadMapWall;
let quadMapDoor;
let quadLogo;

let myFont;
let logo;
let door;
const lineMaps = [];

function preload() {
  playlist = new Playlist();
  playlist.addSong(new Song("Lalinea_Midnight_Dreams2", 85, 4, 0.5));
  myFont = loadFont("../assets/Roboto.ttf");
  logo = loadImage("../assets/logo.png");
  door = loadImage("../assets/door.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(myFont);

  pMapper = createProjectionMapper(this);

  quadMapWall = pMapper.createQuadMap(width, height);
  quadMapDoor = pMapper.createQuadMap(360, 800);

  quadLogo = pMapper.createQuadMap(300, 80);

  // for (let i = 0; i < 40; i++) {
  //   let lineMap = pMapper.createLineMap();
  //   lineMaps.push(lineMap);
  // }

  pMapper.load("maps/map.json", () => {
    // for (let i = 0; i < lineMaps.length; i++) {
    //   let lineMap = lineMaps[i];
    //   lineMap.lineW = map(i, 0, 9, 2, 30);
    // }
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
  push();
  translate(-width / 2, -height / 2);
  image(door, 0, 0, width, door.height * (width / door.width));
  pop();

  playlist.display();

  if (!playlist.getIsPlaying()) {
    text("visuals door; hit spacebar to play", -50, 0);
  }

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

function displayLogo() {
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

function setSpectrum() {
  if (frameCount % 4 == 0) {
    spectrum = playlist.fft.analyze();
  }
}

function displayLine(pg, x = 0, y = 0, w = 200, h = 20, rot = 0) {
  pg.push();
  pg.rotate(rot);
  // pg.translate(x, -(y + h));
  let numPeriods = 1;

  let numSeconds = playlist.getSecondsPerBeat();
  let xSpace = 10; // + 5 * sin(millis() / 2000);
  let beat = playlist.getCurrentMeasureBeat();

  pg.strokeWeight(4);

  for (let i = 0; i < w / 2; i += xSpace) {
    let x0 = map(i, 0, w / 2, w / 2, 0);
    let x1 = map(i, 0, w / 2, w / 2, w);

    let cVal =
      pMapper.getOscillator(numSeconds * 4, i / 80 + h / 80) * 170 + 85;
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

function displayFFTLine2() {
  const numLines = 30;
  let secPerBeat = playlist.getSecondsPerBeat();

  let beat = playlist.getCurrentMeasureBeat();

  displayLogo();

  quadMapWall.displaySketch((pg) => {
    // pg.clear();
    pg.push();
    // pg.background(0, 10);
    //pg.rectMode(CENTER);
    pg.noFill();

    for (let i = 0; i < numLines; i++) {
      let numPeriods = 1;
      let spacing = 50;
      let maxW = spacing * numLines;

      let dSpace = spacing * i + frameCount;
      dSpace %= spacing * numLines;
      let w = maxW - (36 + dSpace);
      let h = (80 * w) / 36;
      let x = 0;
      let y = height - h;

      let offset = map(i, 0, numLines, 0, 2 * PI * numPeriods);
      let percent = pMapper.getOscillator(secPerBeat * 4, offset);
      // let c = color(percent * 255);
      let c = color(map(w, 0, maxW * 0.8, 255, 0, true));
      pg.stroke(c);
      pg.strokeWeight(percent * 20);

      pg.rect(x, y, w, h);
    }

    pg.pop();
  });
}

function displayFFTLine() {
  setSpectrum();
  if (spectrum.length == 0) return;

  displayLogo();

  quadMapDoor.displaySketch((pg) => {
    pg.clear();
    pg.push();
    //displayLine(pg, 0, 0, quadMapDoor.height, 200, true);

    pg.pop();
  });

  quadMapWall.displaySketch((pg) => {
    const numLines = 30;
    pg.clear();
    pg.push();
    pg.translate(0, quadMapWall.height / 2);
    for (let i = 0; i < numLines; i++) {
      let h = 30;
      let y = i * h;
      let rot = map(i, 0, numLines, -PI, PI);
      displayLine(pg, 0, y, quadMapWall.width / 2, h, rot);
    }
    pg.pop();
  });
}
