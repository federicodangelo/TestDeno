import { delay } from "./utils.ts";
import { AnsiColor } from "./ansi/types.ts";
import { buildEngine, destroyEngine } from "./ansi/engine.ts";
import { clearScreen } from "./ansi/ansi.ts";
import { LabelWidget } from "./ansi/widgets/LabelWidget.ts";
import { initGame, updateGame, mainUI } from "./game.ts";

const engine = await buildEngine();

clearScreen();

let running = true;

initGame(engine);

const fpsLabel = new LabelWidget(
  "FPS: 0.00\nRender Time: 0.00ms",
  AnsiColor.White,
  AnsiColor.Blue,
);

const statsLabel = new LabelWidget(
  "Players: 2\nNpcs: 2",
  AnsiColor.White,
  AnsiColor.Blue,
);

fpsLabel.parent = mainUI.rightPanel;
statsLabel.parent = mainUI.rightPanel;

let totalRenderTime = 0;
let frames = 0;
let framesTime = performance.now();

function updateFps() {
  const now = performance.now();
  frames++;
  if (now - framesTime > 1000) {
    const fps = frames / ((now - framesTime) / 1000);
    fpsLabel.text = "FPS: " + fps.toFixed(2) + "\nRender Time: " +
      (totalRenderTime / frames).toFixed(2) + "ms";
    framesTime = now;
    frames = 0;
    totalRenderTime = 0;
  }
}

function update() {
  updateFps();

  if (!updateGame(engine)) running = false;

  engine.update();
}

while (running) {
  const start = performance.now();

  update();

  engine.draw();

  const end = performance.now();

  const renderTime = end - start;

  totalRenderTime += renderTime;

  await delay(Math.max(10, 50 - renderTime));
}

destroyEngine(engine);

Deno.exit();
