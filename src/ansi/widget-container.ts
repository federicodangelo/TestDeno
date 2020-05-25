import {
  AnsiContext,
  WidgetContainer,
  ChildrenLayout,
  Engine,
} from "./types.ts";
import { BaseWidget } from "./widget.ts";

export abstract class BaseWidgetContainer extends BaseWidget
  implements WidgetContainer {
  private _children: BaseWidget[] = [];

  public border: number = 0;

  public childrenLayout: ChildrenLayout | null = null;

  public setChildrenLayout(layout: ChildrenLayout | null) {
    this.childrenLayout = layout;
    return this;
  }

  public get engine() {
    return super.engine;
  }

  public set engine(val: Engine | null) {
    if (val !== this.engine) {
      super.engine = val;
      for (let i = 0; i < this._children.length; i++) {
        this._children[i].engine = val;
      }
    }
  }

  public get innerX() {
    return this.border;
  }

  public get innerY() {
    return this.border;
  }

  public get innerWidth() {
    return this.width - this.border * 2;
  }

  public get innerHeight() {
    return this.height - this.border * 2;
  }

  public get children() {
    return this._children;
  }

  public updateLayout(parentWidth: number, parentHeight: number) {
    super.updateLayout(parentWidth, parentHeight);

    if (
      this.childrenLayout === null || this.childrenLayout.type === "absolute"
    ) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateLayout(
          this.innerWidth,
          this.innerHeight,
        );
      }
    } else if (
      this.childrenLayout !== null && this.childrenLayout.type === "vertical"
    ) {
      const spacing = this.childrenLayout.spacing || 0;
      let top = 0;
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateLayout(
          this.innerWidth,
          this.innerHeight,
        );
        this.children[i].x = 0;
        this.children[i].y = top;
        top += this.children[i].height + spacing;
      }
    } else if (
      this.childrenLayout !== null &&
      this.childrenLayout.type === "horizontal"
    ) {
      const spacing = this.childrenLayout.spacing || 0;
      let left = 0;
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateLayout(
          this.innerWidth,
          this.innerHeight,
        );
        this.children[i].y = 0;
        this.children[i].x = left;
        left += this.children[i].width + spacing;
      }
    }
  }

  public draw(context: AnsiContext): void {
    if (!context.isVisible(this.x, this.y, this.width, this.height)) return;
    context.pushTransform(this.x, this.y);
    context.pushClip(0, 0, this.width, this.height);
    context.moveCursorTo(0, 0);
    this.drawSelf(context);
    if (this.border > 0) {
      context.pushTransform(this.border, this.border);
      context.pushClip(
        0,
        0,
        this.innerWidth,
        this.innerHeight,
      );
    }
    for (let i = 0; i < this._children.length; i++) {
      this._children[i].draw(context);
    }
    if (this.border > 0) {
      context.popClip();
      context.popTransform();
    }
    context.popClip();
    context.popTransform();
  }
}
