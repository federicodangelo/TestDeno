// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiateAsync, __instantiate;

(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };

  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }

  __instantiateAsync = async (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExpA(m);
  };

  __instantiate = (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExp(m);
  };
})();

System.register("engine/src/types", [], function (exports_1, context_1) {
  "use strict";
  var Point, Size, Rect;
  var __moduleName = context_1 && context_1.id;
  function rgb(r, g, b) {
    return 16 + 36 * r + 6 * g + b;
  }
  exports_1("rgb", rgb);
  return {
    setters: [],
    execute: function () {
      Point = class Point {
        constructor(x = 0, y = 0) {
          this.x = x;
          this.y = y;
        }
        set(x, y) {
          this.x = x;
          this.y = y;
          return this;
        }
        copyFrom(p) {
          this.x = p.x;
          this.y = p.y;
          return this;
        }
        equals(p) {
          return this.x === p.x &&
            this.y === p.y;
        }
        clone() {
          return new Point(this.x, this.y);
        }
      };
      exports_1("Point", Point);
      Size = class Size {
        constructor(width = 0, height = 0) {
          this.width = width;
          this.height = height;
        }
        set(width, height) {
          this.width = width;
          this.height = height;
          return this;
        }
        copyFrom(size) {
          this.width = size.width;
          this.height = size.height;
          return this;
        }
        equals(size) {
          return this.width === size.width &&
            this.height === size.height;
        }
        clone() {
          return new Size(this.width, this.height);
        }
      };
      exports_1("Size", Size);
      Rect = class Rect {
        constructor(x = 0, y = 0, width = 0, height = 0) {
          this.x = x;
          this.y = y;
          this.width = width;
          this.height = height;
        }
        get x1() {
          return this.x + this.width;
        }
        get y1() {
          return this.y + this.height;
        }
        set(x, y, width, height) {
          this.x = x;
          this.y = y;
          this.width = width;
          this.height = height;
          return this;
        }
        copyFrom(rect) {
          this.x = rect.x;
          this.y = rect.y;
          this.width = rect.width;
          this.height = rect.height;
          return this;
        }
        equals(rect) {
          return this.x === rect.x &&
            this.y === rect.y &&
            this.width === rect.width &&
            this.height === rect.height;
        }
        intersects(rect) {
          return !(this.x1 < rect.x ||
            this.y1 < rect.y ||
            this.x > rect.x1 ||
            this.y > rect.y1);
        }
        union(rect) {
          const x0 = Math.min(this.x, rect.x);
          const y0 = Math.min(this.y, rect.y);
          const x1 = Math.max(this.x1, rect.x1);
          const y1 = Math.max(this.y1, rect.y1);
          this.x = x0;
          this.y = y0;
          this.width = x1 - x0;
          this.height = y1 - y0;
        }
        minDistanceTo(rect) {
          return Math.min();
        }
        clone() {
          return new Rect(this.x, this.y, this.width, this.height);
        }
      };
      exports_1("Rect", Rect);
    },
  };
});
System.register("engine/src/native-types", [], function (exports_2, context_2) {
  "use strict";
  var __moduleName = context_2 && context_2.id;
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register(
  "engine/src/context",
  ["engine/src/types"],
  function (exports_3, context_3) {
    "use strict";
    var types_ts_1, EngineContextImpl;
    var __moduleName = context_3 && context_3.id;
    return {
      setters: [
        function (types_ts_1_1) {
          types_ts_1 = types_ts_1_1;
        },
      ],
      execute: function () {
        EngineContextImpl = class EngineContextImpl {
          constructor(nativeContext) {
            this.bounds = new types_ts_1.Rect();
            this.clip = new types_ts_1.Rect();
            this.tx = 0;
            this.ty = 0;
            this.x = 0;
            this.y = 0;
            this.foreColor = 7 /* White */;
            this.backColor = 0 /* Black */;
            this.transformsStack = [];
            this.clipStack = [];
            this.nativeContext = nativeContext;
          }
          beginDraw() {
            this.nativeContext.beginDraw();
          }
          beginClip(x, y, width, height) {
            this.bounds.set(x, y, width, height);
            this.clip.set(x, y, width, height);
            this.transformsStack.length = 0;
            this.clipStack.length = 0;
            this.x = 0;
            this.y = 0;
            this.tx = 0;
            this.ty = 0;
          }
          endClip() {}
          endDraw() {
            this.nativeContext.endDraw();
          }
          pushTransform(x, y) {
            this.transformsStack.push(new types_ts_1.Point(this.tx, this.ty));
            this.tx += x;
            this.ty += y;
          }
          popTransform() {
            const p = this.transformsStack.pop();
            if (p) {
              this.tx = p.x;
              this.ty = p.y;
            }
          }
          pushClip(x, y, width, height) {
            this.clipStack.push(this.clip.clone());
            const minX = Math.max(this.tx + x, this.clip.x);
            const minY = Math.max(this.ty + y, this.clip.y);
            const maxX = Math.min(
              this.tx + x + width,
              this.clip.x + this.clip.width,
            );
            const maxY = Math.min(
              this.ty + y + height,
              this.clip.y + this.clip.height,
            );
            this.clip.set(minX, minY, maxX - minX, maxY - minY);
          }
          popClip() {
            const p = this.clipStack.pop();
            if (p) {
              this.clip.copyFrom(p);
            }
          }
          isVisible(x, y, width, height) {
            return !(this.tx + x + width < this.clip.x ||
              this.ty + y + height < this.clip.y ||
              this.tx + x > this.clip.x + this.clip.width ||
              this.ty + y > this.clip.y + this.clip.height);
          }
          moveCursorTo(x, y) {
            this.x = x;
            this.y = y;
            return this;
          }
          color(foreColor, backColor) {
            this.foreColor = foreColor;
            this.backColor = backColor;
            return this;
          }
          resetColor() {
            this.foreColor = 7 /* White */;
            this.backColor = 0 /* Black */;
            return this;
          }
          text(str) {
            for (let i = 0; i < str.length; i++) {
              this.char(str.charCodeAt(i));
            }
            return this;
          }
          char(code) {
            const screenX = this.x + this.tx;
            const screenY = this.y + this.ty;
            if (
              screenX >= this.clip.x &&
              screenX < this.clip.x1 &&
              screenY >= this.clip.y &&
              screenY < this.clip.y1
            ) {
              this.nativeContext.setChar(
                code,
                this.foreColor,
                this.backColor,
                screenX,
                screenY,
              );
            }
            this.x++;
            return this;
          }
          charTimes(code, times) {
            for (let t = 0; t < times; t++) {
              this.char(code);
            }
            return this;
          }
          specialChar(code) {
            const screenX = this.x + this.tx;
            const screenY = this.y + this.ty;
            if (
              screenX >= this.clip.x &&
              screenX < this.clip.x1 &&
              screenY >= this.clip.y &&
              screenY < this.clip.y1
            ) {
              this.nativeContext.setSpecialChar(
                code,
                this.foreColor,
                this.backColor,
                screenX,
                screenY,
              );
            }
            this.x++;
            return this;
          }
          specialCharTimes(code, times) {
            for (let t = 0; t < times; t++) {
              this.specialChar(code);
            }
            return this;
          }
          border(x, y, width, height) {
            const clip = this.clip;
            const tx = this.tx;
            const ty = this.ty;
            const x0 = Math.max(x, clip.x - tx);
            const y0 = Math.max(y, clip.y - ty);
            const x1 = Math.min(x + width, clip.x1 - tx);
            const y1 = Math.min(y + height, clip.y1 - ty);
            if (x1 <= x0 || y1 <= y0) {
              return this;
            }
            if (x0 !== x && x0 !== x + width && y0 !== y && y0 !== y + height) {
              return this;
            }
            this.moveCursorTo(x, y);
            this.specialChar(10 /* CornerTopLeft */);
            this.specialCharTimes(9, /* Horizontal */ width - 2);
            this.specialChar(11 /* CornerTopRight */);
            for (let i = 0; i < height - 2; i++) {
              this.moveCursorTo(x, y + 1 + i);
              this.specialChar(8 /* Vertical */);
              this.moveCursorTo(x + width - 1, y + 1 + i);
              this.specialChar(8 /* Vertical */);
            }
            this.moveCursorTo(x, y + height - 1);
            this.specialChar(12 /* CornerBottomLeft */);
            this.specialCharTimes(9, /* Horizontal */ width - 2);
            this.specialChar(13 /* CornerBottomRight */);
            return this;
          }
          fill(x, y, width, height, char) {
            if (char.length === 0) {
              return this;
            }
            const clip = this.clip;
            const tx = this.tx;
            const ty = this.ty;
            const x0 = Math.max(tx + x, clip.x);
            const y0 = Math.max(ty + y, clip.y);
            const x1 = Math.min(tx + x + width, clip.x1);
            const y1 = Math.min(ty + y + height, clip.y1);
            if (x1 <= x0 || y1 <= y0) {
              return this;
            }
            const code = char.charCodeAt(0);
            for (let screenY = y0; screenY < y1; screenY++) {
              for (let screenX = x0; screenX < x1; screenX++) {
                this.nativeContext.setChar(
                  code,
                  this.foreColor,
                  this.backColor,
                  screenX,
                  screenY,
                );
              }
            }
            return this;
          }
        };
        exports_3("EngineContextImpl", EngineContextImpl);
      },
    };
  },
);
System.register(
  "engine/src/engine",
  ["engine/src/types", "engine/src/context"],
  function (exports_4, context_4) {
    "use strict";
    var types_ts_2, context_ts_1, EngineImpl;
    var __moduleName = context_4 && context_4.id;
    async function buildEngine(nativeContext) {
      const engine = new EngineImpl(nativeContext);
      await engine.init();
      return engine;
    }
    exports_4("buildEngine", buildEngine);
    function destroyEngine(engine) {
      engine.destroy();
    }
    exports_4("destroyEngine", destroyEngine);
    return {
      setters: [
        function (types_ts_2_1) {
          types_ts_2 = types_ts_2_1;
        },
        function (context_ts_1_1) {
          context_ts_1 = context_ts_1_1;
        },
      ],
      execute: function () {
        EngineImpl = class EngineImpl {
          constructor(nativeContext) {
            this.children = [];
            this.consoleSize = new types_ts_2.Size();
            this.invalidRects = [];
            this.nativeContext = nativeContext;
            this.context = new context_ts_1.EngineContextImpl(
              this.nativeContext.screen,
            );
          }
          async init() {
            await this.nativeContext.init();
            let consoleSize = this.nativeContext.screen.getScreenSize();
            while (consoleSize === null) {
              await new Promise((resolve) => {
                setTimeout(resolve, 1);
              });
              consoleSize = this.nativeContext.screen.getScreenSize();
            }
            this.consoleSize.set(consoleSize.width, consoleSize.height);
            this.nativeContext.screen.onScreenSizeChanged(
              this.onScreenSizeChanged.bind(this),
            );
          }
          onScreenSizeChanged(size) {
            if (!size.equals(this.consoleSize)) {
              this.consoleSize.set(size.width, size.height);
              this.invalidateRect(
                new types_ts_2.Rect(
                  0,
                  0,
                  this.consoleSize.width,
                  this.consoleSize.height,
                ),
              );
            }
          }
          draw() {
            if (this.invalidRects.length == 0) {
              return;
            }
            var pendingLayout = true;
            const clip = new types_ts_2.Rect();
            const consoleSize = this.consoleSize;
            this.context.beginDraw();
            for (let i = 0; i < this.invalidRects.length; i++) {
              clip.copyFrom(this.invalidRects[i]);
              if (clip.x < 0) {
                clip.width += clip.x;
                clip.x = 0;
              }
              if (clip.y < 0) {
                clip.height += clip.y;
                clip.y = 0;
              }
              if (
                clip.width <= 0 ||
                clip.height <= 0 ||
                clip.x > consoleSize.width ||
                clip.y > consoleSize.height
              ) {
                continue;
              }
              if (clip.x + clip.width > consoleSize.width) {
                clip.width = consoleSize.width - clip.x;
              }
              if (clip.y + clip.height > consoleSize.height) {
                clip.height = consoleSize.height - clip.y;
              }
              if (pendingLayout) {
                pendingLayout = false;
                this.updateLayout();
              }
              this.context.beginClip(clip.x, clip.y, clip.width, clip.height);
              for (let i = 0; i < this.children.length; i++) {
                this.children[i].draw(this.context);
              }
              this.context.endClip();
            }
            this.context.endDraw();
            this.invalidRects.length = 0;
          }
          updateLayout() {
            for (let i = 0; i < this.children.length; i++) {
              this.children[i].updateLayout(
                this.consoleSize.width,
                this.consoleSize.height,
              );
            }
          }
          update() {}
          addWidget(widget) {
            this.children.push(widget);
            widget.engine = this;
            widget.updateLayout(
              this.consoleSize.width,
              this.consoleSize.height,
            );
            this.invalidateRect(widget.getBoundingBox());
          }
          removeWidget(widget) {
            const ix = this.children.indexOf(widget);
            if (ix >= 0) {
              this.children.splice(ix, 1);
            }
            this.invalidateRect(widget.getBoundingBox());
          }
          onInput(listener) {
            this.nativeContext.input.onInput(listener);
          }
          invalidateRect(rect) {
            let lastRect = this.invalidRects.length > 0
              ? this.invalidRects[this.invalidRects.length - 1] : null;
            if (lastRect !== null && lastRect.intersects(rect)) {
              lastRect.union(rect);
              return;
            }
            this.invalidRects.push(rect.clone());
          }
          destroy() {
            this.nativeContext.destroy();
          }
        };
      },
    };
  },
);
System.register(
  "engine/src/widgets/widget",
  ["engine/src/types"],
  function (exports_5, context_5) {
    "use strict";
    var types_ts_3, BaseWidget;
    var __moduleName = context_5 && context_5.id;
    return {
      setters: [
        function (types_ts_3_1) {
          types_ts_3 = types_ts_3_1;
        },
      ],
      execute: function () {
        BaseWidget = class BaseWidget {
          constructor() {
            this._x = 0;
            this._y = 0;
            this._width = 0;
            this._height = 0;
            this._parent = null;
            this._engine = null;
            this._boundingBox = new types_ts_3.Rect();
            this.layout = null;
          }
          setLayout(layout) {
            this.layout = layout;
            return this;
          }
          get engine() {
            return this._engine;
          }
          set engine(val) {
            if (val !== this._engine) {
              this._engine = val;
            }
          }
          get x() {
            return this._x;
          }
          set x(v) {
            if (v !== this._x) {
              this.invalidate();
              this._x = v;
              this.invalidate();
            }
          }
          get y() {
            return this._y;
          }
          set y(v) {
            if (v !== this._y) {
              this.invalidate();
              this._y = v;
              this.invalidate();
            }
          }
          get width() {
            return this._width;
          }
          set width(v) {
            if (v !== this._width) {
              this.invalidate();
              this._width = v;
              this.invalidate();
            }
          }
          get height() {
            return this._height;
          }
          set height(v) {
            if (v !== this._height) {
              this.invalidate();
              this._height = v;
              this.invalidate();
            }
          }
          get parent() {
            return this._parent;
          }
          set parent(v) {
            if (v !== this._parent) {
              this.invalidate();
              if (this._parent !== null) {
                const index = this._parent.children.indexOf(this);
                if (index >= 0) {
                  this._parent.children.splice(index, 1);
                }
              }
              this._parent = v;
              if (this._parent !== null) {
                this._parent.children.push(this);
                this.engine = this._parent.engine;
              } else {
                this.engine = null;
              }
              this.invalidate();
            }
          }
          updateLayout(parentWidth, parentHeight) {
            const layout = this.layout;
            if (layout !== null) {
              if (layout.heightPercent !== undefined) {
                this.height = Math.ceil(
                  parentHeight * layout.heightPercent / 100,
                );
              }
              if (layout.widthPercent !== undefined) {
                this.width = Math.ceil(parentWidth * layout.widthPercent / 100);
              }
              if (layout.customSizeFn !== undefined) {
                layout.customSizeFn(this, parentWidth, parentHeight);
              }
              if (layout.horizontalSpacingPercent !== undefined) {
                this.x = Math.floor(
                  (parentWidth - this.width) * layout.horizontalSpacingPercent /
                    100,
                );
              }
              if (layout.verticalSpacingPercent !== undefined) {
                this.y = Math.floor(
                  (parentHeight - this.height) * layout.verticalSpacingPercent /
                    100,
                );
              }
              if (layout.customPositionFn !== undefined) {
                layout.customPositionFn(this, parentWidth, parentHeight);
              }
            }
          }
          draw(context) {
            if (!context.isVisible(this.x, this.y, this.width, this.height)) {
              return;
            }
            context.pushTransform(this.x, this.y);
            context.pushClip(0, 0, this.width, this.height);
            context.moveCursorTo(0, 0);
            this.drawSelf(context);
            context.popClip();
            context.popTransform();
          }
          getBoundingBox() {
            this._boundingBox.set(this._x, this._y, this._width, this._height);
            let p = this._parent;
            while (p !== null) {
              this._boundingBox.x += p.x + p.innerX;
              this._boundingBox.y += p.y + p.innerY;
              p = p.parent;
            }
            return this._boundingBox;
          }
          invalidate() {
            const engine = this.engine;
            const bbox = this.getBoundingBox();
            engine?.invalidateRect(bbox);
          }
        };
        exports_5("BaseWidget", BaseWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/label",
  ["engine/src/widgets/widget"],
  function (exports_6, context_6) {
    "use strict";
    var widget_ts_1, LabelWidget;
    var __moduleName = context_6 && context_6.id;
    return {
      setters: [
        function (widget_ts_1_1) {
          widget_ts_1 = widget_ts_1_1;
        },
      ],
      execute: function () {
        LabelWidget = class LabelWidget extends widget_ts_1.BaseWidget {
          constructor(text, foreColor, backColor) {
            super();
            this._text = "";
            this._lines = [];
            this.height = 1;
            this.text = text;
            this.foreColor = foreColor;
            this.backColor = backColor;
          }
          set text(val) {
            if (val !== this._text) {
              this._text = val;
              this._lines = val.split("\n");
              this.width = this._lines.map((s) => s.length).reduce(
                (max, c) => Math.max(max, c),
                0,
              );
              this.height = this._lines.length;
              this.invalidate();
            }
          }
          get text() {
            return this._text;
          }
          drawSelf(context) {
            context.color(this.foreColor, this.backColor);
            for (let i = 0; i < this._lines.length; i++) {
              context.moveCursorTo(0, i).text(this._lines[i]);
            }
          }
        };
        exports_6("LabelWidget", LabelWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/character",
  ["engine/src/widgets/widget"],
  function (exports_7, context_7) {
    "use strict";
    var widget_ts_2, CharacterWidget;
    var __moduleName = context_7 && context_7.id;
    return {
      setters: [
        function (widget_ts_2_1) {
          widget_ts_2 = widget_ts_2_1;
        },
      ],
      execute: function () {
        CharacterWidget = class CharacterWidget extends widget_ts_2.BaseWidget {
          constructor(char, foreColor, backColor) {
            super();
            this.width = this.height = 1;
            this.char = char;
            this.foreColor = foreColor;
            this.backColor = backColor;
          }
          drawSelf(context) {
            context.color(this.foreColor, this.backColor).text(this.char);
          }
        };
        exports_7("CharacterWidget", CharacterWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/widget-container",
  ["engine/src/widgets/widget"],
  function (exports_8, context_8) {
    "use strict";
    var widget_ts_3, BaseWidgetContainer;
    var __moduleName = context_8 && context_8.id;
    return {
      setters: [
        function (widget_ts_3_1) {
          widget_ts_3 = widget_ts_3_1;
        },
      ],
      execute: function () {
        BaseWidgetContainer = class BaseWidgetContainer
          extends widget_ts_3.BaseWidget {
          constructor() {
            super(...arguments);
            this._children = [];
            this.childrenLayout = null;
          }
          setChildrenLayout(layout) {
            this.childrenLayout = layout;
            return this;
          }
          get engine() {
            return super.engine;
          }
          set engine(val) {
            if (val !== this.engine) {
              super.engine = val;
              for (let i = 0; i < this._children.length; i++) {
                this._children[i].engine = val;
              }
            }
          }
          get innerX() {
            return 0;
          }
          get innerY() {
            return 0;
          }
          get innerWidth() {
            return this.width;
          }
          get innerHeight() {
            return this.height;
          }
          get children() {
            return this._children;
          }
          updateLayout(parentWidth, parentHeight) {
            super.updateLayout(parentWidth, parentHeight);
            if (
              this.childrenLayout === null ||
              this.childrenLayout.type === "absolute"
            ) {
              for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateLayout(
                  this.innerWidth,
                  this.innerHeight,
                );
              }
            } else if (this.childrenLayout.type === "vertical") {
              const spacing = this.childrenLayout.spacing || 0;
              let top = 0;
              for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateLayout(
                  this.innerWidth,
                  this.innerHeight,
                );
                this.children[i].x = 0;
                this.children[i].y = top;
                top += this.children[i].height + spacing;
              }
            } else if (this.childrenLayout.type === "horizontal") {
              const spacing = this.childrenLayout.spacing || 0;
              let left = 0;
              for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateLayout(
                  this.innerWidth,
                  this.innerHeight,
                );
                this.children[i].y = 0;
                this.children[i].x = left;
                left += this.children[i].width + spacing;
              }
            }
            //The last option is "none".. so we don't do anything
          }
          draw(context) {
            if (!context.isVisible(this.x, this.y, this.width, this.height)) {
              return;
            }
            context.pushTransform(this.x, this.y);
            context.pushClip(0, 0, this.width, this.height);
            context.moveCursorTo(0, 0);
            this.drawSelf(context);
            this.preDrawChildren(context);
            for (let i = 0; i < this._children.length; i++) {
              this._children[i].draw(context);
            }
            this.postDrawChildren(context);
            context.popClip();
            context.popTransform();
          }
          preDrawChildren(context) {}
          postDrawChildren(context) {}
        };
        exports_8("BaseWidgetContainer", BaseWidgetContainer);
      },
    };
  },
);
System.register(
  "engine/src/widgets/box",
  ["engine/src/widgets/widget-container"],
  function (exports_9, context_9) {
    "use strict";
    var widget_container_ts_1, BoxContainerWidget;
    var __moduleName = context_9 && context_9.id;
    return {
      setters: [
        function (widget_container_ts_1_1) {
          widget_container_ts_1 = widget_container_ts_1_1;
        },
      ],
      execute: function () {
        BoxContainerWidget = class BoxContainerWidget
          extends widget_container_ts_1.BaseWidgetContainer {
          constructor(
            border = 1,
            borderForeColor = 7, /* White */
            borderBackColor = 0, /* Black */
            foreColor = 7, /* White */
            backColor = 0, /* Black */
            fillChar = " ",
          ) {
            super();
            this.title = "";
            this.titleForeColor = 7 /* White */;
            this.titleBackColor = 0 /* Black */;
            this.border = 0;
            this.border = border;
            this.borderForeColor = borderForeColor;
            this.borderBackColor = borderBackColor;
            this.foreColor = foreColor;
            this.backColor = backColor;
            this.fillChar = fillChar;
          }
          get innerX() {
            return this.border;
          }
          get innerY() {
            return this.border;
          }
          get innerWidth() {
            return this.width - this.border * 2;
          }
          get innerHeight() {
            return this.height - this.border * 2;
          }
          preDrawChildren(context) {
            if (this.innerX > 0 || this.innerY > 0) {
              context.pushTransform(this.innerX, this.innerY);
              context.pushClip(0, 0, this.innerWidth, this.innerHeight);
            }
          }
          postDrawChildren(context) {
            if (this.innerX > 0 || this.innerY > 0) {
              context.popClip();
              context.popTransform();
            }
          }
          drawSelf(context) {
            if (this.border > 0) {
              context.color(this.foreColor, this.backColor).fill(
                1,
                1,
                this.width - 2,
                this.height - 2,
                this.fillChar,
              );
              context.color(this.borderForeColor, this.borderBackColor).border(
                0,
                0,
                this.width,
                this.height,
              );
            } else {
              context.color(this.foreColor, this.backColor).fill(
                0,
                0,
                this.width,
                this.height,
                this.fillChar,
              );
            }
            if (this.title.length > 0) {
              context.moveCursorTo(
                Math.floor((this.width - this.title.length) / 2),
                0,
              )
                .color(this.titleForeColor, this.titleBackColor)
                .text(this.title);
            }
          }
        };
        exports_9("BoxContainerWidget", BoxContainerWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/split-panel",
  ["engine/src/widgets/widget-container", "engine/src/widgets/box"],
  function (exports_10, context_10) {
    "use strict";
    var widget_container_ts_2, box_ts_1, SplitPanelContainerWidget;
    var __moduleName = context_10 && context_10.id;
    return {
      setters: [
        function (widget_container_ts_2_1) {
          widget_container_ts_2 = widget_container_ts_2_1;
        },
        function (box_ts_1_1) {
          box_ts_1 = box_ts_1_1;
        },
      ],
      execute: function () {
        SplitPanelContainerWidget = class SplitPanelContainerWidget
          extends widget_container_ts_2.BaseWidgetContainer {
          constructor(sl = null) {
            super();
            this.panel1 = new box_ts_1.BoxContainerWidget(1);
            this.panel2 = new box_ts_1.BoxContainerWidget(1);
            this.splitLayout = null;
            this.panel1.parent = this;
            this.panel2.parent = this;
            this.splitLayout = sl;
            this.panel1.layout = {
              customSizeFn: (widget, parentWidth, parentHeight) => {
                const splitPercent = this.splitLayout?.splitPercent || 50;
                const direction = this.splitLayout?.direction || "horizontal";
                const fixedPanel = this.splitLayout?.fixed?.panel;
                const fixedAmount = this.splitLayout?.fixed?.amount || 0;
                if (direction === "horizontal") {
                  widget.height = parentHeight;
                  widget.width = fixedPanel === undefined
                    ? Math.floor(parentWidth * splitPercent / 100)
                    : fixedPanel === "panel1"
                    ? fixedAmount
                    : parentWidth - fixedAmount;
                } else {
                  widget.width = parentWidth;
                  widget.height = fixedPanel === undefined
                    ? Math.floor(parentHeight * splitPercent / 100)
                    : fixedPanel === "panel1"
                    ? fixedAmount
                    : parentHeight - fixedAmount;
                }
              },
            };
            this.panel2.layout = {
              heightPercent: 100,
              customSizeFn: (widget, parentWidth, parentHeight) => {
                const splitPercent = this.splitLayout?.splitPercent || 50;
                const direction = this.splitLayout?.direction || "horizontal";
                const fixedPanel = this.splitLayout?.fixed?.panel;
                const fixedAmount = this.splitLayout?.fixed?.amount || 0;
                if (direction === "horizontal") {
                  widget.height = parentHeight;
                  widget.width = fixedPanel === undefined
                    ? Math.ceil(parentWidth * (100 - splitPercent) / 100)
                    : fixedPanel === "panel2"
                    ? fixedAmount
                    : parentWidth - fixedAmount;
                } else {
                  widget.width = parentWidth;
                  widget.height = fixedPanel === undefined
                    ? Math.ceil(parentHeight * (100 - splitPercent) / 100)
                    : fixedPanel === "panel2"
                    ? fixedAmount
                    : parentHeight - fixedAmount;
                }
              },
              customPositionFn: (widget) => {
                const direction = this.splitLayout?.direction || "horizontal";
                if (direction === "horizontal") {
                  widget.x = this.width - widget.width;
                } else {
                  widget.y = this.height - widget.height;
                }
              },
            };
          }
          drawSelf() {
          }
        };
        exports_10("SplitPanelContainerWidget", SplitPanelContainerWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/scrollable",
  ["engine/src/widgets/widget-container"],
  function (exports_11, context_11) {
    "use strict";
    var widget_container_ts_3, ScrollableContainerWidget;
    var __moduleName = context_11 && context_11.id;
    return {
      setters: [
        function (widget_container_ts_3_1) {
          widget_container_ts_3 = widget_container_ts_3_1;
        },
      ],
      execute: function () {
        ScrollableContainerWidget = class ScrollableContainerWidget
          extends widget_container_ts_3.BaseWidgetContainer {
          constructor(
            foreColor = 7, /* White */
            backColor = 0, /* Black */
            fillChar = " ",
          ) {
            super();
            this._offsetX = 0;
            this._offsetY = 0;
            this.foreColor = foreColor;
            this.backColor = backColor;
            this.fillChar = fillChar;
          }
          get offsetX() {
            return this._offsetX;
          }
          get offsetY() {
            return this._offsetY;
          }
          get innerX() {
            return this._offsetX;
          }
          get innerY() {
            return this._offsetY;
          }
          setOffset(offsetX, offsetY) {
            if (offsetX !== this._offsetX || offsetY !== this._offsetY) {
              this._offsetX = offsetX;
              this._offsetY = offsetY;
              this.invalidate();
            }
          }
          preDrawChildren(context) {
            context.pushTransform(this.innerX, this.innerY);
          }
          postDrawChildren(context) {
            context.popTransform();
          }
          drawSelf(context) {
            context.color(this.foreColor, this.backColor).fill(
              0,
              0,
              this.width,
              this.height,
              this.fillChar,
            );
          }
        };
        exports_11("ScrollableContainerWidget", ScrollableContainerWidget);
      },
    };
  },
);
System.register(
  "game/src/game",
  [
    "engine/src/widgets/character",
    "engine/src/widgets/label",
    "engine/src/types",
    "engine/src/widgets/split-panel",
    "engine/src/widgets/scrollable",
  ],
  function (exports_12, context_12) {
    "use strict";
    var character_ts_1,
      label_ts_1,
      types_ts_4,
      split_panel_ts_1,
      scrollable_ts_1,
      NPCS_COUNT,
      MAP_SIZE,
      OBSTACLES_COUNT,
      mainUI,
      playingBox,
      cameraModeLabel,
      cameraMode,
      p1,
      p2,
      npcs,
      npcsColors,
      characters,
      obtacleChars,
      obtacleColors,
      pendingInput;
    var __moduleName = context_12 && context_12.id;
    function updateCameraModeText() {
      cameraModeLabel.text = "Camera: " +
        (cameraMode === 0 /* FollowContinuous */ ? "Continuous" : "Discrete") +
        " (F)";
    }
    function random(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function onInput(input) {
      pendingInput += input;
    }
    function initGame(engine) {
      engine.addWidget(mainUI);
      engine.onInput(onInput);
    }
    exports_12("initGame", initGame);
    function updateGame(engine) {
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
      if (pendingInput) {
        const uniqueChars = pendingInput.split("").map((c) => c.toLowerCase());
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
            case "f":
              if (cameraMode === 0 /* FollowContinuous */) {
                cameraMode = 1 /* FollowDiscrete */;
              } else {
                cameraMode = 0 /* FollowContinuous */;
              }
              updateCameraModeText();
              break;
          }
        });
        pendingInput = "";
      }
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        char.x = Math.max(Math.min(char.x, MAP_SIZE - char.width), 0);
        char.y = Math.max(Math.min(char.y, MAP_SIZE - char.height), 0);
      }
      let newOffsetX = playingBox.offsetX;
      let newOffsetY = playingBox.offsetY;
      if (cameraMode === 0 /* FollowContinuous */) {
        newOffsetX = -p1.x + Math.floor(playingBox.width * 0.5);
        newOffsetY = -p1.y + Math.floor(playingBox.height * 0.5);
      } else {
        if (p1.x > -playingBox.offsetX + playingBox.width * 0.85) {
          newOffsetX = playingBox.offsetX - Math.ceil(playingBox.width * 0.35);
        } else if (p1.x < -playingBox.offsetX + playingBox.width * 0.15) {
          newOffsetX = playingBox.offsetX + Math.ceil(playingBox.width * 0.35);
        }
        if (p1.y > -playingBox.offsetY + playingBox.height * 0.85) {
          newOffsetY = playingBox.offsetY - Math.ceil(playingBox.height * 0.35);
        } else if (p1.y < -playingBox.offsetY + playingBox.height * 0.15) {
          newOffsetY = playingBox.offsetY + Math.ceil(playingBox.height * 0.35);
        }
      }
      playingBox.setOffset(
        Math.max(Math.min(newOffsetX, 0), -(MAP_SIZE - playingBox.width)),
        Math.max(Math.min(newOffsetY, 0), -(MAP_SIZE - playingBox.height)),
      );
      return running;
    }
    exports_12("updateGame", updateGame);
    return {
      setters: [
        function (character_ts_1_1) {
          character_ts_1 = character_ts_1_1;
        },
        function (label_ts_1_1) {
          label_ts_1 = label_ts_1_1;
        },
        function (types_ts_4_1) {
          types_ts_4 = types_ts_4_1;
        },
        function (split_panel_ts_1_1) {
          split_panel_ts_1 = split_panel_ts_1_1;
        },
        function (scrollable_ts_1_1) {
          scrollable_ts_1 = scrollable_ts_1_1;
        },
      ],
      execute: function () {
        NPCS_COUNT = 2;
        MAP_SIZE = 512;
        OBSTACLES_COUNT = 512;
        exports_12(
          "mainUI",
          mainUI = new split_panel_ts_1.SplitPanelContainerWidget(),
        );
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
        mainUI.panel2.backColor = 8 /* BrightBlack */;
        playingBox = new scrollable_ts_1.ScrollableContainerWidget();
        playingBox.setLayout({ heightPercent: 100, widthPercent: 100 });
        playingBox.setChildrenLayout({ type: "none" });
        playingBox.parent = mainUI.panel1;
        mainUI.panel1.title = " Map ";
        mainUI.panel1.titleForeColor = 15 /* BrightWhite */;
        mainUI.panel1.titleBackColor = types_ts_4.rgb(
          1, /* I20 */
          0, /* I0 */
          1, /* I20 */
        );
        mainUI.panel1.borderForeColor = types_ts_4.rgb(
          3, /* I60 */
          0, /* I0 */
          3, /* I60 */
        );
        mainUI.panel1.borderBackColor = types_ts_4.rgb(
          1, /* I20 */
          0, /* I0 */
          1, /* I20 */
        );
        mainUI.panel1.backColor = 0 /* Black */;
        mainUI.panel1.fillChar = "";
        mainUI.panel2.title = " Stats ";
        mainUI.panel2.titleForeColor = 15 /* BrightWhite */;
        mainUI.panel2.titleBackColor = types_ts_4.rgb(
          0, /* I0 */
          1, /* I20 */
          2, /* I40 */
        );
        mainUI.panel2.borderForeColor = types_ts_4.rgb(
          0, /* I0 */
          0, /* I0 */
          3, /* I60 */
        );
        mainUI.panel2.borderBackColor = types_ts_4.rgb(
          0, /* I0 */
          1, /* I20 */
          2, /* I40 */
        );
        mainUI.panel2.backColor = types_ts_4.rgb(
          0, /* I0 */
          1, /* I20 */
          2, /* I40 */
        );
        mainUI.panel2.childrenLayout = { type: "vertical", spacing: 1 };
        new label_ts_1.LabelWidget(
          "Move P1: W/S/A/D\nMove P2: I/J/K/L\nQuit: Z",
          7, /* White */
          mainUI.panel2.backColor,
        ).parent = mainUI.panel2;
        cameraModeLabel = new label_ts_1.LabelWidget(
          "",
          7, /* White */
          mainUI.panel2.backColor,
        );
        cameraModeLabel.parent = mainUI.panel2;
        cameraMode = 0 /* FollowContinuous */;
        p1 = new character_ts_1.CharacterWidget(
          "@",
          9, /* BrightRed */
          0, /* Black */
        );
        p1.x = 3;
        p1.y = 3;
        p2 = new character_ts_1.CharacterWidget(
          "@",
          12, /* BrightBlue */
          0, /* Black */
        );
        p2.x = 13;
        p2.y = 3;
        npcs = [];
        npcsColors = [
          2, /* Green */
          3, /* Yellow */
          6, /* Cyan */
        ];
        for (let i = 0; i < NPCS_COUNT; i++) {
          npcs.push(
            new character_ts_1.CharacterWidget(
              "@",
              npcsColors[i % npcsColors.length],
              0, /* Black */
            ),
          );
        }
        characters = [
          ...npcs,
          p1,
          p2,
        ];
        obtacleChars = ["."];
        obtacleColors = [
          types_ts_4.rgb(0, /* I0 */ 1, /* I20 */ 0 /* I0 */),
          types_ts_4.rgb(0, /* I0 */ 2, /* I40 */ 0 /* I0 */),
          types_ts_4.rgb(0, /* I0 */ 3, /* I60 */ 0 /* I0 */),
          types_ts_4.rgb(0, /* I0 */ 4, /* I80 */ 0 /* I0 */),
        ];
        for (let i = 0; i < OBSTACLES_COUNT; i++) {
          const obstacle = new character_ts_1.CharacterWidget(
            random(obtacleChars),
            random(obtacleColors),
            0, /* Black */
          );
          obstacle.x = Math.floor(Math.random() * MAP_SIZE);
          obstacle.y = Math.floor(Math.random() * MAP_SIZE);
          obstacle.parent = playingBox;
        }
        characters.forEach((c) => c.parent = playingBox);
        updateCameraModeText();
        pendingInput = "";
      },
    };
  },
);
System.register("web/src/native/fonts", [], function (exports_13, context_13) {
  "use strict";
  var DEFAULT_FONT, fonts;
  var __moduleName = context_13 && context_13.id;
  async function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }
  async function initFonts() {
    const map = new Map();
    for (var kv of fonts) {
      const id = kv[0];
      const font = kv[1];
      const image = await loadImage(font.data);
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const pixels = [];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const pxs =
            ctx.getImageData(
              x * font.dimensions.width,
              y * font.dimensions.height,
              font.dimensions.width,
              font.dimensions.height,
            ).data;
          const solidPixels = new Uint8ClampedArray(pxs.length / 4);
          let solidIndex = 0;
          for (let i = 0; i < pxs.length; i += 4) {
            solidPixels[solidIndex++] = pxs[i] + pxs[i + 1] + pxs[i + 2] > 0
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
  exports_13("initFonts", initFonts);
  return {
    setters: [],
    execute: function () {
      exports_13("DEFAULT_FONT", DEFAULT_FONT = "font9x14");
      fonts = new Map([
        [
          "font16x16",
          {
            data:
              "data:image/png;base64,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",
            dimensions: { width: 16, height: 16 },
          },
        ],
        [
          "font8x8",
          {
            data:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACAAQAAAADrRVxmAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAd2KE6QAAAT4SURBVEjHjVVBixRHFH60HanD4D6GBuswZGo7jUyCSLuKFFrprXmpbGaWIQmL5hTMMhvMxcPiwQyhUrsRDwZyEMGDPyCX/AdB0EMOOefixZPewhwW9bD05FXP7K5iAr6p7h6++uq9V6/eewUQwnXUCDOYLZnVVQnwy6zWngHz+BgtLz8F+P1p7bWWL649+IBWV03DqGtvHtPDn0ktvwB4+Nj7uo7AbaM+YuDBC63/9nHJbbn5Q7MEWaLS2+HZc1YaAoDW0exEPnokYTeRxU4FkklzeXbCFPe2wGiUJRRYw+sqFPc0BI+tTXtN11DXsrjhQF6+XNd25j0zZNF2IaCPjFqzjgBtHQxqWYaiRrZiivZf4cgKAO94wm4cChaFhBJRHQC6KKrxABW6uCiJQLDfl8oKHYGUl0BhxDdgRe0hgIhASPAOLBiNrcKfugNRB0JUzUvk2s3FX7TwpjSWDRojQicYDp4ANEAlkbSKiGIgBcHa10nS8zaNgAppAuvY6gwSL0wFYCFJYQPLpE4IKYlKUwFjJBLMp5R1BHbU+GA6hm1pRLYi3nEDjPSdSQgd0ifG21tjCVTkOY+cMC3UlY0CrlJu817PMtBTw3WCDTI219oGTEvVXyO4GhrGl4Sup/pEYCnqUKzDFXmfCjAUrWx/SFpvhT5JeEe88WaH+iw7k90JhzSnnIYMsCfWil4DWMFAlqVWCceuE4eQ+kMhhEVxi3e03ksE5cNMoBVxr8oUHI9smItlm0Zg+9gNjoe40O/sTJLJu17M+LQ24Ti0YBOTzbLJFw5UAu0YLtWctDDKJAY/PV0eL/Dmt3x+yRm6SJpWMOnhcEwA1Vm7FpByTEoccjyAztKaxSpH6s2B1TPmktHJWNMpPSRzGAXe1RupOv+0sFx5C+CzHAm4fuF65Tkejnw83AxWRisWOR49EnEPOQO5YS+GGFNKQB9On1dJey0b9io1B1S67VsXxQWXeLYCO7B94siTeX5Ay1CJHOyy8CWfHDmgOBFft0BKTkWjWQyLLGXBM45SFsupLFDw5owLcdaGEBgIBC1nHYuxfLLMCJBUpmI5zqyO7nCAFlHoHMaiBV0JSipgpdK9jhNFQVgguySK3qgN/pybUwuqlOcUUq0d1kdR7DY6D3rV0UKs8l8xw82BipdQrH9/6YvoqUmkER4/v3tovqlSeL4JrVYKK+dNLHyi+ZxIRyMXbT95gu0BaBmpLnaTwTo7yYXJ6T+utArh5UsctIGzlmiDi9gmH3/C/QhcBNaDJ5t89l3UUXHR0lpj9rdbR72skW4S3/mVp3yoGUCW8WDKnT9+fBtoGNMMpnvZ/l42jYx/GgamWZoeMKbTvX1m7O3vT6cHOjIeWZNuCytHwELHERD7HUQEmt//At3sZPfV7OTs1eyQEZt0s7fubBbHyS5PNwxoONgoiK/3AOLA+MSrbro0+w+AR7fLn7cY+AZjxk6wzGbT+CxFI1l84ibeG2AJsX6k7EDS4gM0YZXAneNzVuMUCc4SXVaVG2nu9/eNIlj3NpMDJ1wg8+u6YTLZTA1+Eo4Kur+xYNCArxtO+bGJOqzNQsnFI68ZsC2KFwLL7rxsdxdNooV80wEsTWIjCyiwjXJlwAnrBk2Jp6qNMGoAvoAaBl8bUHICO2XmOjg4K1zlwk3MfGN4V4748+e8U3m+je827bx31LY2Dy5egH8BP/2Mtt7WOCkAAAAASUVORK5CYII=",
            dimensions: { width: 8, height: 8 },
          },
        ],
        [
          "font9x14",
          {
            data:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAADgAQAAAADEH9LUAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAd2KE6QAAAc+SURBVFjDvZdPaCPXHcd/01ee9jCyNhTKE7alDYEceukMQ72b2kgLKe1lT4VeywwDMgXtRiWwGGLsEQqjHGbXh15kktbtpWeZBWcLgbzplFEPs3GPWgiNhIp9cWHEQjqGidXfeyPLXm9247ZO38GSP3x/v/f7/d7v/RHA6ZhAlcPz4xyqlh0Abgrkj/zjVAO4/WnIm4NYqg6sbQ/Rz/f2h/4wgUlJ8/9oHX+1J1T7o8PlVDs03nz7TavprUl0+K/ldC14/Yc/a/nNB58B/LKLqrcSge74Tam686eez7kpDO/0Rs3fSl+B44ggSlrkt1sfaSKuJihZEL1mm3S0i9GTlyT0CnRhKPH5/26DS1efMdCYeopMZYve3XVgbSVDN06gQXbcu90BpBsqIaDcaJzAesFFVVcYKi4lWmMdNqvo65H0Vd4/yCXJulRZGZKq5Jbw5Si7u2nKqoTkxq+nt+SMVneYrrGSjDC9LuOyunp6Li45CIP0lQm9bFysCuMCmeeIysJgAA1Tnc74HYASC0MN+iajWeEpomtbB9+71ucaKbakFSKgIWEN0EhBqpigNBhoR4iqXwxyCWgScc16PFPJqQv/0PwOCF+KI2NEVahvd0DMiMh0Ml8jdgQiLoEuJERenuN/OSq00OZ20jiplGU7OOtgz7HIHAEPbd0lOA8PYbUE3BopDhVIxBXCO1RxbFtxVFt3gJBYU+E9SkhojxNWwR2H5WMM3qUUVuOip6FSRK8xsKkKpikR+mrFmKNNcUZbIELljAwq5Z0eH8eJVsGKi7jY1eT7ikp8t9zqBcfpil0in626Re8WVkINbasT1WzsaDv3VlQHe16N3tA/+MufBQpyx0dYCd2LiP77v3GJ6NNUoC2P6IOYb6pKu0WLnyCqZqq/Z6riRyHcQ0P0hYVWi27w/aIXgql7YkZeE8heKnp1qOg7Iq7Bj+1SYW71SxHXlY0bL6IGwEa53N5/Np93A+vT3vvKoA9gYKh3H0nUDSlYXoZ+9RtENesPbk62KqJQaSFaMXAhHYEq+lariWiPlShVuEDajx44vkArqkphINFNL7Jaxe2Tmsp+ittSoLKKiMVRoGohaAKtkYVe4MdmFJSqPee1gQiXON+Uo3LydZRdCqmwAIDnBDSo8lDhpxCT7YNGFRfOo7+KnU+nqFTI+cOY31+aI67Z0x+vY6h5z7aLcbSMhryXRCEA5kjthEcGVdpO2BfIEAgkcvkM1WzG1wUyM7T4YTvYHQ/UdwvFh9ZBP1qfhRwBFC/UBG+kwpW0y9Sv4reco+nXKcJDwX/8AuJwHe5hqL2RkXdtfScQ6BYYxhwuLaIlffuh6Lg6IrWnINpb0FvSMBQIJ9K3EblTVCmrqvVIG58slT3p6wSP01KOD/tmZCs7PsYlOmd2Ss6+rOVOS1L6T/IVO03BS9ppwDVcY6Wl4H4sGQSXlPdhwaBq4Dc9kRCloWk2YMkgamjyGwDWWe3laODNZxTaLX8QR5VyoU2avF9HxMQ7gXFb72BCPp4AllHuBcM4iTarO1NkGAzPIb2zhkpR6PQEg2CRQOzMkC5ute3d/pEq3Lf8ISJyIQgclUslrr6IcHcoWAnTBDEjJ/ECtnsucDUeayIIUit2llCXd0PNwrjmoBC8oeOjZvPmaT/Os76tDGMNjMXtdjAcdyI07Occ/wMNtPxOVDOKGSK5404KlWrRmyEb/E9QVT9D+3j6onvj3hRV51mQwxsWZ1zeFiU8uk/mCq3cIIi0szTotEm7Z2hl+jl4aTmU/nPFobgIpBE35PesOMhIV+n2sUoLc/IIwMcMpaOiRGpN47Oe7CTSMDSh3oeVhYIXjvqyvHmXi56gKosC4zhJWNYA3SWoSISrqGkQ4r2CqppE2KC2Bk/CXw/QV4aYRP36WKSzXCq0bYHEsvsxv5iXo11MlQxeQNPx2g8+fhv3HMY6n3eI1TUBfvKLxeAC+t9UbUTJe/mdfevR4JyKkbzDZ6pCO3iaoup3+4fPhvFMVWd48cjKz2Y8h65Shc9UIn5R1JcAo8e74FtBG/WbO19Nnm1OvpicqfD9NN3V5clkNJmkG+9UP5ycZCrs7kwF8/iMFHfUt41ww1Mfd3cdAyzHOac6uVq0yamfpFCfeM+r+HnVZDI5HCcpfqQ5/OOIXlfz6EksGtDy/wddcpR5LsaPjbkc4cAa8vDgVOw50V/YXRyv8jLbH+FNfn8Fz1UgYyeEZb1D/WYSfV7TO3774Cmie1VGeWBGrFbt9J7sPY1DqAtVSyD9gffk420nQwExE7aCqDcaTw1Dw+QMZ/Q4Ee/7ZY3R3phztjG32HMoNELR53B2mWfj+uXz5F+L8LxS/ikvafyFozgDfA/WEbmhkG+Kg7V7ivxMRSgiuC8M3QASIWt64ur/HKTh7UQYosoJUnFvKW6PJ6eHNBril0X0lGQzNt3MMJ+hTelDPkohN1Vt7mzhM0Kic2/L5+twOfRvN4HyiPrYQGYAAAAASUVORK5CYII=",
            dimensions: { width: 9, height: 14 },
          },
        ],
      ]);
    },
  };
});
System.register(
  "web/src/native/web",
  ["engine/src/types", "web/src/native/fonts"],
  function (exports_14, context_14) {
    "use strict";
    var types_ts_5,
      fonts_ts_1,
      createFullScreenCanvas,
      useCp437,
      AnsiSpecialChar;
    var __moduleName = context_14 && context_14.id;
    function rgb(r, g, b) {
      return [r, g, b];
    }
    function colorToRGB(color) {
      if (color <= 16) {
        switch (color) {
          case 0 /* Black */:
            return rgb(12, 12, 12);
          case 1 /* Red */:
            return rgb(197, 15, 31);
          case 2 /* Green */:
            return rgb(19, 161, 14);
          case 3 /* Yellow */:
            return rgb(193, 156, 0);
          case 4 /* Blue */:
            return rgb(0, 55, 218);
          case 5 /* Magenta */:
            return rgb(136, 23, 152);
          case 6 /* Cyan */:
            return rgb(58, 150, 221);
          case 7 /* White */:
            return rgb(204, 204, 204);
          case 8 /* BrightBlack */:
            return rgb(118, 118, 118);
          case 9 /* BrightRed */:
            return rgb(231, 72, 86);
          case 10 /* BrightGreen */:
            return rgb(22, 198, 12);
          case 11 /* BrightYellow */:
            return rgb(249, 241, 165);
          case 12 /* BrightBlue */:
            return rgb(59, 120, 255);
          case 13 /* BrightMagenta */:
            return rgb(180, 0, 158);
          case 14 /* BrightCyan */:
            return rgb(97, 214, 214);
          case 15 /* BrightWhite */:
            return rgb(242, 242, 242);
        }
        return rgb(204, 204, 204);
      }
      if (color < 232) {
        color -= 16;
        const r = Math.trunc((Math.trunc(color / 36) * 255) / 6);
        const g = Math.trunc(((Math.trunc(color / 6) % 6) * 255) / 6);
        const b = Math.trunc((Math.trunc(color % 6) * 255) / 6);
        return rgb(r, g, b);
      }
      return rgb(0, 0, 0);
    }
    function getWebNativeContext() {
      const canvas = createFullScreenCanvas();
      const ctx = canvas.getContext("2d");
      const consoleSize = new types_ts_5.Size(8, 8);
      let charWidth = 8;
      let charHeight = 8;
      let fonts;
      let activeFont;
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let imageDataPixels = imageData.data;
      let lastForeColor = -1;
      let lastForeColorRGB = rgb(0, 0, 0);
      let lastBackColor = -1;
      let lastBackColorRGB = rgb(0, 0, 0);
      let dirty = true;
      ctx.imageSmoothingEnabled = false;
      let screenSizeChangedListeners = [];
      let inputListeners = [];
      const updateConsoleSize = () => {
        consoleSize.set(
          Math.trunc(canvas.width / charWidth),
          Math.trunc(canvas.height / charHeight),
        );
      };
      const setChar = (char, foreColor, backColor, x, y) => {
        dirty = true;
        if (lastForeColor !== foreColor) {
          lastForeColor = foreColor;
          lastForeColorRGB = colorToRGB(foreColor);
        }
        if (lastBackColor !== backColor) {
          lastBackColor = backColor;
          lastBackColorRGB = colorToRGB(backColor);
        }
        if (char < 0 || char > 255) {
          return;
        }
        const charPixels = activeFont.pixels[char];
        const fx = x * charWidth;
        const fy = y * charHeight;
        const fr = lastForeColorRGB[0];
        const fg = lastForeColorRGB[1];
        const fb = lastForeColorRGB[2];
        const br = lastBackColorRGB[0];
        const bg = lastBackColorRGB[1];
        const bb = lastBackColorRGB[2];
        for (let py = 0; py < charHeight; py++) {
          let p = (fy + py) * (imageData.width << 2) + (fx << 2);
          let f = py * charWidth;
          for (let px = 0; px < charWidth; px++) {
            if (charPixels[f] === 0) {
              imageDataPixels[p] = br;
              imageDataPixels[p + 1] = bg;
              imageDataPixels[p + 2] = bb;
            } else {
              imageDataPixels[p] = fr;
              imageDataPixels[p + 1] = fg;
              imageDataPixels[p + 2] = fb;
            }
            imageDataPixels[p + 3] = 255;
            p += 4;
            f += 1;
          }
        }
      };
      const handleKeyboard = (e) => {
        const key = e.key;
        if (key.length === 1) {
          inputListeners.forEach((l) => l(key));
        }
      };
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageDataPixels = imageData.data;
        updateConsoleSize();
        screenSizeChangedListeners.forEach((l) => l(consoleSize));
      };
      window.addEventListener("keydown", handleKeyboard);
      window.addEventListener("resize", handleResize);
      updateConsoleSize();
      return {
        screen: {
          getScreenSize: () => consoleSize,
          onScreenSizeChanged: (listener) => {
            screenSizeChangedListeners.push(listener);
          },
          setChar: (char, foreColor, backColor, x, y) => {
            setChar(char, foreColor, backColor, x, y);
          },
          setSpecialChar: (char, foreColor, backColor, x, y) => {
            setChar(AnsiSpecialChar[char], foreColor, backColor, x, y);
          },
          beginDraw: () => {},
          endDraw: () => {
            if (dirty) {
              ctx.putImageData(imageData, 0, 0);
              dirty = false;
            }
          },
        },
        input: {
          onInput: (listener) => {
            inputListeners.push(listener);
          },
        },
        init: async () => {
          fonts = await fonts_ts_1.initFonts();
          activeFont = fonts.get(fonts_ts_1.DEFAULT_FONT);
          charWidth = activeFont.dimensions.width;
          charHeight = activeFont.dimensions.height;
          updateConsoleSize();
        },
        destroy: () => {},
      };
    }
    exports_14("getWebNativeContext", getWebNativeContext);
    return {
      setters: [
        function (types_ts_5_1) {
          types_ts_5 = types_ts_5_1;
        },
        function (fonts_ts_1_1) {
          fonts_ts_1 = fonts_ts_1_1;
        },
      ],
      execute: function () {
        exports_14(
          "createFullScreenCanvas",
          createFullScreenCanvas = () => {
            const canvas = document.createElement("canvas");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            document.body.appendChild(canvas);
            return canvas;
          },
        );
        useCp437 = true;
        AnsiSpecialChar = [
          //Block
          useCp437 ? 219 : "█".charCodeAt(0),
          useCp437 ? 220 : "▄".charCodeAt(0),
          useCp437 ? 224 : "▀".charCodeAt(0),
          useCp437 ? 221 : "▌".charCodeAt(0),
          useCp437 ? 222 : "▌".charCodeAt(0),
          //Shade
          useCp437 ? 176 : "░".charCodeAt(0),
          useCp437 ? 177 : "▒".charCodeAt(0),
          useCp437 ? 178 : "▓".charCodeAt(0),
          ////Single Line
          useCp437 ? 179 : "│".charCodeAt(0),
          useCp437 ? 196 : "─".charCodeAt(0),
          useCp437 ? 218 : "┌".charCodeAt(0),
          useCp437 ? 191 : "┐".charCodeAt(0),
          useCp437 ? 192 : "└".charCodeAt(0),
          useCp437 ? 217 : "┘".charCodeAt(0),
          useCp437 ? 180 : "┤".charCodeAt(0),
          useCp437 ? 195 : "├".charCodeAt(0),
          useCp437 ? 193 : "┴".charCodeAt(0),
          useCp437 ? 194 : "┬".charCodeAt(0),
          useCp437 ? 197 : "┼".charCodeAt(0),
          //Double Line
          useCp437 ? 186 : "║".charCodeAt(0),
          useCp437 ? 205 : "═".charCodeAt(0),
          useCp437 ? 201 : "╔".charCodeAt(0),
          useCp437 ? 187 : "╗".charCodeAt(0),
          useCp437 ? 200 : "╚".charCodeAt(0),
          useCp437 ? 188 : "╝".charCodeAt(0),
          useCp437 ? 185 : "╣".charCodeAt(0),
          useCp437 ? 204 : "╠".charCodeAt(0),
          useCp437 ? 202 : "╩".charCodeAt(0),
          useCp437 ? 203 : "╦".charCodeAt(0),
          useCp437 ? 206 : "╬".charCodeAt(0),
        ];
      },
    };
  },
);
System.register(
  "web/src/main",
  [
    "engine/src/engine",
    "engine/src/widgets/label",
    "game/src/game",
    "web/src/native/web",
  ],
  function (exports_15, context_15) {
    "use strict";
    var engine_ts_1,
      label_ts_2,
      game_ts_1,
      web_ts_1,
      TARGET_FPS,
      engine,
      fpsLabel,
      totalRenderTime,
      frames,
      framesTime,
      nextUpdateTime;
    var __moduleName = context_15 && context_15.id;
    function updateFps() {
      const now = performance.now();
      frames++;
      if (now - framesTime > 1000) {
        const fps = frames / ((now - framesTime) / 1000);
        const stats = "FPS: " + fps.toFixed(2) + "\nRender Time: " +
          (totalRenderTime / frames).toFixed(2) + "ms";
        fpsLabel.text = stats;
        framesTime = now;
        frames = 0;
        totalRenderTime = 0;
      }
    }
    async function init() {
      console.log("Initializing Engine");
      engine = await engine_ts_1.buildEngine(web_ts_1.getWebNativeContext());
      console.log("Engine Initialized");
      game_ts_1.initGame(engine);
      console.log("Game Initialized");
      fpsLabel = new label_ts_2.LabelWidget(
        "FPS: 0.00\nRender Time: 0.00ms",
        7, /* White */
        game_ts_1.mainUI.panel2.backColor,
      );
      fpsLabel.parent = game_ts_1.mainUI.panel2;
      return engine;
    }
    function update() {
      const start = performance.now();
      if (start < nextUpdateTime) {
        return;
      }
      updateFps();
      engine.update();
      game_ts_1.updateGame(engine);
      engine.draw();
      const end = performance.now();
      const renderTime = end - start;
      totalRenderTime += renderTime;
      nextUpdateTime = start + Math.max(10, 1000 / TARGET_FPS - (end - start));
    }
    async function run() {
      const engine = await init();
      function onRequestAnimationFrame() {
        update();
        requestAnimationFrame(onRequestAnimationFrame);
      }
      onRequestAnimationFrame();
      return engine;
    }
    return {
      setters: [
        function (engine_ts_1_1) {
          engine_ts_1 = engine_ts_1_1;
        },
        function (label_ts_2_1) {
          label_ts_2 = label_ts_2_1;
        },
        function (game_ts_1_1) {
          game_ts_1 = game_ts_1_1;
        },
        function (web_ts_1_1) {
          web_ts_1 = web_ts_1_1;
        },
      ],
      execute: function () {
        TARGET_FPS = 10;
        totalRenderTime = 0;
        frames = 0;
        framesTime = performance.now();
        nextUpdateTime = 0;
        nextUpdateTime = performance.now() + 1000 / TARGET_FPS;
        run();
      },
    };
  },
);

__instantiate("web/src/main");
