import { delay } from "./utils.ts";
import { buildEngine, destroyEngine } from "engine/engine.ts";
import { getAnsiNativeContext } from "./native/ansi.ts";

const engine = await buildEngine(getAnsiNativeContext());

const ESC = "\u001b";

while (true) {
  const input = engine.readInput();

  if (input) {
    console.log("Read input: " + input.split("\u001b").join("ESC"));

    if (input.indexOf(ESC) < 0 && input.indexOf("z") >= 0) {
      break;
    }
  }

  await delay(100);
}

destroyEngine(engine);

Deno.exit();
