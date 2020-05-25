import { delay } from "./utils.ts";
import { Color } from "./engine/types.ts";
import { buildEngine, destroyEngine } from "./engine/engine.ts";
import { LabelWidget } from "./engine/widgets/label.ts";
import { initGame, updateGame, mainUI } from "./game.ts";

const engine = await buildEngine();

let running = true;

initGame(engine);

const fpsLabel = new LabelWidget(
  "FPS: 0.00\nRender Time: 0.00ms",
  Color.White,
  Color.Blue,
);

const statsLabel = new LabelWidget(
  "Players: 2\nNpcs: 2",
  Color.White,
  Color.Blue,
);

fpsLabel.parent = mainUI.rightPanel;
statsLabel.parent = mainUI.rightPanel;

new LabelWidget("Move with W/S/A/D\nQuit with Z", Color.White, Color.Blue)
  .parent = mainUI.rightPanel;

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
