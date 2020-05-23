import {
  initAnsi,
  shutdownAnsi,
  drawClearScreen,
  drawColorText,
  AnsiColor,
  getColorText,
  consoleSize,
  BlockElements,
  getMoveCursorTo,
  drawBox,
  AsciiBuffer,
  drawAsciiBuffer,
} from "./ansi.ts";
import { delay } from "./utils.ts";
import { readInput } from "./input.ts";

await initAnsi();

drawClearScreen();

drawColorText("Starting test\n", AnsiColor.Blue);

drawColorText(`Console dimensions: `, AnsiColor.Blue);

drawColorText(
  `${consoleSize.width}x${consoleSize.height}`,
  AnsiColor.Black,
  AnsiColor.White,
);

drawColorText("\n", AnsiColor.White);

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
  drawBox(0, 0, consoleSize.width, consoleSize.height);

  let screen = new AsciiBuffer(8192);

  for (let y = 1; y < consoleSize.height - 1; y++) {
    screen.add(getMoveCursorTo(1, y));

    for (let x = 1; x < consoleSize.width - 1; x++) {
      screen.add(getColorText(
        c,
        fillColors[(y + x + frameNumber) % fillColors.length],
        AnsiColor.Black,
      ));
    }
  }

  drawAsciiBuffer(screen);
}

const totalFrames = 100;
const startTime = performance.now();
let cancel = false;

let fillChar = BlockElements.FullBlock;

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
  drawClearScreen();
  drawColorText(
    `Time to fill screen ${frameNumber} times: ${endTime -
      startTime}ms, fps:${frameNumber / ((endTime - startTime) / 1000)}\n`,
    AnsiColor.Green,
  );
}

shutdownAnsi();

Deno.exit();
