let modeTemp = 0;
let currentMode = 0;
let spectrum = [];
const modes = [
  { name: "FFTLine", mode: modeTemp++ },
  { name: "CenterRects", mode: modeTemp++ },
  { name: "SinCenter", mode: modeTemp++ },
  { name: "Grid", mode: modeTemp++ },
  { name: "FFT", mode: modeTemp++ },
  { name: "PulseVertical", mode: modeTemp++ },
  { name: "PulseHorizontal", mode: modeTemp++ },
  { name: "PulseAll", mode: modeTemp++ },
];

// const MODE_SNAKE = modeTemp++;

// const MODE_SHOOTING = modeTemp++;
// const MODE_BOUNCE = modeTemp++;
// const MODE_WAVES = modeTemp++;
// const MODE_TWINKLE = modeTemp++;
// const MODE_SUBWAVE = modeTemp++;
// const MODE_PERLIN = modeTemp++;
// const MODE_DIFFUSION = modeTemp++;
// const MODE_RECTS_TRON = modeTemp++;
// const MODE_PARTICLE = modeTemp++;
// const MODE_LINE_LAYERS = modeTemp++;

const NUM_MODES = modeTemp;

let lastModeChangeTime = 0;

function cycleMode(dt) {
  if (millis() - lastModeChangeTime > dt) {
    lastModeChangeTime = millis();
    nextMode();
  }
}

function nextMode() {
  currentMode = (currentMode + 1) % NUM_MODES;
  console.log(modes[currentMode].name);
}

function displayMode() {
  if (playlist.getMeasureChanged()) {
    nextMode();
  }

  const modeName = modes[currentMode].name;

  switch (modeName) {
    case "FFTLine":
      displayFFTLine();
      break;
    case "PulseVertical":
      displayPulseVertical();
      break;
    case "PulseHorizontal":
      displayHorizontalPulse();
      break;
    case "PulseAll":
      displayPercent();
      break;
    case "FFT":
      displayFFT();
      break;
    case "CenterRects":
      displayCenterRects();
      break;
    // case MODE_SNAKE:
    //     displaySnake();
    //     break;
    case "Grid":
      displayGrid();
      break;
    case "SinCenter":
      displaySinCenter();
      break;
    // case MODE_SHOOTING:
    //     displayShooting();
    //     break;
    // case MODE_BOUNCE:
    //     displayBounce();
    //     break;
    // case MODE_WAVES:
    //     displayWaves();
    //     break;
    // case MODE_TWINKLE:
    //     displayTwinkle();
    //     break;
    // case MODE_SUBWAVE:
    //     displaySubwave();
    //     break;
    // case MODE_PERLIN:
    //     displayPerlin();
    //     break;
    // case MODE_DIFFUSION:
    //     displayDiffusion();
    //     break;
    // case MODE_RECTS_TRON:
    //     displayRectsTron();
    //     break;
    // case MODE_PARTICLE:
    //     displayParticle();
    //     break;
    // case MODE_LINE_LAYERS:
    //     displayLineLayers();
    //     break;
    default:
      displayPulseVertical();
      break;
  }
}

function displayPulseVertical() {
  let beat = playlist.getCurrentMeasureBeat();
  let secPerBeat = playlist.getSecondsPerBeat();
  if (beat % 2 === 0) {
    setPulseVertical(1, 2, secPerBeat);
  } else {
    setPulseVertical(-1, 2, secPerBeat);
  }
}

function displayHorizontalPulse() {
  let beat = playlist.getCurrentMeasureBeat();
  let secPerBeat = playlist.getSecondsPerBeat();
  if (beat % 2 === 0) {
    setPulseHorizontal(1, 1, secPerBeat);
  } else {
    setPulseHorizontal(-1, 1, secPerBeat);
  }
}

function displayPercent() {
  let beat = playlist.getBeatPercent();
  let numSeconds = playlist.getSecondsPerBeat();
  let numPeriods = 1;
  let percent = pMapper.getOscillator(numSeconds, 0);
  setColorPercent(percent);
}

function displayCenterRects() {
  let numSeconds = playlist.getSecondsPerBeat();

  quadMap.displaySketch((pg) => {
    // pg.clear();
    pg.push();
    // pg.background(0, 10);
    pg.stroke(255);
    pg.rectMode(CENTER);
    pg.noFill();
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        pg.strokeWeight(pMapper.getOscillator(numSeconds, 0) * 3 + 1);
        pg.stroke(
          pMapper.getOscillator(numSeconds * 4, (x + y) / 20) * 200 + 55
        );
        let dxs = 100 * pMapper.getOscillator(numSeconds * 4, (x + y) / 20);
        let w = x * 80 + dxs;
        let h = y * 100 + dxs * 1.5;
        pg.rect(quadMap.width / 2, quadMap.height / 2, w, h);
        pg.rect(quadMap.width / 2, quadMap.height / 2, 300, h);
      }
    }
    pg.pop();
  });
}

function displayFFTLine() {
  let beat = playlist.getCurrentMeasureBeat();

  if (frameCount % 4 == 0) spectrum = playlist.fft.analyze();
  let numPeriods = 1;
  let numSeconds = playlist.getSecondsPerBeat();

  if (spectrum.length == 0) return;
  quadMap.displaySketch((pg) => {
    // pg.clear();
    pg.push();
    // pg.background(0, 10);
    pg.stroke(255);
    pg.rectMode(CENTER);
    pg.noFill();
    let spacing = 20;
    for (let y = 0; y < quadMap.height; y += spacing) {
      pg.strokeWeight(1);

      for (let i = 0; i < quadMap.width / 2; i += 2) {
        let x0 = map(i, 0, quadMap.width / 2, quadMap.width / 2, 0);
        let x1 = map(i, 0, quadMap.width / 2, quadMap.width / 2, quadMap.width);

        let strokeC =
          pMapper.getOscillator(numSeconds, i / 80 + y / 80) * 170 + 85;
        pg.stroke(constrain(strokeC, 85, 255));
        let h = constrain(
          map(spectrum[i * 2], 0, 255, 0, spacing * 2),
          2,
          spacing * 0.8
        );

        if (beat == 0) {
          pg.line(x0, y + h / 2, x0, y - h / 2);
          pg.line(x1, y + h / 2, x1, y + h * 0.8 - h / 2);
        } else if (beat == 1) {
          pg.line(x0, y + h / 2, x0, y + h * 0.8 - h / 2);
          pg.line(x1, y + h / 2, x1, y - h / 2);
        } else if (beat == 2) {
          pg.line(x0, y + h / 2, x0, y + h * 0.8 - h / 2);
          pg.line(x1, y + h / 2, x1, y + h * 0.8 - h / 2);
        } else {
          pg.line(x0, y + h / 2, x0, y - h / 2);
          pg.line(x1, y + h / 2, x1, y - h / 2);
        }
      }
    }
    pg.pop();
  });
}

function displaySinCenter() {
  let dir = 1;
  let numSeconds = playlist.getSecondsPerBeat();
  let beat = playlist.getCurrentMeasureBeat();
  let numPeriods = 1;
  for (let i = 0; i < lineMaps.length; i++) {
    let offset = map(i, 0, lineMaps.length - 1, 0, 2 * PI * numPeriods);
    if (beat % 2 == 0) {
      offset = map(i, 0, lineMaps.length - 1, 2 * PI * numPeriods, 0);
    }
    let percent = pMapper.getOscillator(numSeconds, offset);
    let percent2 = pMapper.getOscillator(numSeconds, offset);
    lineMaps[i].displayCenterPulse(percent, color(percent2 * 255));
  }
}

function getOscillator(dir, i, numSeconds, offset) {
  let numPeriods = 1;
  let offset2 = map(i, 0, lineMaps.length - 1, 0, 2 * PI * numPeriods);
}

function setColorPercent(percent) {
  for (let i = 0; i < lineMaps.length; i++) {
    let c = color(percent * 255);

    lineMaps[i].display(c);
  }
}
function setPulseVertical(dir = 1, numPeriods = 1, numSeconds = 3) {
  for (let i = 0; i < lineMaps.length; i++) {
    let offset = map(i, 0, lineMaps.length - 1, 0, 2 * PI * numPeriods);
    if (dir < 0) {
      offset = map(i, 0, lineMaps.length - 1, 2 * PI * numPeriods, 0);
    }
    let percent = pMapper.getOscillator(numSeconds, offset);
    let c = color(percent * 255);

    lineMaps[i].display(c);
  }
}

function setPulseHorizontal(dir = 1, numPeriods = 1, numSeconds = 3) {
  for (let i = 0; i < lineMaps.length; i++) {
    let offset = map(i, 0, lineMaps.length - 1, 0, 2 * PI * numPeriods);
    if (dir < 0) {
      offset = map(i, 0, lineMaps.length - 1, 2 * PI * numPeriods, 0);
    }
    let percent = pMapper.getOscillator(numSeconds, offset);
    let c = color(percent * 255);

    lineMaps[i].displayPercent(percent, c);
  }
}

function displayGrid() {
  quadMap.displaySketch((pg) => {
    pg.clear();
    pg.push();
    pg.background(0);
    pg.stroke(255);

    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        let dx = 30;
        pg.strokeWeight((x % 10) + 3 * sin(millis() / 4000));
        let _x = x * 30 + x * 10 * sin(millis() / 1000);
        let _y = y * 30 + y * 10 * sin(millis() / 1000);
        pg.line(_x, 0, _x, height);
        pg.line(0, _y, width, _y);
      }
    }
    pg.pop();
  });
}
function displayFFT() {
  let spectrum = playlist.fft.analyze();
  let numPeriods = 1;
  let numSeconds = playlist.getSecondsPerBeat();
  for (let i = 0; i < lineMaps.length; i++) {
    let offset = map(i, 0, lineMaps.length - 1, 0, 2 * PI * numPeriods);

    let spectrumIndex = Math.floor(
      map(i, 0, lineMaps.length - 1, 0, spectrum.length - 1)
    );

    let percent = spectrum[i * 2] / 255; // Normalize the spectrum value to a range of 0 to 1
    //let c = color(percent * 255); // Use the percent value to set the color
    let percent2 = pMapper.getOscillator(numSeconds, offset);
    let c = color(percent2 * 255);
    lineMaps[i].displayPercent(percent, c); // Update the line map with the percent and color
  }
}
