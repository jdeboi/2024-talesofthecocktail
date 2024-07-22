let socket;

// projection mapping objects
let pMapper;
let quadMapWall;
let quadMapDoor;
let quadLogo;

let myFont;
let logo;
let door;
let gifImg;
const lineMaps = [];
let isPlaying = false;

function preload() {
  playlist = new Playlist();
  playlist.addSong(new Song("Lalinea_Midnight_Dreams2", 85, 4, 0.5));
  myFont = loadFont("../assets/Roboto.ttf");
  logo = loadImage("../assets/logo.png");
  door = loadImage("../assets/door.jpg");
  video = createVideo(["../assets/wormhole.mp4"]);
  video.hide();
  // gifImg = createImg("../assets/wormhole1.gif");
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
  push();
  translate(-width / 2, -height / 2);
  //image(door, 0, 0, width, door.height * (width / door.width));
  pop();

  playlist.display();

  // if (!playlist.getIsPlaying()) {
  //   text("visuals door; hit spacebar to play", -50, 0);
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

function setSpectrum() {
  if (frameCount % 4 == 0) {
    spectrum = playlist.fft.analyze();
  }
}

function displayLine(pg, x = 0, y = 0, w = 200, h = 20, rot = 0) {
  pg.push();
  pg.translate(x, y);
  pg.rotate(rot);
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

function displayRectWall() {
  const numLines = 30;
  let secPerBeat = playlist.getSecondsPerBeat();

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

function displayDoorRect(pg) {
  pg.clear();
  pg.push();
  const numLines = 20;
  for (let i = 0; i < numLines; i++) {
    let w = map(i, 0, numLines, 10, quadMapDoor.width);
    let h = (w / quadMapDoor.width) * quadMapDoor.height;
    let y0 = quadMapDoor.height / 2 - h / 2;
    let y1 = quadMapDoor.height / 2 + h / 2;
    let x0 = quadMapDoor.width / 2 - w / 2;
    let x1 = quadMapDoor.width / 2 + w / 2;
    displayLine(pg, x0, y0, w, h, 0);
    displayLine(pg, x0, y1, w, h, 0);
    // displayLine(pg, 0, 0, quadMapDoor.height, 200, true);
    // displayLine(pg, 0, 0, quadMapDoor.height, 200, true);
  }

  pg.pop();
}

function displayFFTLine() {
  setSpectrum();
  if (spectrum.length == 0) return;

  displayScript();

  // displayRectWall();

  // if (isPlaying) {
  //   quadMapDoor.displayTexture(
  //     video,
  //     0,
  //     0,
  //     quadMapDoor.width,
  //     quadMapDoor.height
  //   );
  // }

  // quadMapDoor.displaySketch((pg) => {
  //   displayDoorRect(pg);
  // });

  quadMapWall.displaySketch((pg) => {
    // displayLine(pg, 0, 0, quadMapDoor.height, 200, 0);
    const numLines = 36;
    let h = quadMapWall.height / numLines;
    pg.clear();
    pg.push();

    for (let i = 0; i < numLines; i++) {
      let y = i * h;
      displayLine(pg, 0, y, quadMapWall.width, h);
    }
    pg.pop();
  });

  quadMapDoor.displaySketch((pg) => {
    pg.clear();
    pg.push();

    if (isPlaying) {
      let h = quadMapDoor.height;
      let w = (h * video.width) / video.height;
      let x = (quadMapDoor.width - w) / 2;
      pg.image(video, x, 0, w, h);
    }

    pg.noFill();
    pg.strokeWeight(20);
    pg.stroke(255);
    let space = 10;
    pg.rect(
      0,
      0,
      (quadMapDoor.width * 19) / 20,
      (quadMapDoor.height * 19) / 20
    );
    pg.pop();
  });
}

function mousePressed() {
  isPlaying = true;
  video.loop();
}
