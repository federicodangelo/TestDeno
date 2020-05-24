import { Widget, AnsiContext, WidgetContainer, WidgetLayout } from "./types.ts";

export abstract class BaseWidget implements Widget {
  private _x: number = 0;
  private _y: number = 0;
  private _width: number = 0;
  private _height: number = 0;
  private _parent: WidgetContainer | null = null;

  public layout: WidgetLayout | null = null;

  public setLayout(layout: WidgetLayout | null) {
    this.layout = layout;
    return this;
  }

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

  public updateLayout(parentWidth: number, parentHeight: number): void {
    const layout = this.layout;
    if (layout !== null) {
      if (layout.heightPercent !== undefined) {
        this.height = Math.ceil(
          parentHeight * layout.heightPercent / 100,
        );
      }
      if (layout.widthPercent !== undefined) {
        this.width = Math.ceil(
          parentWidth * layout.widthPercent / 100,
        );
      }

      if (layout.customSizeFn !== undefined) {
        layout.customSizeFn(this, parentWidth, parentHeight);
      }

      if (layout.horizontalSpacingPercent !== undefined) {
        this.x = Math.floor(
          (parentWidth - this.width) * layout.horizontalSpacingPercent / 100,
        );
      }
      if (layout.verticalSpacingPercent !== undefined) {
        this.y = Math.floor(
          (parentHeight - this.height) * layout.verticalSpacingPercent / 100,
        );
      }

      if (layout.customPositionFn !== undefined) {
        layout.customPositionFn(this, parentWidth, parentHeight);
      }
    }
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
