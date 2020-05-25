import {
  initAnsi,
  shutdownAnsi,
  requestUpdateConsoleSize,
  getConsoleSizeFromInput,
  getMouse as getMouseFromInput,
  getAnsiNativeContext,
  clearScreen,
} from "./native/ansi.ts";
import { Engine, Widget, Size, Point, Rect } from "./types.ts";
import { EngineContextImpl } from "./context.ts";
import { updateInput, readInput } from "./native/input.ts";
import { delay } from "../utils.ts";

export class EngineImpl implements Engine {
  private children: Widget[] = [];
  private context = new EngineContextImpl(getAnsiNativeContext());
  private consoleSize = new Size();
  private mousePosition = new Point();
  private invalidRects: Rect[] = [];

  async init() {
    requestUpdateConsoleSize();
    let consoleSize = getConsoleSizeFromInput();
    while (consoleSize === null) {
      await delay(1);
      consoleSize = getConsoleSizeFromInput();
    }
    this.consoleSize.set(consoleSize.width, consoleSize.height);
  }

  public draw() {
    requestUpdateConsoleSize();

    if (this.invalidRects.length > 0) {
      this.updateLayout();

      const clip = new Rect();
      const consoleSize = this.consoleSize;

      for (let i = 0; i < this.invalidRects.length; i++) {
        clip.copyFrom(this.invalidRects[i]);
        if (clip.x < 0) {
          clip.width += clip.x;
          clip.x = 0;
        }
        if (clip.y < 0) {
          clip.height += clip.y;
          clip.y = 0;
        }
        if (
          clip.width <= 0 || clip.height <= 0 ||
          clip.x > consoleSize.width || clip.y > consoleSize.height
        ) {
          continue;
        }
        if (clip.x + clip.width > consoleSize.width) {
          clip.width = consoleSize.width - clip.x;
        }
        if (clip.y + clip.height > consoleSize.height) {
          clip.height = consoleSize.height - clip.y;
        }

        this.context.beginDraw(
          clip.x,
          clip.y,
          clip.width,
          clip.height,
        );

        for (let i = 0; i < this.children.length; i++) {
          this.children[i].draw(this.context);
        }

        this.context.endDraw();
      }
    }

    this.invalidRects.length = 0;
  }

  private updateLayout() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateLayout(
        this.consoleSize.width,
        this.consoleSize.height,
      );
    }
  }

  public update(): void {
    this.updateInput();
  }

  private updateInput() {
    updateInput();
    const newSize = getConsoleSizeFromInput();
    if (newSize !== null && !newSize.equals(this.consoleSize)) {
      this.consoleSize.set(newSize.width, newSize.height);
      this.invalidateRect(
        new Rect(0, 0, this.consoleSize.width, this.consoleSize.height),
      );
    }
    const newMouse = getMouseFromInput();
    if (newMouse !== null) this.mousePosition.set(newMouse.x, newMouse.y);
  }

  public addWidget(widget: Widget): void {
    this.children.push(widget);
    widget.engine = this;
    widget.updateLayout(this.consoleSize.width, this.consoleSize.height);
    this.invalidateRect(widget.getBoundingBox());
  }

  public removeWidget(widget: Widget): void {
    const ix = this.children.indexOf(widget);
    if (ix >= 0) this.children.splice(ix, 1);
    this.invalidateRect(widget.getBoundingBox());
  }

  public readInput() {
    this.updateInput();
    return readInput();
  }

  public invalidateRect(rect: Rect) {
    let lastRect = this.invalidRects.length > 0
      ? this.invalidRects[this.invalidRects.length - 1]
      : null;

    if (lastRect !== null && lastRect.intersects(rect)) {
      lastRect.union(rect);
      return;
    }

    this.invalidRects.push(rect.clone());
  }
}

export async function buildEngine() {
  initAnsi();
  clearScreen();
  const engine = new EngineImpl();
  await engine.init();
  return engine;
}

export function destroyEngine(engine: Engine) {
  shutdownAnsi();
}
