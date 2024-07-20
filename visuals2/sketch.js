let socket;

// projection mapping objects
let pMapper;
let quadMap1;
let quadMap2;

let myFont;
const lineMaps = [];

const NUM_STEPS = 4;

function preload() {
  playlist = new Playlist();
  playlist.addSong(new Song("Lalinea_Midnight_Dreams3", 85, 4, 0.5));
  myFont = loadFont("/assets/Roboto.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(myFont);

  pMapper = createProjectionMapper(this);

  quadMap1 = pMapper.createQuadMap(windowWidth, windowHeight);

  for (let i = 0; i < NUM_STEPS; i++) {
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
    text("visuals 2; hit spacebar to play", -50, 0);
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

function displayFFTLine() {
  let beat = playlist.getCurrentMeasureBeat();

  if (frameCount % 4 == 0) {
    spectrum = playlist.fft.analyze();
  }
  let numPeriods = 1;
  let numSeconds = playlist.getSecondsPerBeat();

  if (spectrum.length == 0) return;

  quadMap1.displaySketch((pg) => {
    // pg.clear();
    pg.push();
    // pg.background(0, 10);
    pg.stroke(255);
    pg.rectMode(CENTER);
    pg.noFill();

    let spacing = quadMap1.height / NUM_STEPS;
    let xSpace = 10; // + 5 * sin(millis() / 2000);
    pg.translate(0, spacing / 2);
    for (let y = 0; y <= quadMap1.height; y += spacing) {
      pg.strokeWeight(4);

      for (let i = 0; i < quadMap1.width / 2; i += xSpace) {
        let x0 = map(i, 0, quadMap1.width / 2, quadMap1.width / 2, 0);
        let x1 = map(
          i,
          0,
          quadMap1.width / 2,
          quadMap1.width / 2,
          quadMap1.width
        );

        // let strokeC = 100;

        let cVal =
          pMapper.getOscillator(numSeconds * 4, i / 80 + y / 80) * 170 + 85;
        let strokeC = cVal;
        if (beat % 2 == 0) {
          strokeC = 255 - cVal;
        }

        pg.stroke(255); // constrain(strokeC, 100, 255));
        let h = constrain(
          map(spectrum[i * 2], 0, 255, 0, spacing * 2),
          2,
          spacing * 0.8
        );

        if (beat == 1 || beat == 3) {
          pg.line(x0, y + h / 2, x0, y - h / 2);
          pg.line(x1, y + h / 2, x1, y - h / 2);
        } else if (beat == 0) {
          pg.line(x0, y + h / 2, x0, y + h * 0.8 - h / 2);
          pg.line(x1, y + h / 2, x1, y - h / 2);
        } else if (beat == 2) {
          pg.line(x0, y + h / 2, x0, y + h * 0.8 - h / 2);
          pg.line(x1, y + h / 2, x1, y + h * 0.8 - h / 2);
        }

        // if (beat == 0) {
        //   pg.line(x0, y + h / 2, x0, y - h / 2);
        //   pg.line(x1, y + h / 2, x1, y + h * 0.8 - h / 2);
        // } else if (beat == 1) {
        //   pg.line(x0, y + h / 2, x0, y + h * 0.8 - h / 2);
        //   pg.line(x1, y + h / 2, x1, y - h / 2);
        // } else if (beat == 2) {
        //   pg.line(x0, y + h / 2, x0, y + h * 0.8 - h / 2);
        //   pg.line(x1, y + h / 2, x1, y + h * 0.8 - h / 2);
        // } else {
        //   pg.line(x0, y + h / 2, x0, y - h / 2);
        //   pg.line(x1, y + h / 2, x1, y - h / 2);
        // }
      }
    }
    pg.pop();
  });
}
