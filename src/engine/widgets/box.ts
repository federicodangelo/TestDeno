import { Color, DrawContext, EngineContext } from "../types.ts";
import { BaseWidgetContainer } from "./widget-container.ts";

export class BoxContainerWidget extends BaseWidgetContainer {
  public backColor: Color;
  public foreColor: Color;
  public borderForeColor: Color;
  public borderBackColor: Color;
  public fillChar: string;
  public title: string = "";
  public titleForeColor = Color.White;
  public titleBackColor = Color.Black;
  public border: number = 0;

  constructor(
    border = 1,
    borderForeColor = Color.White,
    borderBackColor = Color.Black,
    foreColor = Color.White,
    backColor = Color.Black,
    fillChar = " ",
  ) {
    super();
    this.border = border;
    this.borderForeColor = borderForeColor;
    this.borderBackColor = borderBackColor;
    this.foreColor = foreColor;
    this.backColor = backColor;
    this.fillChar = fillChar;
  }

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

  preDrawChildren(context: EngineContext) {
    if (this.innerX > 0 || this.innerY > 0) {
      context.pushTransform(this.innerX, this.innerY);
      context.pushClip(0, 0, this.innerWidth, this.innerHeight);
    }
  }

  postDrawChildren(context: EngineContext) {
    if (this.innerX > 0 || this.innerY > 0) {
      context.popClip();
      context.popTransform();
    }
  }

  drawSelf(context: DrawContext) {
    if (this.border > 0) {
      context.color(this.foreColor, this.backColor).fill(
        1,
        1,
        this.width - 2,
        this.height - 2,
        this.fillChar,
      );

      context.color(this.borderForeColor, this.borderBackColor).border(
        0,
        0,
        this.width,
        this.height,
      );
    } else {
      context.color(this.foreColor, this.backColor).fill(
        0,
        0,
        this.width,
        this.height,
        this.fillChar,
      );
    }

    if (this.title.length > 0) {
      context.moveCursorTo(Math.floor((this.width - this.title.length) / 2), 0)
        .color(this.titleForeColor, this.titleBackColor)
        .text(this.title);
    }
  }
}
