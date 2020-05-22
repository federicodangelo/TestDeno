const encoder = new TextEncoder();
const decoder = new TextDecoder();

const ESC = "\u001b[";
const RESET = `${ESC}39;49;m`;
const END_COLORS = "m";

export function initAnsi() {
  Deno.setRaw(Deno.stdin.rid, true);
}

export function shutdownAnsi() {
  Deno.setRaw(Deno.stdin.rid, false);
}

export function writeAnsi(str: string) {
  Deno.stdout.writeSync(encoder.encode(ESC + str));
}

export function clearScreen() {
  writeAnsi("2J");
  moveCursorTo(0, 0);
}

export function moveCursorTo(x: number, y: number) {
  writeAnsi(`${y + 1};${x + 1}H`);
}

export async function readStdinRaw(maxLen = 512): Promise<string> {
  const buffer = new Uint8Array(maxLen);
  const readBytes = await Deno.stdin.read(buffer);

  if (readBytes !== null) {
    return decoder.decode(buffer.subarray(0, readBytes));
  }

  return "";
}

export async function getConsoleSize(): Promise<{ width: any; height: any }> {
  writeAnsi("s"); //save cursor position
  writeAnsi("999;999H"); //Move to huge bottom / right position
  writeAnsi("6n"); //request cursor position
  writeAnsi("u"); //restore cursor position

  const line = await readStdinRaw(); //Read cursor position
  //Cursor position response format is "ESC[_posy_;_pos_x_R"
  if (line.startsWith(ESC) && line.endsWith("R")) {
    const { [0]: height, [1]: width } = line.substring(2).replace("R", "")
      .split(";").map((x) => parseInt(x));

    return { width, height };
  } else {
    return { width: 0, height: 0 };
  }
}