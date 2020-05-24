import {
  initAnsi,
  shutdownAnsi,
  consoleSize,
  AnsiScreen,
  updateConsoleSize,
} from "./ansi/ansi.ts";
import { readInput } from "./ansi/input.ts";
import { delay } from "./utils.ts";
import { AnsiColor, BlockElements } from "./ansi/types.ts";

await initAnsi();

const screen = new AnsiScreen();

screen.clearScreen();

screen.color(AnsiColor.Blue).text("Starting test\n");

screen.color(AnsiColor.Blue).text("Console dimensions:");

screen.color(AnsiColor.Black, AnsiColor.White).text(
  `${consoleSize.width}x${consoleSize.height}`,
);

screen.color(AnsiColor.White).text("\n");

screen.apply();

await delay(1000);

const fillColors: AnsiColor[] = [
  AnsiColor.BrightRed,
  AnsiColor.BrightCyan,
  AnsiColor.BrightBlue,
  AnsiColor.BrightGreen,
  AnsiColor.BrightYellow,
];

let frameNumber = 0;

function drawScreen(c: string) {
  screen.border(0, 0, consoleSize.width, consoleSize.height);

  for (let y = 1; y < consoleSize.height - 1; y++) {
    screen.moveCursorTo(1, y);

    for (let x = 1; x < consoleSize.width - 1; x++) {
      screen.color(fillColors[(y + x + frameNumber) % fillColors.length]).text(
        c,
      );
    }
  }

  screen.apply();
}

const totalFrames = 100;
const startTime = performance.now();
let cancel = false;

let fillChar = BlockElements.FullBlock;

for (let i = 0; i < totalFrames && !cancel; i++) {
  if (await updateConsoleSize()) screen.clearScreen();

  drawScreen(fillChar);
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
  screen.clearScreen().color(AnsiColor.Green).text(
    `Time to fill screen ${frameNumber} times: ${endTime -
      startTime}ms, fps:${frameNumber / ((endTime - startTime) / 1000)}\n`,
  ).apply();
}

shutdownAnsi();

Deno.exit();
