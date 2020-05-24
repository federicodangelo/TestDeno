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
    this.drawSelfAfterChildren(context);
    context.popClip();
    context.popTransform();
  }

  protected abstract drawSelfAfterChildren(context: AnsiContext): void;
}
