import { Color, SpecialChar } from "../types.ts";

export interface NativeContext {
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
