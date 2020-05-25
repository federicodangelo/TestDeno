import {
  initAnsi,
  shutdownAnsi,
  clearScreen,
  requestUpdateConsoleSize,
  getConsoleSizeFromInput,
} from "./ansi/ansi.ts";
import { readInput, updateInput } from "./ansi/input.ts";
import { delay } from "./utils.ts";
import { AnsiColor, BlockElements, Size } from "./ansi/types.ts";
import { AnsiContextImpl } from "./ansi/context.ts";

initAnsi();

clearScreen();

const context = new AnsiContextImpl();

const consoleSize = new Size();

requestUpdateConsoleSize();
let tmp = getConsoleSizeFromInput();
while (tmp === null) {
  await delay(10);
  tmp = getConsoleSizeFromInput();
}
consoleSize.copyFrom(tmp);

context.beginDraw(0, 0, consoleSize.width, consoleSize.height);

context.color(AnsiColor.Blue, AnsiColor.Black).text("Starting test\n");

context.color(AnsiColor.Blue, AnsiColor.Black).text("Console dimensions:");

context.color(AnsiColor.Black, AnsiColor.White).text(
  `${consoleSize.width}x${consoleSize.height}`,
);

context.color(AnsiColor.White, AnsiColor.Black).text("\n");

context.endDraw();

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
  context.border(0, 0, consoleSize.width, consoleSize.height);

  for (let y = 1; y < consoleSize.height - 1; y++) {
    context.moveCursorTo(1, y);

    for (let x = 1; x < consoleSize.width - 1; x++) {
      context.color(
        fillColors[(y + x + frameNumber) % fillColors.length],
        AnsiColor.Black,
      ).text(
        c,
      );
    }
  }
}

const totalFrames = 100;
const startTime = performance.now();
let cancel = false;

let fillChar = BlockElements.FullBlock;

for (let i = 0; i < totalFrames && !cancel; i++) {
  context.beginDraw(0, 0, consoleSize.width, consoleSize.height);

  drawScreen(fillChar);

  context.endDraw();

  requestUpdateConsoleSize();
  updateInput();
  const newConsoleSize = getConsoleSizeFromInput();
  if (newConsoleSize !== null) consoleSize.copyFrom(newConsoleSize);
  const input = readInput();
  if (input && input.indexOf("z") >= 0) cancel = true;
  if (input && input.charCodeAt(0) >= 32) {
    //Only visible chars
    fillChar = input[0];
  }
  await delay(1);
  frameNumber++;
}

const endTime = performance.now();

if (!cancel && frameNumber > 0) {
  clearScreen();
  context.beginDraw(0, 0, consoleSize.width, consoleSize.height);
  context.color(AnsiColor.Green, AnsiColor.Black).text(
    `Time to fill screen ${frameNumber} times: ${endTime -
      startTime}ms, fps:${frameNumber / ((endTime - startTime) / 1000)}\n`,
  );
  context.endDraw();
}

shutdownAnsi();

Deno.exit();
