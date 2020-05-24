import { initInput, shutdownInput, readInputBetween } from "./input.ts";
import { delay } from "../utils.ts";
import { ESC } from "./types.ts";

const useUTF8 = Deno.build.os !== "windows";

const encoder = new TextEncoder();

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

export function clearScreen() {
  drawAscii(`${ESC}2J`);
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
