import { AnsiContext, AnsiColor } from "../types.ts";
import { BaseWidgetContainer } from "../widget-container.ts";

export class BoxContainerWidget extends BaseWidgetContainer {
  public backColor: AnsiColor;
  public foreColor: AnsiColor;
  public borderForeColor: AnsiColor;
  public borderBackColor: AnsiColor;
  public fillChar: string;

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
    context.color(this.foreColor, this.backColor).fill(
      this.innerX,
      this.innerY,
      this.innerWidth,
      this.innerHeight,
      this.fillChar,
    );
  }

  drawSelfAfterChildren(context: AnsiContext) {
    if (this.border > 0) {
      context.color(this.borderForeColor, this.borderBackColor).border(
        0,
        0,
        this.width,
        this.height,
      );
    }
  }
}
