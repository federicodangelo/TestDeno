import {
  initAnsi,
  AnsiColor,
  shutdownAnsi,
  AnsiScreen,
  BlockElements,
  consoleSize,
} from "./ansi.ts";
import { delay } from "./utils.ts";
import { readInput } from "./input.ts";

await initAnsi();

const screen = new AnsiScreen();

screen.clearScreen().color(AnsiColor.Blue).text("Running\n").apply();

type Character = {
  color: AnsiColor;
  x: number;
  y: number;
};

const p1: Character = {
  color: AnsiColor.Red,
  x: 3,
  y: 3,
};

const p2: Character = {
  color: AnsiColor.Blue,
  x: 13,
  y: 3,
};

let running = true;

const npcs: Character[] = [
  { color: AnsiColor.BrightYellow, x: 20, y: 4 },
  { color: AnsiColor.BrightGreen, x: 22, y: 3 },
];

const characters = [
  ...npcs,
  p1,
  p2,
];

while (running) {
  screen.clearScreen();

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];

    screen.color(char.color).moveCursorTo(char.x, char.y).text(
      BlockElements.FullBlock,
    );
  }

  screen.color(AnsiColor.BrightMagenta).box(
    0,
    0,
    consoleSize.width,
    consoleSize.height,
  );

  screen.apply();

  for (let i = 0; i < npcs.length; i++) {
    const npc = npcs[i];
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        npc.x--;
        break;
      case 1:
        npc.x++;
        break;
      case 2:
        npc.y--;
        break;
      case 3:
        npc.y++;
        break;
    }
  }

  const input = readInput();
  if (input) {
    input.split("").forEach((c) => {
      switch (c) {
        case "a":
          p1.x--;
          break;
        case "d":
          p1.x++;
          break;
        case "w":
          p1.y--;
          break;
        case "s":
          p1.y++;
          break;

        case "j":
          p2.x--;
          break;
        case "l":
          p2.x++;
          break;
        case "i":
          p2.y--;
          break;
        case "k":
          p2.y++;
          break;

        case "z":
          running = false;
          break;
      }
    });
  }

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    char.x = Math.max(Math.min(char.x, consoleSize.width - 2), 1);
    char.y = Math.max(Math.min(char.y, consoleSize.height - 2), 1);
  }

  await delay(50);
}

shutdownAnsi();

Deno.exit();
