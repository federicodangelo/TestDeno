import {
  initAnsi,
  shutdownAnsi,
  consoleSize,
  updateConsoleSizeFromInput,
  requestUpdateConsoleSize,
} from "./ansi.ts";
import { Engine, Widget } from "./types.ts";
import { AnsiContextImpl } from "./context.ts";
import { updateInput, readInput } from "./input.ts";

export class EngineImpl implements Engine {
  private children: Widget[] = [];
  private context = new AnsiContextImpl();

  public draw() {
    requestUpdateConsoleSize();

    this.updateLayout();

    this.context.beginDraw(0, 0, consoleSize.width, consoleSize.height);

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw(this.context);
    }

    this.context.endDraw();
  }

  private updateLayout() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateLayout(consoleSize.width, consoleSize.height);
    }
  }

  public update(): void {
    updateInput();
    updateConsoleSizeFromInput();
  }

  public addWidget(widget: Widget): void {
    this.children.push(widget);
    widget.updateLayout(consoleSize.width, consoleSize.height);
  }

  public removeWidget(widget: Widget): void {
    const ix = this.children.indexOf(widget);
    if (ix >= 0) this.children.splice(ix, 1);
  }

  public readInput() {
    updateInput();
    updateConsoleSizeFromInput();
    return readInput();
  }
}

export async function buildEngine() {
  await initAnsi();
  return new EngineImpl();
}

export function destroyEngine(engine: Engine) {
  shutdownAnsi();
}
