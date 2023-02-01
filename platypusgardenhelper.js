// ==UserScript==
// @name        Platypus Helper for Cookie Clicker
// @namespace   Violentmonkey Scripts
// @match       https://orteil.dashnet.org/cookieclicker/
// @grant       none
// @version     1.0
// @author      Max
// @description 03/06/2022, 22:44:04
// ==/UserScript==

function bootstrap() {
  Game.gardenHelper = {}
  Game.stockHelper = {}
  Game.priceSuggestion = {}

  var load = function() {
    var Game = window.Game;
    if (Game && Game.ready)
    {
      if (!Game.gardenHelper.loaded)
        createGardenHelper();
      if (!Game.stockHelper.loaded)
        createStockHelper();
      if (!Game.priceSuggestion.loaded)
        createPriceSuggestion();
      return true;
    }
    return false;

  };

  load();

  if (!Game.gardenHelper.loaded || !Game.stockHelper.loaded)
  {
    var interval = setInterval(function() {
      if(load())
        clearInterval(interval)
    }, 1000);
  }
};

function fillPlot(seedIndex, x, y)
{
  var garden = Game.gardenHelper.getGardenInstance();
  if (garden.plot[y][x][0] === 0)
  {
    garden.seedSelected = seedIndex;
    garden.clickTile(x, y);
    garden.seedSelected = -1;
  }
}

function createGardenHelper()
{
  Game.gardenHelper.getGardenInstance = function() { return Game.Objects["Farm"].minigame; }
  Game.gardenHelper.gardenContainer = document.getElementById("gardenContent");

  Game.gardenHelper.createPattern = function() {
    for (let y = 0; y < 6; y++)
      for (let x = 0; x < 6; x++)
      {
        if (((x+y) % 2) === 0)
          fillPlot(0, x, y);
      }
  };

  let master = document.createElement("div");
  master.style["position"] = "absolute";
  master.style["right"] = "0px";
  master.style["margin"] = "10px";
  master.style["padding"] = "10px";
  master.style["background"] = "#f805";
  Game.gardenHelper.gardenContainer.appendChild(master);

  let heading = document.createElement("p");
  heading.textContent = "Platypus' Garden Helper";
  master.appendChild(heading);

  let createPatternButton = document.createElement("button");
  createPatternButton.textContent = "Fill Plot";
  createPatternButton.onclick = Game.gardenHelper.createPattern;
  master.appendChild(createPatternButton);

  Game.gardenHelper.loaded = true;
};

function createStockHelper()
{
  Game.stockHelper.getStockInstance = function() { return Game.Objects["Bank"].minigame; }
  Game.stockHelper.stockContainer = document.getElementById("bankContent");

  // Source for these numbers: https://www.reddit.com/r/CookieClicker/comments/iscqva/stock_market_numbers_for_high_and_low/
  // I know, the newest two are still missing
  Game.stockHelper.stockHints = {
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

  Game.stockHelper.borderStyles = {
    "buy": "solid 1px #0f0",
    "sell": "solid 1px #f00",
    "notify": "dotted 2px "
  };
  Game.stockHelper.refreshColors = function() {
    var miniGame = Game.stockHelper.getStockInstance();
    if (!miniGame)
      return;

    for (var i=0;i<miniGame.goodsById.length;i++)
		{
			var me=miniGame.goodsById[i];

      var element = me.l.children[1];
      var hint = Game.stockHelper.stockHints[me.symbol];
      if (hint)
      {
        if (me.val < hint.buy)
          element.style.border = Game.stockHelper.borderStyles.buy;
        else if (me.val >= (hint.high - 2))
          element.style.border = Game.stockHelper.borderStyles.sell;
        else
        {
          var percentage = 1 - (me.val - hint.low) / (hint.high - hint.low);
          var clamp01 = function(x) { return Math.min(Math.max(x, 0), 1); }
          var r = clamp01(percentage * -2 + 2) * 255;
          var g = clamp01(percentage * 2 - 1) * 255;
          element.style.border = Game.stockHelper.borderStyles.notify + "rgb(" + r + "," + g + ", 0)";
        }
      }
    }
  };

  var overrideTick = function(miniGame)
  {
    var oldTick = miniGame.tick;
    miniGame.tick = function()
    {
      oldTick();
      Game.stockHelper.refreshColors();
    }
  }

  Game.stockHelper.refreshColors();
  overrideTick(Game.stockHelper.getStockInstance());

  Game.stockHelper.loaded = true;
};

function createPriceSuggestion()
{
  Game.priceSuggestion.className = 'cheapest_price';

  { // Define style
    var className = Game.priceSuggestion.className;
    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.innerHTML = "." + className + "::after { color:#0f0;content:'💰'; }";
    document.head.appendChild(styleElement);
  }

  Game.priceSuggestion.ratiosById = {}
  Game.priceSuggestion.ratioCalc = function(me) { return me.getPrice(me.amount) / ((me.storedTotalCps/me.amount)*Game.globalCpsMult); }
  Game.priceSuggestion.refresh = function()
  {
    var me = Game.priceSuggestion;
    for(var i in Game.ObjectsById)
      me.ratiosById[i] = me.ratioCalc(Game.ObjectsById[i]);

    var ratioData = [];
    for(var i in me.ratiosById)
      ratioData.push({ id: i, value: me.ratiosById[i]});

    var compare = function(a, b) { if (a.value < b.value) return -1; if (a.value > b.value) return 1; return 0; }
    ratioData.sort(compare);

    for(var i in ratioData)
    {
      var element = Game.ObjectsById[ratioData[i].id].l;
      if (i == 0)
        element.childNodes[2].childNodes[3].classList.add(Game.priceSuggestion.className);
      else
        element.childNodes[2].childNodes[3].classList.remove(Game.priceSuggestion.className)
    }
  }

  Game.priceSuggestion.loaded = true;
}

// Initialize the garden helper
if (document.readyState === 'interactive')
{
  bootstrap();
}
else
{
  window.addEventListener('DOMContentLoaded', (event) => {
    bootstrap();
  });
}
