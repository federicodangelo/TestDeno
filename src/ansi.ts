import { readInputRaw, initInput, shutdownInput } from "./input.ts";

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
  resetColor();
  showCursor();
  shutdownInput();
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

export function writeAnsi(str: string, escIncluded = false) {
  if (!escIncluded) {
    Deno.stdout.writeSync(encoder.encode(ESC + str));
  } else {
    Deno.stdout.writeSync(encoder.encode(str));
  }
}

export function clearScreen() {
  writeAnsi("2J");
  moveCursorTo(0, 0);
}

export function moveCursorTo(x: number, y: number) {
  writeAnsi(`${y + 1};${x + 1}H`);
}

export async function getConsoleSize(): Promise<{ width: any; height: any }> {
  writeAnsi("s"); //save cursor position
  writeAnsi("999;999H"); //Move to huge bottom / right position
  writeAnsi("6n"); //request cursor position
  writeAnsi("u"); //restore cursor position

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

export function hideCursor() {
  writeAnsi("?25l");
}

export function showCursor() {
  writeAnsi("?25h");
}

export function getColor(
  text: string,
  foreColor: AnsiColor,
  backColor: AnsiColor
) {
  return `${ESC}${AnsiColorCodesFront[foreColor]};${AnsiColorCodesBack[backColor]}m${text}`;
}

export function writeColor(
  text: string,
  foreColor: AnsiColor,
  backColor: AnsiColor = AnsiColor.Black
) {
  writeAnsi(getColor(text, foreColor, backColor), true);
}

export function resetColor() {
  writeAnsi("0m");
}
