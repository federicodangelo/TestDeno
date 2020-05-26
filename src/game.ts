import { CharacterWidget } from "./engine/widgets/character.ts";
import { Color, Engine } from "./engine/types.ts";
import { SplitPanelContainerWidget } from "./engine/widgets/split-panel.ts";

const NPCS_COUNT = 2;

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

const npcs: CharacterWidget[] = [];
const npcsColors: Color[] = [
  Color.Green,
  Color.Yellow,
  Color.Cyan,
];

for (let i = 0; i < NPCS_COUNT; i++) {
  npcs.push(
    new CharacterWidget(
      "@",
      npcsColors[i % npcsColors.length],
      Color.Black,
    ),
  );
}

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
mainUI.splitLayout = {
  direction: "horizontal",
  fixed: {
    panel: "panel2",
    amount: 30,
  },
};

mainUI.panel2.border = 2;
mainUI.panel2.backColor = Color.BrightBlack;

const playingBox = mainUI.panel1;

mainUI.panel1.title = " Map ";
mainUI.panel1.titleForeColor = Color.BrightWhite;
mainUI.panel1.titleBackColor = Color.Magenta;
mainUI.panel1.borderForeColor = Color.BrightMagenta;
mainUI.panel1.borderBackColor = Color.Magenta;
mainUI.panel1.backColor = Color.Black;

mainUI.panel2.title = " Stats ";
mainUI.panel2.titleForeColor = Color.BrightWhite;
mainUI.panel2.titleBackColor = Color.Blue;
mainUI.panel2.borderForeColor = Color.BrightBlue;
mainUI.panel2.borderBackColor = Color.Blue;
mainUI.panel2.backColor = Color.Blue;
mainUI.panel2.childrenLayout = { type: "vertical", spacing: 1 };

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
    const uniqueChars = input.split("").map((c) => c.toLowerCase());
    uniqueChars.forEach((c) => {
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

        case String.fromCharCode(27): //Escape
          running = false;
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
