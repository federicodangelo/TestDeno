import { AnsiContext, AnsiColor } from "../types.ts";
import { BaseWidgetContainer } from "../widget-container.ts";

export class BoxContainerWidget extends BaseWidgetContainer {
  public backColor: AnsiColor;
  public foreColor: AnsiColor;
  public borderForeColor: AnsiColor;
  public borderBackColor: AnsiColor;
  public fillChar: string;
  public title: string = "";
  public titleForeColor = AnsiColor.White;
  public titleBackColor = AnsiColor.Black;

  constructor(
    border = 1,
    borderForeColor = AnsiColor.White,
    borderBackColor = AnsiColor.Black,
    foreColor = AnsiColor.White,
    backColor = AnsiColor.Black,
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

  drawSelf(context: AnsiContext) {
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
