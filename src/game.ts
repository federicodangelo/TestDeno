import { CharacterWidget } from "./ansi/widgets/CharacterWidget.ts";
import { AnsiColor, Engine } from "./ansi/types.ts";
import { SplitPanelContainerWidget } from "./ansi/widgets/SplitPanelContainerWidget.ts";

const p1 = new CharacterWidget(
  "@",
  AnsiColor.BrightRed,
  AnsiColor.Black,
);
p1.x = 3;
p1.y = 3;

const p2 = new CharacterWidget(
  "@",
  AnsiColor.BrightBlue,
  AnsiColor.Black,
);
p2.x = 13;
p2.y = 3;

const npcs: CharacterWidget[] = [
  new CharacterWidget(
    "@",
    AnsiColor.Yellow,
    AnsiColor.Black,
  ),
  new CharacterWidget(
    "@",
    AnsiColor.Green,
    AnsiColor.Black,
  ),
];

const characters = [
  ...npcs,
  p1,
  p2,
];

export const mainUI = new SplitPanelContainerWidget();
mainUI.layout = {
  widthPercent: 100,
  heightPercent: 100,
};
mainUI.splitPercent = 75;

mainUI.rightPanel.border = 2;
mainUI.rightPanel.backColor = AnsiColor.BrightBlack;

const playingBox = mainUI.leftPanel;

mainUI.leftPanel.title = " Map ";
mainUI.leftPanel.titleForeColor = AnsiColor.BrightWhite;
mainUI.leftPanel.titleBackColor = AnsiColor.Magenta;
mainUI.leftPanel.borderForeColor = AnsiColor.BrightMagenta;
mainUI.leftPanel.borderBackColor = AnsiColor.Magenta;
mainUI.leftPanel.backColor = AnsiColor.Black;

mainUI.rightPanel.title = " Stats ";
mainUI.rightPanel.titleForeColor = AnsiColor.BrightWhite;
mainUI.rightPanel.titleBackColor = AnsiColor.Blue;
mainUI.rightPanel.borderForeColor = AnsiColor.BrightBlue;
mainUI.rightPanel.borderBackColor = AnsiColor.Blue;
mainUI.rightPanel.backColor = AnsiColor.Blue;
mainUI.rightPanel.childrenLayout = { type: "vertical", spacing: 1 };

export function initGame(engine: Engine) {
  characters.forEach((c) => c.parent = playingBox);
  engine.addWidget(mainUI);
}

export function updateGame(engine: Engine): boolean {
  let running = true;

  for (let i = 0; i < npcs.length; i++) {
    const npc = npcs[i];
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        npc.x--;
        break;
      case 1:
        npc.x++;
        break;
      case 2:
        npc.y--;
        break;
      case 3:
        npc.y++;
        break;
    }
  }

  const input = engine.readInput();

  if (input) {
    input.split("").forEach((c) => {
      switch (c) {
        case "a":
          p1.x--;
          break;
        case "d":
          p1.x++;
          break;
        case "w":
          p1.y--;
          break;
        case "s":
          p1.y++;
          break;

        case "j":
          p2.x--;
          break;
        case "l":
          p2.x++;
          break;
        case "i":
          p2.y--;
          break;
        case "k":
          p2.y++;
          break;

        case "z":
          running = false;
          break;
      }
    });
  }

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    char.x = Math.max(Math.min(char.x, playingBox.innerWidth - char.width), 0);
    char.y = Math.max(
      Math.min(char.y, playingBox.innerHeight - char.height),
      0,
    );
  }

  return running;
}
