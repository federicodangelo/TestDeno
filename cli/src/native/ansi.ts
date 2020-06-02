import {
  initInput,
  shutdownInput,
} from "./input.ts";
import {
  Size,
  Point,
  Color,
  SpecialChar,
} from "engine/types.ts";
import { NativeContext } from "engine/native-types.ts";

const ESC = "\u001b";
const CSI = "\u001b[";

const useCp437 = Deno.build.os === "windows";

let consoleSize: Size | null = null;

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

const encoder = new TextEncoder();

function shutdownAnsi() {
  drawAscii(`${CSI}!p`); //reset
  drawAscii(`${CSI}0m`); //reset
  drawAscii(`${CSI}39m`); //reset fore color
  drawAscii(`${CSI}49m`); //reset back color
  drawAscii(`${CSI}?25h`); //show cursor

  shutdownInput();
}

function clearScreen() {
  drawAscii(`${CSI}2J${CSI}0;0H`); //Clear and move top-left
}

function getEscapeSequence(str: string, sequenceChar: string | null = null) {
  const first = str.indexOf("\u001b");
  if (first < 0) return null;

  let last = first + CSI.length;
  let found = false;
  while (last < str.length) {
    const c = str.charCodeAt(last);
    if (
      sequenceChar !== null && c == sequenceChar.charCodeAt(0) ||
      sequenceChar === null &&
        (c >= "a".charCodeAt(0) && c <= "z".charCodeAt(0) ||
          c >= "A".charCodeAt(0) && c <= "Z".charCodeAt(0))
    ) {
      found = true;
      break;
    }
    last++;
  }

  if (!found) return null;

  const sequence = str.substring(first, last + 1);
  const before = str.substring(0, first);
  const after = str.substring(last + 1);
  const remaining = before + after;

  return { sequence, remaining };
}

function drawAscii(str: string) {
  if (useCp437) {
    Deno.writeAllSync(Deno.stdout, encoder.encode(str));
  } else {
    Deno.writeAllSync(Deno.stdout, encodeAscii(str));
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
  let screenSizeChangedListeners: ((size: Size) => void)[] = [];
  let inputListeners: ((intut: string) => void)[] = [];
  let availableInput = "";
  let pendingRequestUpdateConsoleSize = false;

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
      addToBuffer(CSI);
      addToBuffer((screenY + 1).toString());
      addToBuffer(";");
      addToBuffer((screenX + 1).toString());
      addToBuffer("H");
      lastDrawX = screenX;
      lastDrawY = screenY;
    }

    if (lastDrawForeColor !== foreColor) {
      addToBuffer(CSI);
      addToBuffer("38;5;");
      addToBuffer(foreColor.toFixed(0));
      addToBuffer("m");
      lastDrawForeColor = foreColor;
    }

    if (lastDrawBackColor !== backColor) {
      addToBuffer(CSI);
      addToBuffer("48;5;");
      addToBuffer(backColor.toFixed(0));
      addToBuffer("m");
      lastDrawBackColor = backColor;
    }

    addToBufferChar(code);
    lastDrawX++;
  }

  function getCursorPositionFromEscapeSequence(sequence: string): Point | null {
    if (!sequence.startsWith(CSI) || !sequence.endsWith("R")) return null;

    //Cursor position response format is "ESC[_posy_;_pos_x_R"
    const { [0]: y, [1]: x } = sequence
      .substring(CSI.length, sequence.length - 1) //Strip starting "ESC["" and ending "R"
      .split(";")
      .map((x) => parseInt(x));

    return new Point(x, y);
  }

  function processEscapeSequences(input: string): string {
    let result = getEscapeSequence(input);
    while (result !== null) {
      input = result.remaining;
      switch (result.sequence[result.sequence.length - 1]) {
        case "R": {
          //Cursor position
          const cursorPosition = getCursorPositionFromEscapeSequence(
            result.sequence,
          );
          if (cursorPosition !== null) {
            const newSize = new Size(cursorPosition.x, cursorPosition.y);
            consoleSize = newSize;
            screenSizeChangedListeners.forEach((l) => l(newSize));
            pendingRequestUpdateConsoleSize = false;
          }
          break;
        }

        case "c": {
          //Device Attributes
          break;
        }

        default:
          //TODO
          break;
      }
      result = getEscapeSequence(input);
    }
    return input;
  }

  function processInput(input: string): void {
    availableInput += input;
    availableInput = processEscapeSequences(availableInput);
    if (availableInput.length > 0) {
      inputListeners.forEach((l) => l(availableInput));
      availableInput = "";
    }
  }

  function requestUpdateConsoleSize() {
    if (pendingRequestUpdateConsoleSize) return;
    pendingRequestUpdateConsoleSize = true;

    const str = `${CSI}?25l` + //hide cursor
      `${CSI}s` + //save cursor position
      `${CSI}999;999H` + //Move to huge bottom / right position
      `${CSI}6n` + //request cursor position
      `${CSI}u`; //restore cursor position

    drawAscii(str);
  }

  function initAnsi() {
    initInput(processInput);
    drawAscii(`${CSI}!p`); //reset
    drawAscii(`${CSI}?25l`); //hide cursor
  }

  initAnsi();

  return {
    screen: {
      getScreenSize: () => {
        requestUpdateConsoleSize();
        return consoleSize;
      },
      onScreenSizeChanged: (listener) => {
        screenSizeChangedListeners.push(listener);
      },
      beginDraw: () => {
        requestUpdateConsoleSize();
        lastDrawX = NaN;
        lastDrawY = NaN;
        lastDrawForeColor = null;
        lastDrawBackColor = null;
        offset = 0;
      },
      setChar,
      setSpecialChar: (
        char: SpecialChar,
        foreColor: number,
        backColor: number,
        x: number,
        y: number,
      ) => {
        setChar(AnsiSpecialChar[char], foreColor, backColor, x, y);
      },
      endDraw: () => {
        if (useCp437) {
          const codes8 = new Uint8Array(offset);
          for (let i = 0; i < offset; i++) {
            codes8[i] = buffer[i];
          }
          Deno.writeAllSync(Deno.stdout, codes8);
        } else {
          const str = String.fromCharCode(...buffer.slice(0, offset));
          Deno.writeAllSync(Deno.stdout, encoder.encode(str));
        }
        offset = 0;
      },
    },
    input: {
      onInput: (listener) => {
        inputListeners.push(listener);
      },
    },
    init: async () => {
    },
    destroy: () => {
      shutdownAnsi();
      clearScreen();
    },
  };
}
