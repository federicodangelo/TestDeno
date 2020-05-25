import { BaseWidget } from "../widget.ts";
import { AnsiContext, AnsiColor } from "../types.ts";

export class LabelWidget extends BaseWidget {
  public foreColor: AnsiColor;
  public backColor: AnsiColor;

  private _text: string = "";
  private _lines: string[] = [];

  public set text(val: string) {
    if (val !== this._text) {
      this._text = val;
      this._lines = val.split("\n");
      this.width = this._lines.map((s) => s.length).reduce(
        (max, c) => Math.max(max, c),
        0,
      );
      this.height = this._lines.length;
      this.invalidate();
    }
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
    context.color(this.foreColor, this.backColor);

    for (let i = 0; i < this._lines.length; i++) {
      context.moveCursorTo(0, i).text(this._lines[i]);
    }
  }
}
