export const enum SpecialChar {
  //Block
  FullBlock,
  BottomHalfBlock,
  TopHalfBlock,
  LeftHalfBlock,
  RightHalfBlock,

  //Shade
  LightShade,
  MediumShade,
  DarkShade,

  //Single Line
  Vertical,
  Horizontal,
  CornerTopLeft,
  CornerTopRight,
  CornerBottomLeft,
  CornerBottomRight,
  ConnectorVerticalLeft,
  ConnectorVerticalRight,
  ConnectorHorizontalTop,
  ConnectorHorizontalBottom,
  ConnectorCross,

  //Double Line
  DoubleVertical,
  DoubleHorizontal,
  DoubleCornerTopLeft,
  DoubleCornerTopRight,
  DoubleCornerBottomLeft,
  DoubleCornerBottomRight,
  DoubleConnectorVerticalLeft,
  DoubleConnectorVerticalRight,
  DoubleConnectorHorizontalTop,
  DoubleConnectorHorizontalBottom,
  DoubleConnectorCross,
}

export const enum FixedColor {
  Black = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Blue = 4,
  Magenta = 5,
  Cyan = 6,
  White = 7,
  BrightBlack = 8,
  BrightRed = 9,
  BrightGreen = 10,
  BrightYellow = 11,
  BrightBlue = 12,
  BrightMagenta = 13,
  BrightCyan = 14,
  BrightWhite = 15,
}

export const enum Grayscale {
  Black = 232,
  White = 255,
}

export const enum Intensity {
  I0 = 0,
  I20 = 1,
  I40 = 2,
  I60 = 3,
  I80 = 4,
  I100 = 5,
}

export type RGB = number;

export type Color = FixedColor | Grayscale | RGB;

export function rgb(r: Intensity, g: Intensity, b: Intensity): RGB {
  return 16 + 36 * r + 6 * g + b;
}

export interface WidgetLayout {
  widthPercent?: number;
  heightPercent?: number;
  horizontalSpacingPercent?: number; //0 <- left, 50 <- center, 100 <- right
  verticalSpacingPercent?: number; //0 <- top, 50 <- center, 100 <- bottom
  customSizeFn?: (
    widget: Widget,
    parentWidth: number,
    parentHeight: number,
  ) => void;
  customPositionFn?: (
    widget: Widget,
    parentWidth: number,
    parentHeight: number,
  ) => void;
}

export interface ChildrenLayout {
  type: "absolute" | "vertical" | "horizontal" | "none";
  spacing?: number;
}

export interface WidgetContainer extends Widget {
  readonly children: Widget[];
  readonly innerX: number;
  readonly innerY: number;
  readonly innerWidth: number;
  readonly innerHeight: number;
  childrenLayout: ChildrenLayout | null;
  setChildrenLayout(layout: ChildrenLayout | null): Widget;
}

export interface Widget {
  engine: Engine | null;
  x: number;
  y: number;
  width: number;
  height: number;
  parent: WidgetContainer | null;
  updateLayout(parentWidth: number, parentHeight: number): void;
  draw(context: EngineContext): void;
  layout: WidgetLayout | null;
  setLayout(layout: WidgetLayout | null): Widget;
  getBoundingBox(): Rect;
  invalidate(): void;
}

export class Point {
  public x: number;
  public y: number;

  public constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  public copyFrom(p: Point) {
    this.x = p.x;
    this.y = p.y;
    return this;
  }

  public equals(p: Point) {
    return this.x === p.x &&
      this.y === p.y;
  }

  public clone() {
    return new Point(this.x, this.y);
  }
}

export class Size {
  public width: number;
  public height: number;

  public constructor(width: number = 0, height: number = 0) {
    this.width = width;
    this.height = height;
  }

  public set(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this;
  }

  public copyFrom(size: Size) {
    this.width = size.width;
    this.height = size.height;
    return this;
  }

  public equals(size: Size) {
    return this.width === size.width &&
      this.height === size.height;
  }

  public clone() {
    return new Size(this.width, this.height);
  }
}

export class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public get x1() {
    return this.x + this.width;
  }

  public get y1() {
    return this.y + this.height;
  }

  public constructor(
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public set(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  public copyFrom(rect: Rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
    return this;
  }

  public equals(rect: Rect) {
    return this.x === rect.x &&
      this.y === rect.y &&
      this.width === rect.width &&
      this.height === rect.height;
  }

  public intersects(rect: Rect) {
    return !(this.x1 < rect.x ||
      this.y1 < rect.y ||
      this.x > rect.x1 ||
      this.y > rect.y1);
  }

  public union(rect: Rect) {
    const x0 = Math.min(this.x, rect.x);
    const y0 = Math.min(this.y, rect.y);
    const x1 = Math.max(this.x1, rect.x1);
    const y1 = Math.max(this.y1, rect.y1);

    this.x = x0;
    this.y = y0;
    this.width = x1 - x0;
    this.height = y1 - y0;
  }

  public minDistanceTo(rect: Rect) {
    return Math.min();
  }

  public clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}

export interface DrawContext {
  moveCursorTo(x: number, y: number): EngineContext;

  color(foreColor: FixedColor, backColor: FixedColor): EngineContext;
  resetColor(): EngineContext;

  text(str: string): EngineContext;

  char(code: number): EngineContext;
  charTimes(code: number, times: number): EngineContext;

  specialChar(code: SpecialChar): EngineContext;
  specialCharTimes(code: SpecialChar, times: number): EngineContext;

  border(x: number, y: number, width: number, height: number): EngineContext;

  fill(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
  ): EngineContext;
}

export interface EngineContext extends DrawContext {
  isVisible(x: number, y: number, width: number, height: number): boolean;

  pushTransform(x: number, y: number): void;
  popTransform(): void;

  pushClip(x: number, y: number, width: number, height: number): void;
  popClip(): void;
}

export interface Engine {
  draw(): void;
  update(): void;
  addWidget(widget: Widget): void;
  removeWidget(widget: Widget): void;
  invalidateRect(rect: Rect): void;
  onInput(listener: (input: string) => void): void;
}
