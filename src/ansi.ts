import { readInputRaw, initInput, shutdownInput } from "./input.ts";

const useUTF8 = Deno.build.os !== "windows";

const encoder = new TextEncoder();

const ESC = "\u001b[";

export const consoleSize = { width: 0, height: 0 };

export async function initAnsi() {
  initInput();
  const size = await getConsoleSize();
  consoleSize.width = size.width;
  consoleSize.height = size.height;
  hideCursor();
}

export function shutdownAnsi() {
  drawResetColor();
  showCursor();
  shutdownInput();
}

export function hideCursor() {
  drawAscii(`${ESC}?25l`);
}

export function showCursor() {
  drawAscii(`${ESC}?25h`);
}

export async function getConsoleSize(): Promise<{ width: any; height: any }> {
  drawAscii(`${ESC}s`); //save cursor position
  drawAscii(`${ESC}999;999H`); //Move to huge bottom / right position
  drawAscii(`${ESC}6n`); //request cursor position
  drawAscii(`${ESC}u`); //restore cursor position

  const line = await readInputRaw(); //Read cursor position
  //Cursor position response format is "ESC[_posy_;_pos_x_R"
  if (line.startsWith(ESC) && line.endsWith("R")) {
    const { [0]: height, [1]: width } = line
      .substring(2)
      .replace("R", "")
      .split(";")
      .map((x) => parseInt(x));

    return { width, height };
  } else {
    return { width: 0, height: 0 };
  }
}

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

export class LineElements {
  //Single Line
  public static Vertical = String.fromCharCode(179); //│
  public static Horizontal = String.fromCharCode(196); //─
  public static CornerTopLeft = String.fromCharCode(218); //┌
  public static CornerTopRight = String.fromCharCode(191); //┐
  public static CornerBottomLeft = String.fromCharCode(192); //└
  public static CornerBottomRight = String.fromCharCode(217); //┘
  public static ConnectorVerticalLeft = String.fromCharCode(180); //┤
  public static ConnectorVerticalRight = String.fromCharCode(195); //├
  public static ConnectorHorizontalTop = String.fromCharCode(193); //┴
  public static ConnectorHorizontalBottom = String.fromCharCode(194); //┬
  public static ConnectorCross = String.fromCharCode(197); //┼
}

export class DoubleLineElements {
  //Double Line
  public static Vertical = String.fromCharCode(186); //║
  public static Horizontal = String.fromCharCode(205); //═
  public static CornerTopLeft = String.fromCharCode(201); //╔
  public static CornerTopRight = String.fromCharCode(187); //╗
  public static CornerBottomLeft = String.fromCharCode(200); //╚
  public static CornerBottomRight = String.fromCharCode(188); //╝
  public static ConnectorVerticalLeft = String.fromCharCode(185); //╣
  public static ConnectorVerticalRight = String.fromCharCode(204); //╠
  public static ConnectorHorizontalTop = String.fromCharCode(202); //╩
  public static ConnectorHorizontalBottom = String.fromCharCode(203); //╦
  public static ConnectorCross = String.fromCharCode(206); //╬
}

const tmpBuffer = new Uint8Array(32768);

export class AsciiBuffer {
  private buffer: Uint8Array;
  private offset = 0;

  public constructor(capacity = 16) {
    this.buffer = new Uint8Array(capacity);
  }

  public add(str: string, times = 1) {
    if (useUTF8) {
      const { read, written } = encoder.encodeInto(str, tmpBuffer);
      if (read === str.length) {
        while (written * times + this.offset > this.buffer.length) {
          const newBuffer = new Uint8Array(this.buffer.length * 2);
          newBuffer.set(this.buffer, 0);
          this.buffer = newBuffer;
        }
        for (let t = 0; t < times; t++) {
          for (let i = 0; i < written; i++) {
            this.buffer[this.offset++] = tmpBuffer[i];
          }
        }
      } else {
        const enc = encoder.encode(str);
        while (enc.length * times + this.offset > this.buffer.length) {
          const newBuffer = new Uint8Array(this.buffer.length * 2);
          newBuffer.set(this.buffer, 0);
          this.buffer = newBuffer;
        }
        for (let t = 0; t < times; t++) {
          for (let i = 0; i < enc.length; i++) {
            this.buffer[this.offset++] = enc[i];
          }
        }
      }
    } else {
      while (str.length * times + this.offset > this.buffer.length) {
        const newBuffer = new Uint8Array(this.buffer.length * 2);
        newBuffer.set(this.buffer, 0);
        this.buffer = newBuffer;
      }
      for (let t = 0; t < times; t++) {
        for (let i = 0; i < str.length; i++) {
          this.buffer[this.offset++] = str.charCodeAt(i);
        }
      }
    }
  }

  public getArray(): Uint8Array {
    return this.buffer.subarray(0, this.offset);
  }
}

const AnsiColorCodesFront = [
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  90,
  91,
  92,
  93,
  94,
  95,
  96,
  97,
];

const AnsiColorCodesBack = [
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  100,
  101,
  102,
  103,
  104,
  105,
  106,
  107,
];

export function encodeAscii(str: string) {
  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer;
}

export function drawAsciiBuffer(buffer: AsciiBuffer) {
  Deno.stdout.writeSync(buffer.getArray());
}

export function drawAscii(str: string) {
  if (useUTF8) {
    Deno.stdout.writeSync(encoder.encode(str));
  } else {
    Deno.stdout.writeSync(encodeAscii(str));
  }
}

export function drawClearScreen() {
  drawAscii(`${ESC}2J`);
  drawMoveCursorTo(0, 0);
}

export function getMoveCursorTo(x: number, y: number) {
  return `${ESC}${y + 1};${x + 1}H`;
}

export function drawMoveCursorTo(x: number, y: number) {
  drawAscii(getMoveCursorTo(x, y));
}

export function getColorText(
  text: string,
  foreColor: AnsiColor,
  backColor: AnsiColor,
) {
  return `${ESC}${AnsiColorCodesFront[foreColor]};${
    AnsiColorCodesBack[backColor]
  }m${text}`;
}

export function drawColorText(
  text: string,
  foreColor: AnsiColor,
  backColor: AnsiColor = AnsiColor.Black,
) {
  drawAscii(getColorText(text, foreColor, backColor));
}

export function getColor(
  foreColor: AnsiColor,
  backColor: AnsiColor = AnsiColor.Black,
) {
  return `${ESC}${AnsiColorCodesFront[foreColor]};${
    AnsiColorCodesBack[backColor]
  }`;
}

export function drawColor(
  foreColor: AnsiColor,
  backColor: AnsiColor = AnsiColor.Black,
) {
  drawAscii(getColor(foreColor, backColor));
}

export function getResetColor() {
  return `${ESC}0m`;
}

export function drawResetColor() {
  drawAscii(getResetColor());
}

export function drawBox(x: number, y: number, width: number, height: number) {
  let box = new AsciiBuffer();

  box.add(getMoveCursorTo(x, y));
  box.add(DoubleLineElements.CornerTopLeft);
  box.add(DoubleLineElements.Horizontal, width - 2);
  box.add(DoubleLineElements.CornerTopRight);
  for (let i = 0; i < height - 2; i++) {
    box.add(getMoveCursorTo(x, y + 1 + i));
    box.add(DoubleLineElements.Vertical);
    box.add(getMoveCursorTo(x + width, y + 1 + i));
    box.add(DoubleLineElements.Vertical);
  }
  box.add(getMoveCursorTo(x, y + height));
  box.add(DoubleLineElements.CornerBottomLeft);
  box.add(DoubleLineElements.Horizontal, width - 2);
  box.add(DoubleLineElements.CornerBottomRight);

  drawAsciiBuffer(box);
}
