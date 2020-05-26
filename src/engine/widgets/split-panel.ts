import { BaseWidgetContainer } from "./widget-container.ts";
import { BoxContainerWidget } from "./box.ts";

export interface SplitPanelLayout {
  direction: "vertical" | "horizontal";
  splitPercent?: number;
  fixed?: {
    panel: "panel1" | "panel2";
    amount: number;
  };
}

export class SplitPanelContainerWidget extends BaseWidgetContainer {
  public panel1: BoxContainerWidget = new BoxContainerWidget(1);
  public panel2: BoxContainerWidget = new BoxContainerWidget(1);
  public splitLayout: SplitPanelLayout | null = null;

  constructor(sl: SplitPanelLayout | null = null) {
    super();
    this.panel1.parent = this;
    this.panel2.parent = this;
    this.splitLayout = sl;

    this.panel1.layout = {
      customSizeFn: (widget, parentWidth, parentHeight) => {
        const splitPercent = this.splitLayout?.splitPercent || 50;
        const direction = this.splitLayout?.direction || "horizontal";
        const fixedPanel = this.splitLayout?.fixed?.panel;
        const fixedAmount = this.splitLayout?.fixed?.amount || 0;

        if (direction === "horizontal") {
          widget.height = parentHeight;
          widget.width = fixedPanel === undefined
            ? Math.floor(parentWidth * splitPercent / 100)
            : fixedPanel === "panel1"
            ? fixedAmount
            : parentWidth - fixedAmount;
        } else {
          widget.width = parentWidth;
          widget.height = fixedPanel === undefined
            ? Math.floor(parentHeight * splitPercent / 100)
            : fixedPanel === "panel1"
            ? fixedAmount
            : parentHeight - fixedAmount;
        }
      },
    };
    this.panel2.layout = {
      heightPercent: 100,
      customSizeFn: (widget, parentWidth, parentHeight) => {
        const splitPercent = this.splitLayout?.splitPercent || 50;
        const direction = this.splitLayout?.direction || "horizontal";
        const fixedPanel = this.splitLayout?.fixed?.panel;
        const fixedAmount = this.splitLayout?.fixed?.amount || 0;

        if (direction === "horizontal") {
          widget.height = parentHeight;
          widget.width = fixedPanel === undefined
            ? Math.ceil(parentWidth * (100 - splitPercent) / 100)
            : fixedPanel === "panel2"
            ? fixedAmount
            : parentWidth - fixedAmount;
        } else {
          widget.width = parentWidth;
          widget.height = fixedPanel === undefined
            ? Math.ceil(parentHeight * (100 - splitPercent) / 100)
            : fixedPanel === "panel2"
            ? fixedAmount
            : parentHeight - fixedAmount;
        }
      },
      customPositionFn: (widget) => {
        const splitPercent = this.splitLayout?.splitPercent || 50;
        const direction = this.splitLayout?.direction || "horizontal";
        const fixedPanel = this.splitLayout?.fixed?.panel;
        const fixedAmount = this.splitLayout?.fixed?.amount || 0;

        if (direction === "horizontal") {
          widget.x = this.width - widget.width;
        } else {
          widget.y = this.height - widget.height;
        }
      },
    };
  }

  drawSelf() {
  }
}
