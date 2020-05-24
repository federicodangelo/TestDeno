import { AnsiContext, WidgetContainer, AnsiColor } from "./types.ts";
import { BaseWidget } from "./widget.ts";

export abstract class BaseWidgetContainer extends BaseWidget
  implements WidgetContainer {
  private _children: BaseWidget[] = [];

  public border: number = 0;

  public get innerX() {
    return this.border;
  }

  public get innerY() {
    return this.border;
  }

  public get innerWidth() {
    return this.width - this.border * 2;
  }

  public get innerHeight() {
    return this.height - this.border * 2;
  }

  public get children() {
    return this._children;
  }

  public updateLayout(parentWidth: number, parentHeight: number) {
    super.updateLayout(parentWidth, parentHeight);

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateLayout(
        this.innerWidth,
        this.innerHeight,
      );
    }
  }

  public draw(context: AnsiContext): void {
    context.pushTransform(this.x, this.y);
    context.pushClip(0, 0, this.width, this.height);
    context.moveCursorTo(0, 0);
    this.drawSelf(context);
    if (this.border > 0) {
      context.pushTransform(this.border, this.border);
      context.pushClip(
        0,
        0,
        this.innerWidth,
        this.innerHeight,
      );
    }
    for (let i = 0; i < this._children.length; i++) {
      this._children[i].draw(context);
    }
    if (this.border > 0) {
      context.popClip();
      context.popTransform();
    }
    context.popClip();
    context.popTransform();
  }
}
