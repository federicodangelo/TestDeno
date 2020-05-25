import { initInput, shutdownInput, readInputBetween } from "./input.ts";
import {
  Size,
  Point,
  Color,
  SpecialChar,
} from "./../types.ts";
import { NativeContext } from "./types.ts";

const ESC = "\u001b[";

const useCp437 = Deno.build.os === "windows";

const AnsiSpecialChar: number[] = [
  //Block
  useCp437 ? 219 : "█".charCodeAt(0),
  useCp437 ? 220 : "▄".charCodeAt(0),
  useCp437 ? 224 : "▀".charCodeAt(0),
  useCp437 ? 221 : "▌".charCodeAt(0),
  useCp437 ? 222 : "▌".charCodeAt(0),

  //Shade
  useCp437 ? 176 : "░".charCodeAt(0),
  useCp437 ? 177 : "▒".charCodeAt(0),
  useCp437 ? 178 : "▓".charCodeAt(0),

  ////Single Line
  useCp437 ? 179 : "│".charCodeAt(0),
  useCp437 ? 196 : "─".charCodeAt(0),
  useCp437 ? 218 : "┌".charCodeAt(0),
  useCp437 ? 191 : "┐".charCodeAt(0),
  useCp437 ? 192 : "└".charCodeAt(0),
  useCp437 ? 217 : "┘".charCodeAt(0),
  useCp437 ? 180 : "┤".charCodeAt(0),
  useCp437 ? 195 : "├".charCodeAt(0),
  useCp437 ? 193 : "┴".charCodeAt(0),
  useCp437 ? 194 : "┬".charCodeAt(0),
  useCp437 ? 197 : "┼".charCodeAt(0),

  //Double Line
  useCp437 ? 186 : "║".charCodeAt(0),
  useCp437 ? 205 : "═".charCodeAt(0),
  useCp437 ? 201 : "╔".charCodeAt(0),
  useCp437 ? 187 : "╗".charCodeAt(0),
  useCp437 ? 200 : "╚".charCodeAt(0),
  useCp437 ? 188 : "╝".charCodeAt(0),
  useCp437 ? 185 : "╣".charCodeAt(0),
  useCp437 ? 204 : "╠".charCodeAt(0),
  useCp437 ? 202 : "╩".charCodeAt(0),
  useCp437 ? 203 : "╦".charCodeAt(0),
  useCp437 ? 206 : "╬".charCodeAt(0),
];

const AnsiColorCodesFront = [
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

const AnsiColorCodesBack = [
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

const encoder = new TextEncoder();

export function initAnsi() {
  initInput();
  hideCursor();
  enableMouseReporting();
}

export function shutdownAnsi() {
  drawAscii(`${ESC}0m`); //reset color
  disableMouseReporting();
  showCursor();
  shutdownInput();
}

function enableMouseReporting() {
  drawAscii(`${ESC}?9h`);
}

function disableMouseReporting() {
  drawAscii(`${ESC}?9l`);
}

function hideCursor() {
  drawAscii(`${ESC}?25l`);
}

function showCursor() {
  drawAscii(`${ESC}?25h`);
}

export function clearScreen() {
  drawAscii(`${ESC}2J`);
}

export function requestUpdateConsoleSize() {
  drawAscii(`${ESC}?25l`); //hide cursor
  drawAscii(`${ESC}s`); //save cursor position
  drawAscii(`${ESC}999;999H`); //Move to huge bottom / right position
  drawAscii(`${ESC}6n`); //request cursor position
  drawAscii(`${ESC}u`); //restore cursor position
}

export function getConsoleSizeFromInput(): Size | null {
  let line = readInputBetween(ESC, "R");

  while (line.length === 0) return null;

  //Cursor position response format is "ESC[_posy_;_pos_x_R"
  const { [0]: height, [1]: width } = line
    .substr(2)
    .replace("R", "")
    .split(";")
    .map((x) => parseInt(x));

  return new Size(width, height);
}

export function getMouse(): Point | null {
  //TODO
  return null;
}

function drawAscii(str: string) {
  if (useCp437) {
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

export function getAnsiNativeContext(): NativeContext {
  let lastDrawForeColor: Color | null = null;
  let lastDrawBackColor: Color | null = null;
  let lastDrawX: number = NaN;
  let lastDrawY: number = NaN;

  let buffer: number[] = [];
  let offset = 0;

  buffer.fill(0, 0, 8192);

  function addToBuffer(str: string) {
    for (let i = 0; i < str.length; i++) {
      if (offset < buffer.length) {
        buffer[offset++] = str.charCodeAt(i);
      } else {
        buffer.push(str.charCodeAt(i));
        offset++;
      }
    }
  }

  function addToBufferChar(code: number) {
    if (offset < buffer.length) {
      buffer[offset++] = code;
    } else {
      buffer.push(code);
      offset++;
    }
  }

  function setChar(
    code: number,
    foreColor: Color,
    backColor: Color,
    screenX: number,
    screenY: number,
  ) {
    if (lastDrawX !== screenX || lastDrawY !== screenY) {
      addToBuffer(ESC);
      addToBuffer((screenY + 1).toString());
      addToBuffer(";");
      addToBuffer((screenX + 1).toString());
      addToBuffer("H");
      lastDrawX = screenX;
      lastDrawY = screenY;
    }

    if (
      lastDrawForeColor !== foreColor ||
      lastDrawBackColor !== backColor
    ) {
      addToBuffer(ESC);
      addToBuffer(AnsiColorCodesFront[foreColor]);
      addToBuffer(";");
      addToBuffer(AnsiColorCodesBack[backColor]);
      addToBuffer("m");
      lastDrawForeColor = foreColor;
      lastDrawBackColor = backColor;
    }

    addToBufferChar(code);
    lastDrawX++;
  }

  return {
    reset: () => {
      lastDrawX = NaN;
      lastDrawY = NaN;
      lastDrawForeColor = null;
      lastDrawBackColor = null;
      offset = 0;
    },
    setChar,
    setSpecialChar: (
      char: SpecialChar,
      foreColor: Color,
      backColor: Color,
      x: number,
      y: number,
    ) => {
      setChar(AnsiSpecialChar[char], foreColor, backColor, x, y);
    },
    apply: () => {
      if (useCp437) {
        const codes8 = new Uint8Array(offset);
        for (let i = 0; i < offset; i++) {
          codes8[i] = buffer[i];
        }
        Deno.stdout.writeSync(codes8);
      } else {
        const str = String.fromCharCode(...buffer.slice(0, offset));
        Deno.stdout.writeSync(encoder.encode(str));
      }
      offset = 0;
    },
  };
}
