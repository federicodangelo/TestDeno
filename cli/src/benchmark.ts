import {
  getAnsiNativeContext,
} from "./native/ansi.ts";
import { delay } from "./utils.ts";
import { FixedColor, SpecialChar, Size, Color } from "engine/types.ts";
import { EngineContextImpl } from "engine/context.ts";

const nativeContext = getAnsiNativeContext();

const context = new EngineContextImpl(nativeContext);

const screenSize = new Size();

nativeContext.clearScreen();

let tmp = nativeContext.getScreenSize();
while (tmp === null) {
  await delay(10);
  tmp = nativeContext.getScreenSize();
}
screenSize.copyFrom(tmp);

context.beginDraw(0, 0, screenSize.width, screenSize.height);

context.color(FixedColor.Blue, FixedColor.Black).text("Starting test\n");

context.color(FixedColor.Blue, FixedColor.Black).text("Console dimensions:");

context.color(FixedColor.Black, FixedColor.White).text(
  `${screenSize.width}x${screenSize.height}`,
);

context.color(FixedColor.White, FixedColor.Black).text("\n");

context.endDraw();

await delay(1000);

const fillColors: Color[] = [
  FixedColor.BrightRed,
  FixedColor.BrightCyan,
  FixedColor.BrightBlue,
  FixedColor.BrightGreen,
  FixedColor.BrightYellow,
];

let frameNumber = 0;

function drawScreen(c: number) {
  context.border(0, 0, screenSize.width, screenSize.height);

  for (let y = 1; y < screenSize.height - 1; y++) {
    context.moveCursorTo(1, y);

    for (let x = 1; x < screenSize.width - 1; x++) {
      context.color(
        fillColors[(y + x + frameNumber) % fillColors.length],
        FixedColor.Black,
      ).specialChar(
        c,
      );
    }
  }
}

const totalFrames = 100;
const startTime = performance.now();
let cancel = false;

let fillChar = SpecialChar.FullBlock;

for (let i = 0; i < totalFrames && !cancel; i++) {
  context.beginDraw(0, 0, screenSize.width, screenSize.height);

  drawScreen(fillChar);

  context.endDraw();

  const newScreenSize = nativeContext.getScreenSize();
  if (newScreenSize !== null) screenSize.copyFrom(newScreenSize);
  const input = nativeContext.readInput();
  if (input && input.toLowerCase().indexOf("z") >= 0) cancel = true;
  await delay(1);
  frameNumber++;
}

const endTime = performance.now();

nativeContext.destroy();

if (!cancel && frameNumber > 0) {
  context.beginDraw(0, 0, screenSize.width, screenSize.height);
  context.color(FixedColor.Green, FixedColor.Black).text(
    `Time to fill screen ${frameNumber} times: ${endTime -
      startTime}ms, fps:${frameNumber / ((endTime - startTime) / 1000)}\n`,
  );
  context.endDraw();
}

Deno.exit();
