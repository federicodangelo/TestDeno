import {
  getConsoleSize,
  initAnsi,
  shutdownAnsi,
  clearScreen,
  writeColor,
  AnsiColor,
} from "./ansi.ts";

await initAnsi();

clearScreen();

writeColor("Running\n", AnsiColor.Blue);

shutdownAnsi();

Deno.exit();
