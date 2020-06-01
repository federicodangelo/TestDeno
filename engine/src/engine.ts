import { Engine, Widget, Size, Point, Rect, EngineContext } from "./types.ts";
import { EngineContextImpl } from "./context.ts";
import { NativeContext } from "./native-types.ts";

class EngineImpl implements Engine {
  private children: Widget[] = [];
  private nativeContext: NativeContext;
  private context: EngineContextImpl;
  private consoleSize = new Size();
  private invalidRects: Rect[] = [];

  constructor(nativeContext: NativeContext) {
    this.nativeContext = nativeContext;
    this.context = new EngineContextImpl(this.nativeContext.screen);
  }

  async init() {
    await this.nativeContext.init();
    let consoleSize = this.nativeContext.screen.getScreenSize();
    while (consoleSize === null) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1);
      });
      consoleSize = this.nativeContext.screen.getScreenSize();
    }
    this.consoleSize.set(consoleSize.width, consoleSize.height);
    this.nativeContext.screen.onScreenSizeChanged(
      this.onScreenSizeChanged.bind(this)
    );
  }

  private onScreenSizeChanged(size: Size): void {
    if (!size.equals(this.consoleSize)) {
      this.consoleSize.set(size.width, size.height);
      this.invalidateRect(
        new Rect(0, 0, this.consoleSize.width, this.consoleSize.height)
      );
    }
  }

  public draw() {
    if (this.invalidRects.length == 0) return;

    var pendingLayout = true;

    const clip = new Rect();
    const consoleSize = this.consoleSize;

    this.context.beginDraw();

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
        clip.width <= 0 ||
        clip.height <= 0 ||
        clip.x > consoleSize.width ||
        clip.y > consoleSize.height
      ) {
        continue;
      }
      if (clip.x + clip.width > consoleSize.width) {
        clip.width = consoleSize.width - clip.x;
      }
      if (clip.y + clip.height > consoleSize.height) {
        clip.height = consoleSize.height - clip.y;
      }

      if (pendingLayout) {
        pendingLayout = false;
        this.updateLayout();
      }

      this.context.beginClip(clip.x, clip.y, clip.width, clip.height);

      for (let i = 0; i < this.children.length; i++) {
        this.children[i].draw(this.context);
      }

      this.context.endClip();
    }
    this.context.endDraw();

    this.invalidRects.length = 0;
  }

  private updateLayout() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateLayout(
        this.consoleSize.width,
        this.consoleSize.height
      );
    }
  }

  public update(): void {}

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

  public onInput(listener: (input: string) => void): void {
    this.nativeContext.input.onInput(listener);
  }

  public invalidateRect(rect: Rect) {
    let lastRect =
      this.invalidRects.length > 0
        ? this.invalidRects[this.invalidRects.length - 1]
        : null;

    if (lastRect !== null && lastRect.intersects(rect)) {
      lastRect.union(rect);
      return;
    }

    this.invalidRects.push(rect.clone());
  }

  public destroy() {
    this.nativeContext.destroy();
  }
}

export async function buildEngine(nativeContext: NativeContext) {
  const engine = new EngineImpl(nativeContext);
  await engine.init();
  return engine;
}

export function destroyEngine(engine: Engine) {
  (engine as EngineImpl).destroy();
}
