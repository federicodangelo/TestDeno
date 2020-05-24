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
