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

let availableInput = "";

export function updateInput() {
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
  const toReturn = availableInput;
  availableInput = "";
  return toReturn;
}

export function readInputBetween(from: string, to: string) {
  updateInput();

  const first = availableInput.indexOf(from);
  const last = availableInput.indexOf(to, first + from.length);

  if (first >= 0 && last >= 0) {
    const toReturn = availableInput.substring(first, last);

    const before = availableInput.substring(0, first);
    const after = availableInput.substring(last + to.length);
    availableInput = before + after;
    return toReturn;
  }

  return "";
}
