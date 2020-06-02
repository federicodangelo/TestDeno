import { NativeContext } from "engine/native-types.ts";
import { Size, SpecialChar, Color, FixedColor } from "engine/types.ts";
import { initFonts, FontInfo, DEFAULT_FONT } from "./fonts.ts";

export const createFullScreenCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  return canvas;
};

const useCp437 = true;

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

type RGB = number;

function rgb(r: number, g: number, b: number): RGB {
  return (
    (255 << 24) | // alpha
    (b << 16) | // blue
    (g << 8) | // green
    r
  );
}

function colorToRGB(color: Color): RGB {
  if (color <= 16) {
    switch (color) {
      case FixedColor.Black:
        return rgb(12, 12, 12);
      case FixedColor.Red:
        return rgb(197, 15, 31);
      case FixedColor.Green:
        return rgb(19, 161, 14);
      case FixedColor.Yellow:
        return rgb(193, 156, 0);
      case FixedColor.Blue:
        return rgb(0, 55, 218);
      case FixedColor.Magenta:
        return rgb(136, 23, 152);
      case FixedColor.Cyan:
        return rgb(58, 150, 221);
      case FixedColor.White:
        return rgb(204, 204, 204);

      case FixedColor.BrightBlack:
        return rgb(118, 118, 118);
      case FixedColor.BrightRed:
        return rgb(231, 72, 86);
      case FixedColor.BrightGreen:
        return rgb(22, 198, 12);
      case FixedColor.BrightYellow:
        return rgb(249, 241, 165);
      case FixedColor.BrightBlue:
        return rgb(59, 120, 255);
      case FixedColor.BrightMagenta:
        return rgb(180, 0, 158);
      case FixedColor.BrightCyan:
        return rgb(97, 214, 214);
      case FixedColor.BrightWhite:
        return rgb(242, 242, 242);
    }

    return rgb(204, 204, 204);
  }

  if (color < 232) {
    color -= 16;

    const r = Math.trunc((Math.trunc(color / 36) * 255) / 6);
    const g = Math.trunc(((Math.trunc(color / 6) % 6) * 255) / 6);
    const b = Math.trunc((Math.trunc(color % 6) * 255) / 6);

    return rgb(r, g, b);
  }

  return rgb(0, 0, 0);
}

export function getWebNativeContext(): NativeContext {
  const canvas = createFullScreenCanvas();
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const consoleSize = new Size(8, 8);

  let charWidth: number = 8;
  let charHeight: number = 8;
  let fonts: Map<string, FontInfo>;
  let activeFont: FontInfo;
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let imageDataPixels = imageData.data;
  let imageDataPixels32: Uint32Array = new Uint32Array(imageDataPixels.buffer);

  let lastForeColor = -1;
  let lastBackColor = -1;
  const colorsRGB = new Uint32Array(2);
  let dirty = true;

  ctx.imageSmoothingEnabled = false;

  let screenSizeChangedListeners: ((size: Size) => void)[] = [];
  let inputListeners: ((intut: string) => void)[] = [];

  const updateConsoleSize = () => {
    consoleSize.set(
      Math.trunc(canvas.width / charWidth),
      Math.trunc(canvas.height / charHeight)
    );
  };

  const setChar = (
    char: number,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number
  ) => {
    dirty = true;

    if (lastForeColor !== foreColor) {
      lastForeColor = foreColor;
      colorsRGB[1] = colorToRGB(foreColor);
    }

    if (lastBackColor !== backColor) {
      lastBackColor = backColor;
      colorsRGB[0] = colorToRGB(backColor);
    }

    if (char < 0 || char > 255) return;

    const charPixels = activeFont.pixels[char];

    const fx = x * charWidth;
    const fy = y * charHeight;

    let p = 0;
    let f = 0;

    for (let py = 0; py < charHeight; py++) {
      p = (fy + py) * imageData.width + fx;
      f = py * charWidth;
      //for (let px = 0; px < charWidth; px++) {
      //      imageDataPixels32[p++] = colorsRGB[charPixels[f++]];
      //}

      imageDataPixels32[p + 0] = colorsRGB[charPixels[f + 0]];
      imageDataPixels32[p + 1] = colorsRGB[charPixels[f + 1]];
      imageDataPixels32[p + 2] = colorsRGB[charPixels[f + 2]];
      imageDataPixels32[p + 3] = colorsRGB[charPixels[f + 3]];
      imageDataPixels32[p + 4] = colorsRGB[charPixels[f + 4]];
      imageDataPixels32[p + 5] = colorsRGB[charPixels[f + 5]];
      imageDataPixels32[p + 6] = colorsRGB[charPixels[f + 6]];
      imageDataPixels32[p + 7] = colorsRGB[charPixels[f + 7]];
      imageDataPixels32[p + 8] = colorsRGB[charPixels[f + 8]];
      p += 9;
      f += 9;
    }
  };

  const handleKeyboard = (e: KeyboardEvent) => {
    const key = e.key;

    if (key.length === 1) {
      inputListeners.forEach((l) => l(key));
    }
  };

  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageDataPixels = imageData.data;
    imageDataPixels32 = new Uint32Array(imageDataPixels.buffer);
    updateConsoleSize();
    screenSizeChangedListeners.forEach((l) => l(consoleSize));
  };

  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("resize", handleResize);
  updateConsoleSize();

  return {
    screen: {
      getScreenSize: () => consoleSize,
      onScreenSizeChanged: (listener) => {
        screenSizeChangedListeners.push(listener);
      },
      setChar: (
        char: number,
        foreColor: Color,
        backColor: Color,
        x: number,
        y: number
      ) => {
        setChar(char, foreColor, backColor, x, y);
      },
      setSpecialChar: (
        char: SpecialChar,
        foreColor: Color,
        backColor: Color,
        x: number,
        y: number
      ) => {
        setChar(AnsiSpecialChar[char], foreColor, backColor, x, y);
      },
      beginDraw: () => {},
      endDraw: () => {
        if (dirty) {
          ctx.putImageData(imageData, 0, 0);
          dirty = false;
        }
      },
    },
    input: {
      onInput: (listener) => {
        inputListeners.push(listener);
      },
    },
    init: async () => {
      fonts = await initFonts();
      activeFont = fonts.get(DEFAULT_FONT) as FontInfo;
      charWidth = activeFont.dimensions.width;
      charHeight = activeFont.dimensions.height;
      updateConsoleSize();
    },
    destroy: () => {},
  };
}
