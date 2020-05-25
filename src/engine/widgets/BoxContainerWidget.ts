import { Color, DrawContext } from "../types.ts";
import { BaseWidgetContainer } from "../widget-container.ts";

export class BoxContainerWidget extends BaseWidgetContainer {
  public backColor: Color;
  public foreColor: Color;
  public borderForeColor: Color;
  public borderBackColor: Color;
  public fillChar: string;
  public title: string = "";
  public titleForeColor = Color.White;
  public titleBackColor = Color.Black;

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
