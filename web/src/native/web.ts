import { NativeContext } from "engine/native-types.ts";
import { Size, SpecialChar, Color, FixedColor } from "engine/types.ts";

export const createFullScreenCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  return canvas;
};

function colorToFillStyle(color: Color): string {
  if (color <= 16) {
    switch (color) {
      case FixedColor.Black:
        return "rgb(12,12,12)";
      case FixedColor.Red:
        return "rgb(197,15,31)";
      case FixedColor.Green:
        return "rgb(19,161,14)";
      case FixedColor.Yellow:
        return "rgb(193,156,0)";
      case FixedColor.Blue:
        return "rgb(0,55,218)";
      case FixedColor.Magenta:
        return "rgb(136,23,152)";
      case FixedColor.Cyan:
        return "rgb(58,150,221)";
      case FixedColor.White:
        return "rgb(204,204,204)";

      case FixedColor.BrightBlack:
        return "rgb(118,118,118)";
      case FixedColor.BrightRed:
        return "rgb(231,72,86)";
      case FixedColor.BrightGreen:
        return "rgb(22,198,12)";
      case FixedColor.BrightYellow:
        return "rgb(249,241,165)";
      case FixedColor.BrightBlue:
        return "rgb(59,120,255)";
      case FixedColor.BrightMagenta:
        return "rgb(180,0,158)";
      case FixedColor.BrightCyan:
        return "rgb(97,214,214)";
      case FixedColor.BrightWhite:
        return "rgb(242,242,242)";
    }

    return "white";
  }

  if (color < 232) {
    color -= 16;

    const r = Math.trunc((Math.trunc(color / 36)) * 255 / 6);
    const g = Math.trunc((Math.trunc((color / 6)) % 6) * 255 / 6);
    const b = Math.trunc((Math.trunc(color % 6)) * 255 / 6);

    return `rgb(${r},${g},${b})`;
  }

  return `black`;
}

export function getWebNativeContext(): NativeContext {
  const charSize = 24;
  const canvas = createFullScreenCanvas();
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const consoleSize = new Size(
    Math.trunc(canvas.width / charSize),
    Math.trunc(canvas.height / charSize),
  );

  let screenSizeChangedListeners: ((size: Size) => void)[] = [];
  let inputListeners: ((intut: string) => void)[] = [];

  let lastForeColor = -1;
  let lastBackColor = -1;

  const updateContext = () => {
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.font = `${charSize}px Lucida Console`;
  };

  const setChar = (
    char: number,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
  ) => {
    //ctx.clearRect(x * charSize, y * charSize, charSize, charSize);
    ctx.fillStyle = colorToFillStyle(backColor);
    ctx.fillRect(x * charSize, y * charSize, charSize, charSize);
    ctx.fillStyle = colorToFillStyle(foreColor);
    ctx.fillText(String.fromCharCode(char), x * charSize, (y + 1) * charSize);
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
    consoleSize.set(
      Math.trunc(canvas.width / charSize),
      Math.trunc(canvas.height / charSize),
    );
    updateContext();
    screenSizeChangedListeners.forEach((l) => l(consoleSize));
  };

  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("resize", handleResize);

  return {
    screen: {
      getScreenSize: () => consoleSize,
      clearScreen: () => {},
      onScreenSizeChanged: (listener) => {
        screenSizeChangedListeners.push(listener);
      },
      reset: () => {
        lastForeColor = -1;
        lastBackColor = -1;
        updateContext();
      },
      setChar: (
        char: number,
        foreColor: Color,
        backColor: Color,
        x: number,
        y: number,
      ) => {
        setChar(char, foreColor, backColor, x, y);
      },
      setSpecialChar: (
        char: SpecialChar,
        foreColor: Color,
        backColor: Color,
        x: number,
        y: number,
      ) => {
        setChar(char, foreColor, backColor, x, y);
      },
      apply: () => {},
    },
    input: {
      onInput: (listener) => {
        inputListeners.push(listener);
      },
    },
    destroy: () => {},
  };
}
