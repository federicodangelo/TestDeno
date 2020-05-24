import { BaseWidgetContainer } from "../widget-container.ts";
import { BoxContainerWidget } from "./BoxContainerWidget.ts";

export class SplitPanelContainerWidget extends BaseWidgetContainer {
  public leftPanel: BoxContainerWidget = new BoxContainerWidget(1);
  public rightPanel: BoxContainerWidget = new BoxContainerWidget(1);
  public splitPercent = 50;

  constructor() {
    super();
    this.leftPanel.parent = this;
    this.rightPanel.parent = this;

    this.leftPanel.layout = {
      heightPercent: 100,
      customSizeFn: (widget, pw) => {
        widget.width = Math.floor(pw * this.splitPercent / 100);
      },
    };
    this.rightPanel.layout = {
      heightPercent: 100,
      customSizeFn: (widget, pw) => {
        widget.width = Math.ceil(pw * (100 - this.splitPercent) / 100);
      },
      customPositionFn: (widget) => {
        widget.x = this.width - widget.width;
      },
    };
  }

  drawSelf() {
  }
}
