type FontSrc = {
  data: string;
  dimensions: { width: number; height: number };
};

export type FontInfo = {
  pixels: Uint8ClampedArray[];
  dimensions: { width: number; height: number };
};

export const DEFAULT_FONT = "font9x14";

const fonts = new Map<string, FontSrc>([
  ["font16x16", {
    data:
      "data:image/png;base64,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",
    dimensions: { width: 16, height: 16 },
  }],
  ["font8x8", {
    data:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACAAQAAAADrRVxmAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAd2KE6QAAAT4SURBVEjHjVVBixRHFH60HanD4D6GBuswZGo7jUyCSLuKFFrprXmpbGaWIQmL5hTMMhvMxcPiwQyhUrsRDwZyEMGDPyCX/AdB0EMOOefixZPewhwW9bD05FXP7K5iAr6p7h6++uq9V6/eewUQwnXUCDOYLZnVVQnwy6zWngHz+BgtLz8F+P1p7bWWL649+IBWV03DqGtvHtPDn0ktvwB4+Nj7uo7AbaM+YuDBC63/9nHJbbn5Q7MEWaLS2+HZc1YaAoDW0exEPnokYTeRxU4FkklzeXbCFPe2wGiUJRRYw+sqFPc0BI+tTXtN11DXsrjhQF6+XNd25j0zZNF2IaCPjFqzjgBtHQxqWYaiRrZiivZf4cgKAO94wm4cChaFhBJRHQC6KKrxABW6uCiJQLDfl8oKHYGUl0BhxDdgRe0hgIhASPAOLBiNrcKfugNRB0JUzUvk2s3FX7TwpjSWDRojQicYDp4ANEAlkbSKiGIgBcHa10nS8zaNgAppAuvY6gwSL0wFYCFJYQPLpE4IKYlKUwFjJBLMp5R1BHbU+GA6hm1pRLYi3nEDjPSdSQgd0ifG21tjCVTkOY+cMC3UlY0CrlJu817PMtBTw3WCDTI219oGTEvVXyO4GhrGl4Sup/pEYCnqUKzDFXmfCjAUrWx/SFpvhT5JeEe88WaH+iw7k90JhzSnnIYMsCfWil4DWMFAlqVWCceuE4eQ+kMhhEVxi3e03ksE5cNMoBVxr8oUHI9smItlm0Zg+9gNjoe40O/sTJLJu17M+LQ24Ti0YBOTzbLJFw5UAu0YLtWctDDKJAY/PV0eL/Dmt3x+yRm6SJpWMOnhcEwA1Vm7FpByTEoccjyAztKaxSpH6s2B1TPmktHJWNMpPSRzGAXe1RupOv+0sFx5C+CzHAm4fuF65Tkejnw83AxWRisWOR49EnEPOQO5YS+GGFNKQB9On1dJey0b9io1B1S67VsXxQWXeLYCO7B94siTeX5Ay1CJHOyy8CWfHDmgOBFft0BKTkWjWQyLLGXBM45SFsupLFDw5owLcdaGEBgIBC1nHYuxfLLMCJBUpmI5zqyO7nCAFlHoHMaiBV0JSipgpdK9jhNFQVgguySK3qgN/pybUwuqlOcUUq0d1kdR7DY6D3rV0UKs8l8xw82BipdQrH9/6YvoqUmkER4/v3tovqlSeL4JrVYKK+dNLHyi+ZxIRyMXbT95gu0BaBmpLnaTwTo7yYXJ6T+utArh5UsctIGzlmiDi9gmH3/C/QhcBNaDJ5t89l3UUXHR0lpj9rdbR72skW4S3/mVp3yoGUCW8WDKnT9+fBtoGNMMpnvZ/l42jYx/GgamWZoeMKbTvX1m7O3vT6cHOjIeWZNuCytHwELHERD7HUQEmt//At3sZPfV7OTs1eyQEZt0s7fubBbHyS5PNwxoONgoiK/3AOLA+MSrbro0+w+AR7fLn7cY+AZjxk6wzGbT+CxFI1l84ibeG2AJsX6k7EDS4gM0YZXAneNzVuMUCc4SXVaVG2nu9/eNIlj3NpMDJ1wg8+u6YTLZTA1+Eo4Kur+xYNCArxtO+bGJOqzNQsnFI68ZsC2KFwLL7rxsdxdNooV80wEsTWIjCyiwjXJlwAnrBk2Jp6qNMGoAvoAaBl8bUHICO2XmOjg4K1zlwk3MfGN4V4748+e8U3m+je827bx31LY2Dy5egH8BP/2Mtt7WOCkAAAAASUVORK5CYII=",
    dimensions: { width: 8, height: 8 },
  }],
  ["font9x14", {
    data:
      "data:image/png;base64,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",
    dimensions: { width: 9, height: 14 },
  }],
]);

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function initFonts(): Promise<Map<string, FontInfo>> {
  const map = new Map<string, FontInfo>();
  for (var kv of fonts) {
    const id = kv[0];
    const font = kv[1];

    const image = await loadImage(font.data);

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.drawImage(image, 0, 0);
    const pixels: Uint8ClampedArray[] = [];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const pxs = ctx.getImageData(
          x * font.dimensions.width,
          y * font.dimensions.height,
          font.dimensions.width,
          font.dimensions.height,
        ).data;

        const solidPixels = new Uint8ClampedArray(pxs.length / 4);

        let solidIndex = 0;

        for (let i = 0; i < pxs.length; i += 4) {
          solidPixels[solidIndex++] = (pxs[i] + pxs[i + 1] + pxs[i + 2]) > 0
            ? 1
            : 0;
        }

        pixels.push(solidPixels);
      }
    }

    map.set(id, {
      pixels,
      dimensions: font.dimensions,
    });
  }

  return map;
}
