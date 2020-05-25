import { initInput, shutdownInput, readInputBetween } from "./input.ts";
import { ESC, Size, Point, useCp437 } from "./types.ts";

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
