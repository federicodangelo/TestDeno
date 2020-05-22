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
  readStdinRaw,
  getColor,
  writeAnsi,
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

const fillColors: AnsiColor[] = [
  AnsiColor.Red,
  AnsiColor.Cyan,
  AnsiColor.Blue,
  AnsiColor.Green,
  AnsiColor.Yellow,
];

let fileScreens = 0;

function fillScreen(c: string) {
  moveCursorTo(0, 0);

  let screen = "";

  for (let y = 0; y < consoleSize.height; y++) {
    let line = "";

    for (let x = 0; x < consoleSize.width; x++) {
      line += getColor(
        c,
        fillColors[(y + x + fileScreens) % fillColors.length],
        AnsiColor.Black,
      );
    }

    screen += line;
  }

  writeAnsi(screen, true);

  fileScreens++;
}

const frames = 100;
const startTime = performance.now();
let cancel = false;

readStdinRaw().then(() => cancel = true);

for (let i = 0; i < frames && !cancel; i++) {
  fillScreen("*");
  await delay(0);
}
const endTime = performance.now();

if (!cancel) {
  clearScreen();
  writeColor(
    `Time to fill screen ${frames} times: ${endTime -
      startTime}ms, fps:${frames / ((endTime - startTime) / 1000)}\n`,
    AnsiColor.Green,
  );
}
writeColor("\n", AnsiColor.White);
showCursor();
shutdownAnsi();

Deno.exit();
