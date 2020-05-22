import {
  getConsoleSize,
  initAnsi,
  shutdownAnsi,
  moveCursorTo,
  clearScreen,
  writeColor,
  AnsiColor,
  hideCursor,
  showCursor,
} from "./ansi.ts";

async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

initAnsi();
hideCursor();

clearScreen();

writeColor("Starting test\n", AnsiColor.Blue);

const consoleSize = await getConsoleSize();

writeColor(
  `Console dimensions: `,
  AnsiColor.Blue,
);

writeColor(
  `${consoleSize.width}x${consoleSize.height}\n`,
  AnsiColor.Black,
  AnsiColor.White,
);

await delay(1000);

function fillScreen(c: string, front: AnsiColor, back: AnsiColor) {
  for (let y = 0; y < consoleSize.height; y++) {
    moveCursorTo(0, y);

    writeColor(c.repeat(consoleSize.width), front, back);

    /*for (let x = 0; x < consoleSize.width; x++) {
      writeColor(c, front, back);
    }*/
  }
}

const frames = 1000;
const startTime = performance.now();
const fillColors: AnsiColor[] = [
  AnsiColor.Red,
  AnsiColor.Cyan,
  AnsiColor.Blue,
  AnsiColor.Green,
  AnsiColor.Yellow,
];
for (let i = 0; i < frames; i++) {
  fillScreen("*", fillColors[i % fillColors.length], AnsiColor.Black);
}
const endTime = performance.now();

clearScreen();
writeColor(
  `Time to fill screen ${frames} times: ${endTime -
    startTime}ms, fps:${frames / ((endTime - startTime) / 1000)}`,
  AnsiColor.Green,
);

showCursor();
shutdownAnsi();

Deno.exit();
