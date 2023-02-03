// ==UserScript==
// @name        Platypus Helper for Cookie Clicker
// @namespace   Violentmonkey Scripts
// @match       https://orteil.dashnet.org/cookieclicker/
// @grant       none
// @version     1.0
// @author      Max
// @description 03/06/2022, 22:44:04
// ==/UserScript==

class miniGameHelper {
  #objectName;
  #minigameContainer;

  constructor(objectName, minigameContainer) {
    this.#objectName = objectName;
    this.#minigameContainer = minigameContainer;
  }

  getInstance() { return Game.Objects[this.#objectName].minigame; }

  getContainer() { return document.getElementById(this.#minigameContainer); }
};

class gardenHelper extends miniGameHelper {
  constructor() {
    super("Farm", "gardenContent");
  }

  fillPlot(seedIndex, x, y) {
    let garden = this.getInstance();
    if (garden.plot[y][x][0] === 0) {
      garden.seedSelected = seedIndex;
      garden.clickTile(x, y);
      garden.seedSelected = -1;
    }
  }

  createPattern() {
    for (let y = 0; y < 6; y++)
      for (let x = 0; x < 6; x++) {
        if (((x + y) % 2) === 0)
          this.fillPlot(0, x, y);
      }
  }

  initialize() {
    let master = document.createElement("div");
    master.style["position"] = "absolute";
    master.style["right"] = "0px";
    master.style["margin"] = "10px";
    master.style["padding"] = "10px";
    master.style["background"] = "#f805";
    this.getContainer().appendChild(master);

    let heading = document.createElement("p");
    heading.textContent = "Platypus' Garden Helper";
    master.appendChild(heading);

    let createPatternButton = document.createElement("button");
    createPatternButton.textContent = "Fill Plot";
    createPatternButton.onclick = () => this.createPattern();
    master.appendChild(createPatternButton);
  }
};

class stockHelper extends miniGameHelper {
  stockHints;
  borderStyles;
  constructor() {
    super("Bank", "bankContent");

    this.stockHints = {
      "CRL": { "low": 1.75, "high": 45, "buy": 5 },
      "CHC": { "low": 2.25, "high": 57, "buy": 5 },
      "BTR": { "low": 2.25, "high": 75, "buy": 5 },
      "SUG": { "low": 2.25, "high": 72, "buy": 5 },
      "NUT": { "low": 2, "high": 81, "buy": 5 },
      "SLT": { "low": 2.25, "high": 108, "buy": 5 },
      "VNL": { "low": 2.5, "high": 96, "buy": 5 },
      "EGG": { "low": 4, "high": 114, "buy": 5 },
      "CNM": { "low": 3.75, "high": 106, "buy": 5 },
      "CRM": { "low": 2.75, "high": 116, "buy": 5 },
      "JAM": { "low": 3, "high": 135, "buy": 5 },
      "WCH": { "low": 4.25, "high": 149, "buy": 5 },
      "HNY": { "low": 5.25, "high": 141, "buy": 7.5 },
      "CKI": { "low": 21, "high": 175, "buy": 25 },
      "RCP": { "low": 27, "high": 165, "buy": 30 }
    };
    this.borderStyles = {
      "buy": "solid 1px #0f0",
      "sell": "solid 1px #f00",
      "notify": "dotted 2px "
    };
  }

  refresh() {
    let miniGame = this.getInstance();
    if (!miniGame)
      return;

    for (var i = 0; i < miniGame.goodsById.length; i++) {
      let me = miniGame.goodsById[i];

      let element = me.l.children[1];
      let hint = this.stockHints[me.symbol];
      if (hint) {
        if (me.val < hint.buy)
          element.style.border = this.borderStyles.buy;
        else if (me.val >= (hint.high - 2))
          element.style.border = this.borderStyles.sell;
        else {
          let percentage = 1 - (me.val - hint.low) / (hint.high - hint.low);
          let clamp01 = function (x) { return Math.min(Math.max(x, 0), 1); }
          let r = clamp01(percentage * -2 + 2) * 255;
          let g = clamp01(percentage * 2 - 1) * 255;
          element.style.border = this.borderStyles.notify + "rgb(" + r + "," + g + ", 0)";
        }
      }
    }
  }
};

class purchaseHelper {
  className;
  ratiosById;

  constructor() {
    this.className = 'cheapest_price';
    this.ratiosById = {};

    // Define style
    let styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.innerHTML = "." + this.className + "::after { content:'💰'; }";
    document.head.appendChild(styleElement);
  }

  getRatio(me) {
    return me.getPrice(me.amount) / ((me.storedTotalCps / me.amount) * Game.globalCpsMult);
  }

  refresh() {
    for (let i in Game.ObjectsById)
      this.ratiosById[i] = this.getRatio(Game.ObjectsById[i]);

    let ratioData = [];
    for (let i in this.ratiosById)
      ratioData.push({ id: i, value: this.ratiosById[i] });

    let compare = function (a, b) { if (a.value < b.value) return -1; if (a.value > b.value) return 1; return 0; }
    ratioData.sort(compare);

    for (let i in ratioData) {
      let element = Game.ObjectsById[ratioData[i].id].l;
      if (i == 0)
        element.childNodes[2].childNodes[3].classList.add(this.className);
      else
        element.childNodes[2].childNodes[3].classList.remove(this.className)
    }
  }
};

// The mod itself
class platypusCore {
  modName;

  garden;
  stock;
  purchase;

  constructor(modName) {
    this.modName = modName;
    this.garden = new gardenHelper();
    this.stock = new stockHelper();
    this.purchase = new purchaseHelper();
  }

  init() {
    this.garden.initialize();
    Game.registerHook('logic', () => this.refresh());
    console.log(this.modName + " initialized.")
  }

  refresh() {
    this.stock.refresh();
    this.purchase.refresh();
  }
};


function startMod() {
  var retryInterval;

  var load = function () {
    let game = window.Game;
    if (game && game.ready) {
      game.registerMod("platypusHelper", new platypusCore("platypusHelper"));
      clearInterval(retryInterval);
      return true;
    }
    return false;
  };

  if (!load())
    retryInterval = setInterval(load, 1000);
}

// Initialize the mod
if (document.readyState === 'interactive') {
  startMod();
}
else {
  window.addEventListener('DOMContentLoaded', (event) => {
    startMod();
  });
}