import {
  initInput,
  shutdownInput,
  readInput,
  readInputBetween,
} from "./input.ts";
import {
  AnsiColor,
  AnsiColorCodesFront,
  AnsiColorCodesBack,
  DoubleLineElements,
} from "./types.ts";
import { delay } from "../utils.ts";

const useUTF8 = Deno.build.os !== "windows";

const encoder = new TextEncoder();

const ESC = "\u001b[";

export const consoleSize = { width: 0, height: 0 };

export async function initAnsi() {
  initInput();
  await updateConsoleSize();
  hideCursor();
}

export function shutdownAnsi() {
  drawAscii(`${ESC}0m`); //reset color
  showCursor();
  shutdownInput();
}

export function hideCursor() {
  drawAscii(`${ESC}?25l`);
}

export function showCursor() {
  drawAscii(`${ESC}?25h`);
}

export async function updateConsoleSize(): Promise<boolean> {
  drawAscii(`${ESC}s`); //save cursor position
  drawAscii(`${ESC}999;999H`); //Move to huge bottom / right position
  drawAscii(`${ESC}6n`); //request cursor position
  drawAscii(`${ESC}u`); //restore cursor position

  let line = readInputBetween(ESC, "R");

  while (line.length === 0) {
    await delay(1);
    line = readInputBetween(ESC, "R");
  }

  //Cursor position response format is "ESC[_posy_;_pos_x_R"
  const { [0]: height, [1]: width } = line
    .substr(2)
    .replace("R", "")
    .split(";")
    .map((x) => parseInt(x));

  if (width !== consoleSize.width || height !== consoleSize.height) {
    consoleSize.width = width;
    consoleSize.height = height;
    return true;
  }

  return false;
}

function drawAscii(str: string) {
  if (useUTF8) {
    Deno.stdout.writeSync(encoder.encode(str));
  } else {
    Deno.stdout.writeSync(encodeAscii(str));
  }
}

function encodeAscii(str: string) {
  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer;
}

function drawAsciiBuffer(buffer: AnsiScreen) {
  const codes16 = buffer.getArray();
  const codes8 = new Uint8Array(codes16.length);
  codes8.set(codes16);
  Deno.stdout.writeSync(codes8);
}

export class AnsiScreen {
  private buffer: Uint16Array;
  private offset = 0;

  public constructor(capacity = 8192) {
    this.buffer = new Uint16Array(capacity);
  }

  public text(str: string) {
    while (str.length + this.offset > this.buffer.length) {
      const newBuffer = new Uint16Array(this.buffer.length * 2);
      newBuffer.set(this.buffer, 0);
      this.buffer = newBuffer;
    }
    for (let i = 0; i < str.length; i++) {
      this.buffer[this.offset++] = str.charCodeAt(i);
    }
    return this;
  }

  public textTimes(str: string, times: number) {
    for (let t = 0; t < times; t++) {
      this.text(str);
    }
    return this;
  }

  public apply() {
    drawAsciiBuffer(this);
    this.offset = 0;
  }

  public getArray() {
    return this.buffer.subarray(0, this.offset);
  }

  public clearScreen() {
    this.text(ESC);
    this.text("2J");
    this.moveCursorTo(0, 0);
    return this;
  }

  public moveCursorTo(x: number, y: number) {
    this.text(ESC);
    this.text((y + 1).toString());
    this.text(";");
    this.text((x + 1).toString());
    this.text("H");
    return this;
  }

  public color(
    foreColor: AnsiColor,
    backColor: AnsiColor = AnsiColor.Black,
  ) {
    this.text(ESC);
    this.text(AnsiColorCodesFront[foreColor]);
    this.text(";");
    this.text(AnsiColorCodesBack[backColor]);
    this.text("m");
    return this;
  }

  public resetColor() {
    this.text(ESC);
    this.text("0m");
    return this;
  }

  public border(x: number, y: number, width: number, height: number) {
    this.moveCursorTo(x, y);
    this.text(DoubleLineElements.CornerTopLeft);
    this.textTimes(DoubleLineElements.Horizontal, width - 2);
    this.text(DoubleLineElements.CornerTopRight);
    for (let i = 0; i < height - 2; i++) {
      this.moveCursorTo(x, y + 1 + i);
      this.text(DoubleLineElements.Vertical);
      this.moveCursorTo(x + width, y + 1 + i);
      this.text(DoubleLineElements.Vertical);
    }
    this.moveCursorTo(x, y + height);
    this.text(DoubleLineElements.CornerBottomLeft);
    this.textTimes(DoubleLineElements.Horizontal, width - 2);
    this.text(DoubleLineElements.CornerBottomRight);
    return this;
  }

  public fill(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
  ) {
    for (let i = y; i < y + height; i++) {
      this.moveCursorTo(x, i);
      this.textTimes(char, width);
    }
  }
}
