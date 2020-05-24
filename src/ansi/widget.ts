import { Widget, AnsiContext, WidgetContainer } from "./types.ts";

export abstract class BaseWidget implements Widget {
  private _x: number = 0;
  private _y: number = 0;
  private _width: number = 1;
  private _height: number = 1;
  private _parent: WidgetContainer | null = null;

  public get x() {
    return this._x;
  }

  public set x(v: number) {
    if (v !== this._x) {
      this._x = v;
      this.onTransformChanged();
    }
  }

  public get y() {
    return this._y;
  }

  public set y(v: number) {
    if (v !== this._y) {
      this._y = v;
      this.onTransformChanged();
    }
  }

  public get width() {
    return this._width;
  }

  public set width(v: number) {
    if (v !== this._width) {
      this._width = v;
      this.onTransformChanged();
    }
  }

  public get height() {
    return this._height;
  }

  public set height(v: number) {
    if (v !== this._height) {
      this._height = v;
      this.onTransformChanged();
    }
  }

  public get parent() {
    return this._parent;
  }

  public set parent(v: WidgetContainer | null) {
    if (v !== this._parent) {
      if (this._parent !== null) {
        const index = this._parent.children.indexOf(this);
        if (index >= 0) this._parent.children.splice(index, 1);
      }
      this._parent = v;
      if (this._parent !== null) {
        this._parent.children.push(this);
      }
      this.onTransformChanged();
    }
  }

  private onTransformChanged() {
  }

  public draw(context: AnsiContext): void {
    context.pushTransform(this.x, this.y);
    context.pushClip(0, 0, this.width, this.height);
    context.moveCursorTo(0, 0);
    this.drawSelf(context);
    context.popClip();
    context.popTransform();
  }

  protected abstract drawSelf(context: AnsiContext): void;
}
