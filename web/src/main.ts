import { FixedColor, Engine } from "engine/types.ts";
import { buildEngine, destroyEngine } from "engine/engine.ts";
import { LabelWidget } from "engine/widgets/label.ts";
import { initGame, updateGame, mainUI } from "game/game.ts";
import { getWebNativeContext } from "./native/web.ts";

const TARGET_FPS = 10;

let engine: Engine;
let fpsLabel: LabelWidget;

let totalRenderTime = 0;
let frames = 0;
let framesTime = performance.now();
let nextUpdateTime: number = 0;

function updateFps() {
  const now = performance.now();
  frames++;
  if (now - framesTime > 1000) {
    const fps = frames / ((now - framesTime) / 1000);
    const stats = "FPS: " + fps.toFixed(2) + "\nRender Time: " +
      (totalRenderTime / frames).toFixed(2) + "ms";
    fpsLabel.text = stats;
    framesTime = now;
    frames = 0;
    totalRenderTime = 0;
  }
}

async function init() {
  console.log("Initializing Engine");

  engine = await buildEngine(getWebNativeContext());

  console.log("Engine Initialized");

  initGame(engine);

  console.log("Game Initialized");

  fpsLabel = new LabelWidget(
    "FPS: 0.00\nRender Time: 0.00ms",
    FixedColor.White,
    mainUI.panel2.backColor,
  );

  fpsLabel.parent = mainUI.panel2;

  return engine;
}

nextUpdateTime = performance.now() + 1000 / TARGET_FPS;

function update() {
  const start = performance.now();

  if (start < nextUpdateTime) return;

  updateFps();

  engine.update();

  updateGame(engine);

  engine.draw();

  const end = performance.now();

  const renderTime = end - start;

  totalRenderTime += renderTime;

  nextUpdateTime = start + Math.max(10, 1000 / TARGET_FPS - (end - start));
}

async function run() {
  const engine = await init();

  function onRequestAnimationFrame() {
    update();
    requestAnimationFrame(onRequestAnimationFrame);
  }

  onRequestAnimationFrame();

  return engine;
}

run();
