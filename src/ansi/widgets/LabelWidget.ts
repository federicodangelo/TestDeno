import { BaseWidget } from "../widget.ts";
import { AnsiContext, AnsiColor } from "../types.ts";

export class LabelWidget extends BaseWidget {
  public foreColor: AnsiColor;
  public backColor: AnsiColor;

  private _text: string = "";

  public set text(val: string) {
    this._text = val;
    this.width = val.length;
  }

  public get text() {
    return this._text;
  }

  constructor(text: string, foreColor: AnsiColor, backColor: AnsiColor) {
    super();
    this.height = 1;
    this.text = text;
    this.foreColor = foreColor;
    this.backColor = backColor;
  }

  protected drawSelf(context: AnsiContext) {
    context.color(this.foreColor, this.backColor).text(this.text);
  }
}
