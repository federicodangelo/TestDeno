import {
  initAnsi,
  shutdownAnsi,
  requestUpdateConsoleSize,
  getConsoleSizeFromInput,
  getMouse as getMouseFromInput,
} from "./ansi.ts";
import { Engine, Widget, Size, Point } from "./types.ts";
import { AnsiContextImpl } from "./context.ts";
import { updateInput, readInput } from "./input.ts";
import { delay } from "../utils.ts";

export class EngineImpl implements Engine {
  private children: Widget[] = [];
  private context = new AnsiContextImpl();
  private consoleSize = new Size();
  private mousePosition = new Point();

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

    this.updateLayout();

    this.context.beginDraw(
      0,
      0,
      this.consoleSize.width,
      this.consoleSize.height,
    );

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw(this.context);
    }

    this.context.endDraw();
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
    if (newSize !== null) this.consoleSize.set(newSize.width, newSize.height);
    const newMouse = getMouseFromInput();
    if (newMouse !== null) this.mousePosition.set(newMouse.x, newMouse.y);
  }

  public addWidget(widget: Widget): void {
    this.children.push(widget);
    widget.updateLayout(this.consoleSize.width, this.consoleSize.height);
  }

  public removeWidget(widget: Widget): void {
    const ix = this.children.indexOf(widget);
    if (ix >= 0) this.children.splice(ix, 1);
  }

  public readInput() {
    this.updateInput();
    return readInput();
  }
}

export async function buildEngine() {
  initAnsi();
  const engine = new EngineImpl();
  await engine.init();
  return engine;
}

export function destroyEngine(engine: Engine) {
  shutdownAnsi();
}
