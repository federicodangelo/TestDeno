import { CharacterWidget } from "./engine/widgets/CharacterWidget.ts";
import { Color, Engine } from "./engine/types.ts";
import { SplitPanelContainerWidget } from "./engine/widgets/SplitPanelContainerWidget.ts";

const p1 = new CharacterWidget(
  "@",
  Color.BrightRed,
  Color.Black,
);
p1.x = 3;
p1.y = 3;

const p2 = new CharacterWidget(
  "@",
  Color.BrightBlue,
  Color.Black,
);
p2.x = 13;
p2.y = 3;

const npcs: CharacterWidget[] = [
  new CharacterWidget(
    "@",
    Color.Yellow,
    Color.Black,
  ),
  new CharacterWidget(
    "@",
    Color.Green,
    Color.Black,
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
mainUI.rightPanel.backColor = Color.BrightBlack;

const playingBox = mainUI.leftPanel;

mainUI.leftPanel.title = " Map ";
mainUI.leftPanel.titleForeColor = Color.BrightWhite;
mainUI.leftPanel.titleBackColor = Color.Magenta;
mainUI.leftPanel.borderForeColor = Color.BrightMagenta;
mainUI.leftPanel.borderBackColor = Color.Magenta;
mainUI.leftPanel.backColor = Color.Black;

mainUI.rightPanel.title = " Stats ";
mainUI.rightPanel.titleForeColor = Color.BrightWhite;
mainUI.rightPanel.titleBackColor = Color.Blue;
mainUI.rightPanel.borderForeColor = Color.BrightBlue;
mainUI.rightPanel.borderBackColor = Color.Blue;
mainUI.rightPanel.backColor = Color.Blue;
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
