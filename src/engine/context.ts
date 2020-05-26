import {
  Color,
  SpecialChar,
  Rect,
  Point,
  EngineContext,
} from "./types.ts";
import { NativeContextDraw } from "./native/types.ts";

export class EngineContextImpl implements EngineContext {
  private bounds = new Rect();
  private clip = new Rect();
  private tx: number = 0;
  private ty: number = 0;

  private x: number = 0;
  private y: number = 0;
  private foreColor = Color.White;
  private backColor = Color.Black;

  private transformsStack: Point[] = [];
  private clipStack: Rect[] = [];

  private nativeContext: NativeContextDraw;

  public constructor(nativeContext: NativeContextDraw) {
    this.nativeContext = nativeContext;
  }

  public beginDraw(x: number, y: number, width: number, height: number) {
    this.bounds.set(x, y, width, height);
    this.clip.set(x, y, width, height);
    this.transformsStack.length = 0;
    this.clipStack.length = 0;
    this.x = 0;
    this.y = 0;
    this.tx = 0;
    this.ty = 0;
    this.nativeContext.reset();
  }

  public endDraw() {
    this.nativeContext.apply();
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

  public color(foreColor: Color, backColor: Color) {
    this.foreColor = foreColor;
    this.backColor = backColor;
    return this;
  }

  public resetColor() {
    this.foreColor = Color.White;
    this.backColor = Color.Black;
    return this;
  }

  public text(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.char(str.charCodeAt(i));
    }
    return this;
  }

  public char(code: number) {
    const screenX = this.x + this.tx;
    const screenY = this.y + this.ty;
    if (
      screenX >= this.clip.x && screenX < this.clip.x1 &&
      screenY >= this.clip.y && screenY < this.clip.y1
    ) {
      this.nativeContext.setChar(
        code,
        this.foreColor,
        this.backColor,
        screenX,
        screenY,
      );
    }
    this.x++;
    return this;
  }

  public charTimes(code: number, times: number) {
    for (let t = 0; t < times; t++) {
      this.char(code);
    }
    return this;
  }

  public specialChar(code: SpecialChar) {
    const screenX = this.x + this.tx;
    const screenY = this.y + this.ty;
    if (
      screenX >= this.clip.x && screenX < this.clip.x1 &&
      screenY >= this.clip.y && screenY < this.clip.y1
    ) {
      this.nativeContext.setSpecialChar(
        code,
        this.foreColor,
        this.backColor,
        screenX,
        screenY,
      );
    }
    this.x++;
    return this;
  }

  public specialCharTimes(code: number, times: number) {
    for (let t = 0; t < times; t++) {
      this.specialChar(code);
    }
    return this;
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
    this.specialChar(SpecialChar.DoubleCornerTopLeft);
    this.specialCharTimes(SpecialChar.DoubleHorizontal, width - 2);
    this.specialChar(SpecialChar.DoubleCornerTopRight);
    for (let i = 0; i < height - 2; i++) {
      this.moveCursorTo(x, y + 1 + i);
      this.specialChar(SpecialChar.DoubleVertical);
      this.moveCursorTo(x + width - 1, y + 1 + i);
      this.specialChar(SpecialChar.DoubleVertical);
    }
    this.moveCursorTo(x, y + height - 1);
    this.specialChar(SpecialChar.DoubleCornerBottomLeft);
    this.specialCharTimes(SpecialChar.DoubleHorizontal, width - 2);
    this.specialChar(SpecialChar.DoubleCornerBottomRight);

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

    for (let screenY = y0; screenY < y1; screenY++) {
      for (let screenX = x0; screenX < x1; screenX++) {
        this.nativeContext.setChar(
          code,
          this.foreColor,
          this.backColor,
          screenX,
          screenY,
        );
      }
    }
    return this;
  }
}
