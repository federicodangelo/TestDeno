import { Color, DrawContext, EngineContext } from "../types.ts";
import { BaseWidgetContainer } from "./widget-container.ts";

export class ScrollableContainerWidget extends BaseWidgetContainer {
  public backColor: Color;
  public foreColor: Color;
  public fillChar: string;

  private _offsetX: number = 0;
  private _offsetY: number = 0;

  public get offsetX() {
    return this._offsetX;
  }

  public get offsetY() {
    return this._offsetY;
  }

  public setOffset(offsetX: number, offsetY: number) {
    if (offsetX !== this._offsetX || offsetY !== this._offsetY) {
      this.invalidate();
      this._offsetX = offsetX;
      this._offsetY = offsetY;
    }
  }

  public get innerX() {
    return this.offsetX;
  }

  public get innerY() {
    return this.offsetY;
  }

  public get innerWidth() {
    return this.width;
  }

  public get innerHeight() {
    return this.height;
  }

  constructor(
    foreColor = Color.White,
    backColor = Color.Black,
    fillChar = " ",
  ) {
    super();
    this.foreColor = foreColor;
    this.backColor = backColor;
    this.fillChar = fillChar;
  }

  public draw(context: EngineContext): void {
    if (!context.isVisible(this.x, this.y, this.width, this.height)) return;
    context.pushTransform(this.x, this.y);
    context.pushClip(0, 0, this.width, this.height);
    context.moveCursorTo(0, 0);
    this.drawSelf(context);
    context.pushTransform(this.offsetX, this.offsetY);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].draw(context);
    }
    context.popTransform();
    context.popClip();
    context.popTransform();
  }

  drawSelf(context: DrawContext) {
    context.color(this.foreColor, this.backColor).fill(
      0,
      0,
      this.width,
      this.height,
      this.fillChar,
    );
  }
}
