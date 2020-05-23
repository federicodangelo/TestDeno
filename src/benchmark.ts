import {
  initAnsi,
  shutdownAnsi,
  moveCursorTo,
  clearScreen,
  writeColor,
  AnsiColor,
  getColor,
  writeAnsi,
  consoleSize,
} from "./ansi.ts";
import { delay } from "./utils.ts";
import { readInput } from "./input.ts";

await initAnsi();

clearScreen();

writeColor("Starting test\n", AnsiColor.Blue);

writeColor(`Console dimensions: `, AnsiColor.Blue);

writeColor(
  `${consoleSize.width}x${consoleSize.height}`,
  AnsiColor.Black,
  AnsiColor.White
);

writeColor("\n", AnsiColor.White);

await delay(1000);

const fillColors: AnsiColor[] = [
  AnsiColor.BrightRed,
  AnsiColor.BrightCyan,
  AnsiColor.BrightBlue,
  AnsiColor.BrightGreen,
  AnsiColor.BrightYellow,
];

let frameNumber = 0;

function fillScreen(c: string) {
  moveCursorTo(0, 0);

  let screen = "";

  for (let y = 0; y < consoleSize.height; y++) {
    let line = "";

    for (let x = 0; x < consoleSize.width; x++) {
      line += getColor(
        c,
        fillColors[(y + x + frameNumber) % fillColors.length],
        AnsiColor.Black
      );
    }

    screen += line;
  }

  writeAnsi(screen, true);
}

const totalFrames = 100;
const startTime = performance.now();
let cancel = false;

let fillChar = "*";

for (let i = 0; i < totalFrames && !cancel; i++) {
  fillScreen(fillChar);
  const input = readInput();
  if (input) {
    const code = input.charCodeAt(0);
    if (code >= 32) {
      //Only visible chars
      fillChar = input[0];
      if (fillChar === "z") cancel = true;
    }
  }
  await delay(1);
  frameNumber++;
}
const endTime = performance.now();

if (!cancel && frameNumber > 0) {
  clearScreen();
  writeColor(
    `Time to fill screen ${frameNumber} times: ${endTime - startTime}ms, fps:${
      frameNumber / ((endTime - startTime) / 1000)
    }\n`,
    AnsiColor.Green
  );
}

shutdownAnsi();

Deno.exit();
