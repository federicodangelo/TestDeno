import { Color, SpecialChar, Size } from "./types.ts";

export interface NativeContextScreen {
  getScreenSize(): Size | null;
  onScreenSizeChanged(listener: (size: Size) => void): void;

  clearScreen(): void;
  reset(): void;
  setChar(
    char: number,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
  ): void;
  setSpecialChar(
    char: SpecialChar,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
  ): void;
  apply(): void;
}

export interface NativeContextInput {
  onInput(listener: (input: string) => void): void;
}

export interface NativeContext {
  screen: NativeContextScreen;
  input: NativeContextInput;
  destroy(): void;
}
