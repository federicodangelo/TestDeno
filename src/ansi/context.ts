import {
  AnsiColor,
  AnsiColorCodesFront,
  AnsiColorCodesBack,
  DoubleLineElements,
  AnsiContext,
  ESC,
  Rect,
  Point,
} from "./types.ts";

export class AnsiContextImpl implements AnsiContext {
  private buffer: Uint16Array;
  private offset = 0;

  private bounds = new Rect();
  private clip = new Rect();
  private tx: number = 0;
  private ty: number = 0;

  private x: number = 0;
  private y: number = 0;
  private foreColor = AnsiColor.White;
  private backColor = AnsiColor.Black;

  private lastDrawForeColor: AnsiColor | null = null;
  private lastDrawBackColor: AnsiColor | null = null;
  private lastDrawX: number = -1;
  private lastDrawY: number = -1;

  private transformsStack: Point[] = [];
  private clipStack: Rect[] = [];

  public constructor(capacity = 8192) {
    this.buffer = new Uint16Array(capacity);
  }

  public beginDraw(x: number, y: number, width: number, height: number) {
    this.bounds.set(x, y, width, height);
    this.clip.set(x, y, width, height);
    this.transformsStack.length = 0;
    this.clipStack.length = 0;
    this.offset = 0;
    this.x = 0;
    this.y = 0;
    this.tx = x;
    this.ty = y;
    this.lastDrawX = NaN;
    this.lastDrawY = NaN;
    this.lastDrawForeColor = null;
    this.lastDrawBackColor = null;
    this.offset = 0;
  }

  public endDraw() {
    const codes16 = this.buffer.subarray(0, this.offset);
    const codes8 = new Uint8Array(codes16.length);
    codes8.set(codes16);
    Deno.stdout.writeSync(codes8);
    this.offset = 0;
  }

  pushTransform(x: number, y: number) {
    this.transformsStack.push(new Point(this.tx, this.ty));
    this.tx += x;
    this.ty += y;
  }

  popTransform(): void {
    const p = this.transformsStack.pop();
    if (p) {
      this.tx = p.x;
      this.ty = p.y;
    }
  }

  pushClip(x: number, y: number, width: number, height: number): void {
    this.clipStack.push(this.clip.clone());

    const minX = Math.max(this.tx + x, this.clip.x);
    const minY = Math.max(this.ty + y, this.clip.y);
    const maxX = Math.min(this.tx + x + width, this.clip.x + this.clip.width);
    const maxY = Math.min(this.ty + y + height, this.clip.y + this.clip.height);

    this.clip.set(
      minX,
      minY,
      maxX - minX,
      maxY - minY,
    );
  }

  popClip(): void {
    const p = this.clipStack.pop();
    if (p) this.clip.set(p.x, p.y, p.width, p.height);
  }

  public moveCursorTo(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  public color(foreColor: AnsiColor, backColor: AnsiColor) {
    this.foreColor = foreColor;
    this.backColor = backColor;
    return this;
  }

  public resetColor() {
    this.foreColor = AnsiColor.White;
    this.backColor = AnsiColor.Black;
    return this;
  }

  public text(str: string) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      this.textInternal(
        code,
        this.foreColor,
        this.backColor,
        this.tx + this.x,
        this.ty + this.y,
      );
      this.x++;
    }
    return this;
  }

  private textInternal(
    char: number,
    foreColor: AnsiColor,
    backColor: AnsiColor,
    screenX: number,
    screenY: number,
  ) {
    const clip = this.clip;

    if (
      screenX >= clip.x && screenX < clip.x + clip.width &&
      screenY >= clip.y && screenY < clip.y + clip.height
    ) {
      if (this.lastDrawX !== screenX || this.lastDrawY !== screenY) {
        this.addToBuffer(ESC);
        this.addToBuffer((screenY + 1).toString());
        this.addToBuffer(";");
        this.addToBuffer((screenX + 1).toString());
        this.addToBuffer("H");
        this.lastDrawX = screenX;
        this.lastDrawY = screenY;
      }

      if (
        this.lastDrawForeColor !== foreColor ||
        this.lastDrawBackColor !== backColor
      ) {
        this.addToBuffer(ESC);
        this.addToBuffer(AnsiColorCodesFront[foreColor]);
        this.addToBuffer(";");
        this.addToBuffer(AnsiColorCodesBack[backColor]);
        this.addToBuffer("m");
        this.lastDrawForeColor = foreColor;
        this.lastDrawBackColor = backColor;
      }

      this.addToBufferChar(char);
      this.lastDrawX++;
    }
  }

  private addToBuffer(str: string) {
    while (str.length + this.offset > this.buffer.length) {
      const newBuffer = new Uint16Array(this.buffer.length * 2);
      newBuffer.set(this.buffer, 0);
      this.buffer = newBuffer;
    }

    for (let i = 0; i < str.length; i++) {
      this.buffer[this.offset++] = str.charCodeAt(i);
    }
  }

  private addToBufferChar(char: number) {
    while (1 + this.offset > this.buffer.length) {
      const newBuffer = new Uint16Array(this.buffer.length * 2);
      newBuffer.set(this.buffer, 0);
      this.buffer = newBuffer;
    }

    this.buffer[this.offset++] = char;
  }

  public textTimes(str: string, times: number) {
    for (let t = 0; t < times; t++) {
      this.text(str);
    }
    return this;
  }

  public border(x: number, y: number, width: number, height: number) {
    this.moveCursorTo(x, y);
    this.text(DoubleLineElements.CornerTopLeft);
    this.textTimes(DoubleLineElements.Horizontal, width - 2);
    this.text(DoubleLineElements.CornerTopRight);
    for (let i = 0; i < height - 2; i++) {
      this.moveCursorTo(x, y + 1 + i);
      this.text(DoubleLineElements.Vertical);
      this.moveCursorTo(x + width - 1, y + 1 + i);
      this.text(DoubleLineElements.Vertical);
    }
    this.moveCursorTo(x, y + height - 1);
    this.text(DoubleLineElements.CornerBottomLeft);
    this.textTimes(DoubleLineElements.Horizontal, width - 2);
    this.text(DoubleLineElements.CornerBottomRight);
    return this;
  }

  public fill(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
  ) {
    for (let i = y; i < y + height; i++) {
      this.moveCursorTo(x, i);
      this.textTimes(char, width);
    }
    return this;
  }
}
