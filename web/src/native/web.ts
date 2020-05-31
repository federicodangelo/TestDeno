import { NativeContext } from "engine/native-types.ts";
import { Size, SpecialChar, Color } from "engine/types.ts";

export function getWebNativeContext(): NativeContext {
  return {
    screen: {
      getScreenSize: () => new Size(100, 100),
      clearScreen: () => {},
      onScreenSizeChanged: (listener) => {},
      reset: () => {},
      setChar: (
        char: number,
        foreColor: Color,
        backColor: Color,
        x: number,
        y: number,
      ) => {},
      setSpecialChar: (
        char: SpecialChar,
        foreColor: Color,
        backColor: Color,
        x: number,
        y: number,
      ) => {},
      apply: () => {},
    },
    input: {
      onInput: (listener) => {},
    },
    destroy: () => {},
  };
}
