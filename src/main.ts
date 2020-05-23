import {
  getConsoleSize,
  initAnsi,
  shutdownAnsi,
  clearScreen,
  writeColorText,
  AnsiColor,
  writeASCII,
} from "./ansi.ts";

await initAnsi();

clearScreen();

writeColorText("Running\n", AnsiColor.Blue);

writeASCII("██ A A A ██" + String.fromCharCode(219) + "\n");

console.log("██ A A A ██");

shutdownAnsi();

Deno.exit();
