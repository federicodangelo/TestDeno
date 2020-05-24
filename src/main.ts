import { delay } from "./utils.ts";
import { readInput } from "./ansi/input.ts";
import { AnsiColor, BlockElements } from "./ansi/types.ts";
import { buildEngine, destroyEngine } from "./ansi/engine.ts";
import { CharacterWidget } from "./ansi/widgets/CharacterWidget.ts";
import { BoxContainerWidget } from "./ansi/widgets/BoxContainerWidget.ts";
import { consoleSize, clearScreen } from "./ansi/ansi.ts";
import { LabelWidget } from "./ansi/widgets/LabelWidget.ts";

const engine = await buildEngine();

clearScreen();

const p1 = new CharacterWidget(
  BlockElements.FullBlock,
  AnsiColor.Red,
  AnsiColor.Black,
);
p1.x = 3;
p1.y = 3;

const p2 = new CharacterWidget(
  BlockElements.FullBlock,
  AnsiColor.Blue,
  AnsiColor.Black,
);
p2.x = 13;
p2.y = 3;

const npcs: CharacterWidget[] = [
  new CharacterWidget(
    BlockElements.FullBlock,
    AnsiColor.BrightYellow,
    AnsiColor.Black,
  ),
  new CharacterWidget(
    BlockElements.FullBlock,
    AnsiColor.BrightGreen,
    AnsiColor.Black,
  ),
];

let running = true;

const characters = [
  ...npcs,
  p1,
  p2,
];

const playingBox = new BoxContainerWidget(
  1,
  AnsiColor.BrightMagenta,
  AnsiColor.Black,
  AnsiColor.White,
  AnsiColor.Black,
  " ",
);
characters.forEach((c) => c.parent = playingBox);
engine.addWidget(playingBox);

const fpsLabel = new LabelWidget("fps: ", AnsiColor.White, AnsiColor.Black);

engine.addWidget(fpsLabel);

let frames = 0;
let framesTime = performance.now();

function updateFps() {
  const now = performance.now();
  frames++;
  if (now - framesTime > 1000) {
    const fps = frames / ((now - framesTime) / 1000);
    fpsLabel.text = "fps: " + fps.toFixed(2);
    framesTime = now;
    frames = 0;
  }
}

async function draw() {
  playingBox.width = consoleSize.width;
  playingBox.height = consoleSize.height;
  await engine.draw();
}

function update() {
  updateFps();
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
    char.x = Math.max(Math.min(char.x, playingBox.innerWidth - char.width), 0);
    char.y = Math.max(
      Math.min(char.y, playingBox.innerHeight - char.height),
      0,
    );
  }
}

while (running) {
  const start = performance.now();

  await draw();

  update();

  const end = performance.now();

  await delay(Math.max(10, 50 - (end - start)));
}

destroyEngine(engine);

Deno.exit();
