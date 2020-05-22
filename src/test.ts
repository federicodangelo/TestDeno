import {
  getConsoleSize,
  initAnsi,
  shutdownAnsi,
  moveCursorTo,
  clearScreen,
} from "./ansi.ts";

initAnsi();

clearScreen();

console.log("Starting test");

const consoleSize = await getConsoleSize();

console.log("Console dimensions:", consoleSize);

shutdownAnsi();

Deno.exit();
