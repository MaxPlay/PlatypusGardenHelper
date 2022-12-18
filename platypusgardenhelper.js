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

  var load = function() {
    var Game = window.Game;
    if (Game && Game.ready)
    {
      if (!Game.gardenHelper.loaded)
        createGardenHelper();
      if (!Game.stockHelper.loaded)
        createStockHelper();
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
          var percentage = (me.val - hint.low) / (hint.high - hint.low);
          var clamp01 = function(x) { return Math.min(Math.max(x, 0), 1); }
          var r = clamp01(percentage * -2 + 2) * 255;
          var g = clamp01(percentage * 2 - 1) * 255;
          element.style.border = Game.stockHelper.borderStyles.notify + "rgb(" + r + "," + g + ", 0)";
        }
      }
    }
  };

  var overrideTick = function()
  {
    var oldTick = miniGame.tick;
    miniGame.tick = function()
    {
      oldTick();
      Game.stockHelper.refreshColors();
    }
  }

  Game.stockHelper.refreshColors();

  Game.stockHelper.loaded = true;
};

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
