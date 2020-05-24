export const ESC = "\u001b[";

export class BlockElements {
  //Block
  public static FullBlock = String.fromCharCode(219); //█
  public static BottomHalfBlock = String.fromCharCode(220); //▄
  public static TopHalfBlock = String.fromCharCode(224); //▀
  public static LeftHalfBlock = String.fromCharCode(221); //▌
  public static RightHalfBlock = String.fromCharCode(222); //▌

  //Shade
  public static LightShade = String.fromCharCode(176); //░
  public static MediumShade = String.fromCharCode(177); //▒
  public static DarkShade = String.fromCharCode(178); //▓
}

export type LineElements = {
  Vertical: string;
  Horizontal: string;
  CornerTopLeft: string;
  CornerTopRight: string;
  CornerBottomLeft: string;
  CornerBottomRight: string;
  ConnectorVerticalLeft: string;
  ConnectorVerticalRight: string;
  ConnectorHorizontalTop: string;
  ConnectorHorizontalBottom: string;
  ConnectorCross: string;
};

export const SingleLineElements: LineElements = {
  //Single Line
  Vertical: String.fromCharCode(179), //│
  Horizontal: String.fromCharCode(196), //─
  CornerTopLeft: String.fromCharCode(218), //┌
  CornerTopRight: String.fromCharCode(191), //┐
  CornerBottomLeft: String.fromCharCode(192), //└
  CornerBottomRight: String.fromCharCode(217), //┘
  ConnectorVerticalLeft: String.fromCharCode(180), //┤
  ConnectorVerticalRight: String.fromCharCode(195), //├
  ConnectorHorizontalTop: String.fromCharCode(193), //┴
  ConnectorHorizontalBottom: String.fromCharCode(194), //┬
  ConnectorCross: String.fromCharCode(197), //┼
};

export const DoubleLineElements: LineElements = {
  //Double Line
  Vertical: String.fromCharCode(186), //║
  Horizontal: String.fromCharCode(205), //═
  CornerTopLeft: String.fromCharCode(201), //╔
  CornerTopRight: String.fromCharCode(187), //╗
  CornerBottomLeft: String.fromCharCode(200), //╚
  CornerBottomRight: String.fromCharCode(188), //╝
  ConnectorVerticalLeft: String.fromCharCode(185), //╣
  ConnectorVerticalRight: String.fromCharCode(204), //╠
  ConnectorHorizontalTop: String.fromCharCode(202), //╩
  ConnectorHorizontalBottom: String.fromCharCode(203), //╦
  ConnectorCross: String.fromCharCode(206), //╬
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

export interface AnsiContext {
  pushTransform(x: number, y: number): void;
  popTransform(): void;

  pushClip(x: number, y: number, width: number, height: number): void;
  popClip(): void;

  moveCursorTo(x: number, y: number): AnsiContext;

  color(
    foreColor: AnsiColor,
    backColor: AnsiColor,
  ): AnsiContext;

  resetColor(): AnsiContext;

  text(str: string): AnsiContext;
  textTimes(str: string, times: number): AnsiContext;

  border(x: number, y: number, width: number, height: number): AnsiContext;

  fill(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
  ): AnsiContext;
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
  x: number;
  y: number;
  width: number;
  height: number;
  parent: WidgetContainer | null;
  updateLayout(parentWidth: number, parentHeight: number): void;
  draw(context: AnsiContext): void;
  layout: WidgetLayout | null;
  setLayout(layout: WidgetLayout | null): Widget;
}

export class Point {
  public x: number;
  public y: number;

  public constructor(
    x: number = 0,
    y: number = 0,
  ) {
    this.x = x;
    this.y = y;
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

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
}
