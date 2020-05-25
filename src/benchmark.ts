import {
  initAnsi,
  shutdownAnsi,
  clearScreen,
  requestUpdateConsoleSize,
  getConsoleSizeFromInput,
  getAnsiNativeContext,
} from "./engine/native/ansi.ts";
import { readInput, updateInput } from "./engine/native/input.ts";
import { delay } from "./utils.ts";
import { Color, SpecialChar, Size } from "./engine/types.ts";
import { EngineContextImpl } from "./engine/context.ts";

initAnsi();

clearScreen();

const context = new EngineContextImpl(getAnsiNativeContext());

const consoleSize = new Size();

requestUpdateConsoleSize();
let tmp = getConsoleSizeFromInput();
while (tmp === null) {
  await delay(10);
  tmp = getConsoleSizeFromInput();
}
consoleSize.copyFrom(tmp);

context.beginDraw(0, 0, consoleSize.width, consoleSize.height);

context.color(Color.Blue, Color.Black).text("Starting test\n");

context.color(Color.Blue, Color.Black).text("Console dimensions:");

context.color(Color.Black, Color.White).text(
  `${consoleSize.width}x${consoleSize.height}`,
);

context.color(Color.White, Color.Black).text("\n");

context.endDraw();

await delay(1000);

const fillColors: Color[] = [
  Color.BrightRed,
  Color.BrightCyan,
  Color.BrightBlue,
  Color.BrightGreen,
  Color.BrightYellow,
];

let frameNumber = 0;

function drawScreen(c: number) {
  context.border(0, 0, consoleSize.width, consoleSize.height);

  for (let y = 1; y < consoleSize.height - 1; y++) {
    context.moveCursorTo(1, y);

    for (let x = 1; x < consoleSize.width - 1; x++) {
      context.color(
        fillColors[(y + x + frameNumber) % fillColors.length],
        Color.Black,
      ).specialChar(
        c,
      );
    }
  }
}

const totalFrames = 100;
const startTime = performance.now();
let cancel = false;

let fillChar = SpecialChar.FullBlock;

for (let i = 0; i < totalFrames && !cancel; i++) {
  context.beginDraw(0, 0, consoleSize.width, consoleSize.height);

  drawScreen(fillChar);

  context.endDraw();

  requestUpdateConsoleSize();
  updateInput();
  const newConsoleSize = getConsoleSizeFromInput();
  if (newConsoleSize !== null) consoleSize.copyFrom(newConsoleSize);
  const input = readInput();
  if (input && input.toLowerCase().indexOf("z") >= 0) cancel = true;
  await delay(1);
  frameNumber++;
}

const endTime = performance.now();

if (!cancel && frameNumber > 0) {
  clearScreen();
  context.beginDraw(0, 0, consoleSize.width, consoleSize.height);
  context.color(Color.Green, Color.Black).text(
    `Time to fill screen ${frameNumber} times: ${endTime -
      startTime}ms, fps:${frameNumber / ((endTime - startTime) / 1000)}\n`,
  );
  context.endDraw();
}

shutdownAnsi();

Deno.exit();
