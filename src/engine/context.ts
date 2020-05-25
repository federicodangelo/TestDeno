import {
  AnsiColor,
  AnsiColorCodesFront,
  AnsiColorCodesBack,
  DoubleLineElements,
  ESC,
  Rect,
  Point,
  useCp437,
  EngineContext,
} from "./types.ts";

export class AnsiContextImpl implements EngineContext {
  private buffer: number[] = [];
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
    this.buffer.fill(0, 0, capacity);
  }

  public beginDraw(x: number, y: number, width: number, height: number) {
    this.bounds.set(x, y, width, height);
    this.clip.set(x, y, width, height);
    this.transformsStack.length = 0;
    this.clipStack.length = 0;
    this.offset = 0;
    this.x = 0;
    this.y = 0;
    this.tx = 0;
    this.ty = 0;
    this.lastDrawX = NaN;
    this.lastDrawY = NaN;
    this.lastDrawForeColor = null;
    this.lastDrawBackColor = null;
    this.offset = 0;
  }

  private encoder = new TextEncoder();

  public endDraw() {
    if (useCp437) {
      const codes8 = new Uint8Array(this.offset);
      for (let i = 0; i < this.offset; i++) {
        codes8[i] = this.buffer[i];
      }
      Deno.stdout.writeSync(codes8);
    } else {
      const str = String.fromCharCode(...this.buffer.slice(0, this.offset));
      Deno.stdout.writeSync(this.encoder.encode(str));
    }
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

    this.clip.set(minX, minY, maxX - minX, maxY - minY);
  }

  popClip(): void {
    const p = this.clipStack.pop();
    if (p) this.clip.copyFrom(p);
  }

  public isVisible(
    x: number,
    y: number,
    width: number,
    height: number,
  ): boolean {
    return !(this.tx + x + width < this.clip.x ||
      this.ty + y + height < this.clip.y ||
      this.tx + x > this.clip.x + this.clip.width ||
      this.ty + y > this.clip.y + this.clip.height);
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
      this.char(str.charCodeAt(i));
    }
    return this;
  }

  public char(code: number) {
    this.setChar(
      code,
      this.foreColor,
      this.backColor,
      this.tx + this.x,
      this.ty + this.y,
    );
    this.x++;
    return this;
  }

  public charTimes(code: number, times: number) {
    for (let t = 0; t < times; t++) {
      this.char(code);
    }
    return this;
  }

  private setChar(
    char: number,
    foreColor: AnsiColor,
    backColor: AnsiColor,
    screenX: number,
    screenY: number,
  ) {
    const clip = this.clip;

    if (
      screenX >= clip.x &&
      screenY >= clip.y &&
      screenX < clip.x + clip.width &&
      screenY < clip.y + clip.height
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
    for (let i = 0; i < str.length; i++) {
      if (this.offset < this.buffer.length) {
        this.buffer[this.offset++] = str.charCodeAt(i);
      } else {
        this.buffer.push(str.charCodeAt(i));
        this.offset++;
      }
    }
  }

  private addToBufferChar(char: number) {
    if (this.offset < this.buffer.length) {
      this.buffer[this.offset++] = char;
    } else {
      this.buffer.push(char);
      this.offset++;
    }
  }

  public border(x: number, y: number, width: number, height: number) {
    const clip = this.clip;
    const tx = this.tx;
    const ty = this.ty;

    const x0 = Math.max(x, clip.x - tx);
    const y0 = Math.max(y, clip.y - ty);
    const x1 = Math.min(x + width, clip.x1 - tx);
    const y1 = Math.min(y + height, clip.y1 - ty);

    if (x1 <= x0 || y1 <= y0) {
      return this;
    }

    if (
      x0 !== x && x0 !== x + width &&
      y0 !== y && y0 !== y + height
    ) {
      return this;
    }

    this.moveCursorTo(x, y);
    this.char(DoubleLineElements.CornerTopLeft);
    this.charTimes(DoubleLineElements.Horizontal, width - 2);
    this.char(DoubleLineElements.CornerTopRight);
    for (let i = 0; i < height - 2; i++) {
      this.moveCursorTo(x, y + 1 + i);
      this.char(DoubleLineElements.Vertical);
      this.moveCursorTo(x + width - 1, y + 1 + i);
      this.char(DoubleLineElements.Vertical);
    }
    this.moveCursorTo(x, y + height - 1);
    this.char(DoubleLineElements.CornerBottomLeft);
    this.charTimes(DoubleLineElements.Horizontal, width - 2);
    this.char(DoubleLineElements.CornerBottomRight);

    return this;
  }

  public fill(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
  ) {
    const clip = this.clip;
    const tx = this.tx;
    const ty = this.ty;

    const x0 = Math.max(tx + x, clip.x);
    const y0 = Math.max(ty + y, clip.y);
    const x1 = Math.min(tx + x + width, clip.x1);
    const y1 = Math.min(ty + y + height, clip.y1);

    if (x1 <= x0 || y1 <= y0) {
      return this;
    }

    const code = char.charCodeAt(0);

    for (let i = y0; i < y1; i++) {
      for (let j = x0; j < x1; j++) {
        this.setChar(code, this.foreColor, this.backColor, j, i);
      }
    }
    return this;
  }
}
