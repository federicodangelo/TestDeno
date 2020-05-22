import { readStringDelim } from "https://deno.land/std@v0.52.0/io/bufio.ts";

const ESC = "\u001b[";
const RESET = `${ESC}39;49;m`;
const END_COLORS = "m";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function writeAnsi(str: string) {
  Deno.stdout.writeSync(encoder.encode(str));
}

async function readStdinRaw(): Promise<string> {
  Deno.setRaw(Deno.stdin.rid, true);
  const buffer = new Uint8Array(512);
  const readBytes = await Deno.stdin.read(buffer);
  Deno.setRaw(Deno.stdin.rid, false);

  if (readBytes !== null) {
    return decoder.decode(buffer.subarray(0, readBytes));
  }

  return "";
}

console.log("hello");
writeAnsi(`${ESC}999;999H`);
writeAnsi(`${ESC}6n`);
console.log("\n");
const line = await readStdinRaw();

const { [0]: width, [1]: height } = line.substring(2).split(";").map(
  parseFloat,
);

console.log("console dimensions: ", { width, height });

Deno.exit();
