import { delay } from "./utils.ts";
import { buildEngine, destroyEngine } from "./engine/engine.ts";

const engine = await buildEngine();

const ESC = "\u001b";

while (true) {
  const input = engine.readInput();

  if (input) {
    console.log("Read input: " + input.replace("\u001b", "ESC"));

    if (input.indexOf(ESC) < 0 && input.indexOf("z") >= 0) {
      break;
    }
  }

  await delay(100);
}

destroyEngine(engine);

Deno.exit();
