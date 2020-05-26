import { Color, SpecialChar, Size } from "../types.ts";

export interface NativeContextDraw {
  getScreenSize(): Size | null;
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
  readInput(): string;
}

export interface NativeContext extends NativeContextDraw, NativeContextInput {
  destroy(): void;
}
