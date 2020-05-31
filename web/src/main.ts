import { FixedColor } from "engine/types.ts";
import { buildEngine, destroyEngine } from "engine/engine.ts";
import { LabelWidget } from "engine/widgets/label.ts";
import { initGame, updateGame, mainUI } from "game/game.ts";
import { getWebNativeContext } from "./native/web.ts";

const engine = await buildEngine(getWebNativeContext());

let running = true;

initGame(engine);

const TARGET_FPS = 10;

const fpsLabel = new LabelWidget(
  "FPS: 0.00\nRender Time: 0.00ms",
  FixedColor.White,
  mainUI.panel2.backColor,
);

fpsLabel.parent = mainUI.panel2;

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

  engine.update();

  if (!updateGame(engine)) running = false;
}

while (running) {
  const start = performance.now();

  update();

  engine.draw();

  const end = performance.now();

  const renderTime = end - start;

  totalRenderTime += renderTime;

  await new Promise((resolve) =>
    setTimeout(resolve, Math.max(10, (1000 / TARGET_FPS) - renderTime))
  );
}

destroyEngine(engine);

Deno.exit();
