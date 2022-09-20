// ==UserScript==
// @name        Gardenhelper for Cookie Clicker
// @namespace   Violentmonkey Scripts
// @match       https://orteil.dashnet.org/cookieclicker/
// @grant       none
// @version     1.0
// @author      Max
// @description 03/06/2022, 22:44:04
// ==/UserScript==

function bootstrap() {
  Game.gardenHelper = {}
  
  var load = function() {
    var Game = window.Game;
    if (Game && Game.ready)
    {
      createGardenHelper();
      return true;    
    }
    return false;    
  };
  
  load();
  
  if (!Game.gardenHelper.loaded)
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
