export const ESC = "\u001b[";

export const useCp437 = Deno.build.os === "windows";

export class BlockElements {
  //Block
  public static FullBlock = useCp437 ? 219 : "█".charCodeAt(0);
  public static BottomHalfBlock = useCp437 ? 220 : "▄".charCodeAt(0);
  public static TopHalfBlock = useCp437 ? 224 : "▀".charCodeAt(0);
  public static LeftHalfBlock = useCp437 ? 221 : "▌".charCodeAt(0);
  public static RightHalfBlock = useCp437 ? 222 : "▌".charCodeAt(0);

  //Shade
  public static LightShade = useCp437 ? 176 : "░".charCodeAt(0);
  public static MediumShade = useCp437 ? 177 : "▒".charCodeAt(0);
  public static DarkShade = useCp437 ? 178 : "▓".charCodeAt(0);
}

export type LineElements = {
  Vertical: number;
  Horizontal: number;
  CornerTopLeft: number;
  CornerTopRight: number;
  CornerBottomLeft: number;
  CornerBottomRight: number;
  ConnectorVerticalLeft: number;
  ConnectorVerticalRight: number;
  ConnectorHorizontalTop: number;
  ConnectorHorizontalBottom: number;
  ConnectorCross: number;
};

export const SingleLineElements: LineElements = {
  //Single Line
  Vertical: useCp437 ? 179 : "│".charCodeAt(0),
  Horizontal: useCp437 ? 196 : "─".charCodeAt(0),
  CornerTopLeft: useCp437 ? 218 : "┌".charCodeAt(0),
  CornerTopRight: useCp437 ? 191 : "┐".charCodeAt(0),
  CornerBottomLeft: useCp437 ? 192 : "└".charCodeAt(0),
  CornerBottomRight: useCp437 ? 217 : "┘".charCodeAt(0),
  ConnectorVerticalLeft: useCp437 ? 180 : "┤".charCodeAt(0),
  ConnectorVerticalRight: useCp437 ? 195 : "├".charCodeAt(0),
  ConnectorHorizontalTop: useCp437 ? 193 : "┴".charCodeAt(0),
  ConnectorHorizontalBottom: useCp437 ? 194 : "┬".charCodeAt(0),
  ConnectorCross: useCp437 ? 197 : "┼".charCodeAt(0),
};

export const DoubleLineElements: LineElements = {
  //Double Line
  Vertical: useCp437 ? 186 : "║".charCodeAt(0),
  Horizontal: useCp437 ? 205 : "═".charCodeAt(0),
  CornerTopLeft: useCp437 ? 201 : "╔".charCodeAt(0),
  CornerTopRight: useCp437 ? 187 : "╗".charCodeAt(0),
  CornerBottomLeft: useCp437 ? 200 : "╚".charCodeAt(0),
  CornerBottomRight: useCp437 ? 188 : "╝".charCodeAt(0),
  ConnectorVerticalLeft: useCp437 ? 185 : "╣".charCodeAt(0),
  ConnectorVerticalRight: useCp437 ? 204 : "╠".charCodeAt(0),
  ConnectorHorizontalTop: useCp437 ? 202 : "╩".charCodeAt(0),
  ConnectorHorizontalBottom: useCp437 ? 203 : "╦".charCodeAt(0),
  ConnectorCross: useCp437 ? 206 : "╬".charCodeAt(0),
};

export enum AnsiColor {
  Black,
  Red,
  Green,
  Yellow,
  Blue,
  Magenta,
  Cyan,
  White,
  BrightBlack,
  BrightRed,
  BrightGreen,
  BrightYellow,
  BrightBlue,
  BrightMagenta,
  BrightCyan,
  BrightWhite,
}

export const AnsiColorCodesFront = [
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "90",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
];

export const AnsiColorCodesBack = [
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "100",
  "101",
  "102",
  "103",
  "104",
  "105",
  "106",
  "107",
];

export interface DrawContext {
  moveCursorTo(x: number, y: number): EngineContext;

  color(foreColor: AnsiColor, backColor: AnsiColor): EngineContext;
  resetColor(): EngineContext;

  text(str: string): EngineContext;

  char(code: number): EngineContext;
  charTimes(code: number, times: number): EngineContext;

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
  type: "absolute" | "vertical" | "horizontal";
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

export interface Engine {
  draw(): void;
  update(): void;
  addWidget(widget: Widget): void;
  removeWidget(widget: Widget): void;
  readInput(): string;
  invalidateRect(rect: Rect): void;
}
