export function initInput() {
  Deno.setRaw(Deno.stdin.rid, true);
}

export function shutdownInput() {
  Deno.setRaw(Deno.stdin.rid, false);
}

const decoder = new TextDecoder();

async function readStdinRaw(maxLen = 512): Promise<string> {
  const buffer = new Uint8Array(maxLen);
  const readBytes = await Deno.stdin.read(buffer);

  if (readBytes !== null) {
    return decoder.decode(buffer.subarray(0, readBytes));
  }

  return "";
}

export async function readInputRaw() {
  return readStdinRaw();
}

let availableInput = "";

function updateInput() {
  const readFn = () =>
    readStdinRaw().then((str) => {
      availableInput += str;
    });

  readFn();
}

export function hasInput() {
  updateInput();
  return availableInput.length > 0;
}

export function readInput() {
  updateInput();
  const toReturn = availableInput;
  availableInput = "";
  return toReturn;
}
