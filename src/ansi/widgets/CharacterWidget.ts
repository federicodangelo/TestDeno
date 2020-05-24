import { BaseWidget } from "../widget.ts";
import { AnsiContext, AnsiColor } from "../types.ts";

export class CharacterWidget extends BaseWidget {
  public char: string;
  public foreColor: AnsiColor;
  public backColor: AnsiColor;

  constructor(char: string, foreColor: AnsiColor, backColor: AnsiColor) {
    super();
    this.char = char;
    this.foreColor = foreColor;
    this.backColor = backColor;
  }

  protected drawSelf(context: AnsiContext) {
    context.color(this.foreColor, this.backColor).text(this.char);
  }
}
