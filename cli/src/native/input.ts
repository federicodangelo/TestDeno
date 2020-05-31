let running = true;
const decoder = new TextDecoder();

export function initInput(inputCb: (str: string) => void) {
  Deno.setRaw(Deno.stdin.rid, true);
  running = true;

  const buffer = new Uint8Array(512);

  const update = () => {
    Deno.stdin.read(buffer).then((readBytes) => {
      if (!running) return;

      if (readBytes !== null) {
        inputCb(decoder.decode(buffer.subarray(0, readBytes)));
      }
      update();
    });
  };

  update();
}

export function shutdownInput() {
  running = false;
  Deno.setRaw(Deno.stdin.rid, false);
}
