import {
  initAnsi,
  shutdownAnsi,
  updateConsoleSize,
  consoleSize,
} from "./ansi.ts";
import { Engine, Widget } from "./types.ts";
import { AnsiContextImpl } from "./context.ts";

export class EngineImpl implements Engine {
  private children: Widget[] = [];
  private context = new AnsiContextImpl();

  public async draw() {
    await updateConsoleSize();

    this.context.beginDraw(0, 0, consoleSize.width, consoleSize.height);

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw(this.context);
    }

    this.context.endDraw();
  }

  public update(): void {
  }

  public addWidget(widget: Widget): void {
    this.children.push(widget);
  }

  public removeWidget(widget: Widget): void {
    const ix = this.children.indexOf(widget);
    if (ix >= 0) this.children.splice(ix, 1);
  }
}

export async function buildEngine() {
  await initAnsi();
  return new EngineImpl();
}

export function destroyEngine(engine: Engine) {
  shutdownAnsi();
}
