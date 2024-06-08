//import fs from "fs";

const worldSize = 100;
const numberOfContinents = 6;

const emptyMap = worldGenerator(worldSize);

const generatedPoints = continentPoint(emptyMap);

const areaExpansionMap = structuredClone(generatedPoints["continentPointMap"]);
const pointAreas = [];

generatedPoints["continentPoints"].forEach((block, index) => {
  pointAreas.push(checkAvailableSurroundingsLimited(block));
});

const pointCount = pointAreas.length;

let forLoopCount = 0;

while (forLoopCount < (worldSize * worldSize) / 2) {
  for (let i = 0; i < pointAreas.length; i++) {
    if (pointAreas.length <= 0) break;

    let workingPoints = pointAreas.shift();

    workingPoints = workingPoints.filter((block) => {
      return areaExpansionMap[block.x][block.y] === 0;
    });

    if (workingPoints.length <= 0) continue;

    let randomIndex = getRandomInt(workingPoints.length - 1, "floor");

    let selectedIndex = workingPoints[randomIndex];

    areaExpansionMap[selectedIndex.x][selectedIndex.y] =
      selectedIndex.blockIndex;

    workingPoints = workingPoints.filter(
      (_, index) => !(index === randomIndex)
    );

    let selectedAvailable = checkAvailableSurroundingsLimited(selectedIndex);

    selectedAvailable.forEach((block) => {
      let contains = false;

      for (let j = 0; j < workingPoints.length; j++) {
        if (workingPoints[j].x === block.x && workingPoints[j].y === block.y) {
          contains = true;
          break;
        }
      }

      if (!contains) {
        workingPoints.push(block);
      }
    });

    workingPoints = workingPoints.filter((block) => {
      return areaExpansionMap[block.x][block.y] === 0;
    });

    if (workingPoints.length > 0) pointAreas.push(workingPoints);
  }
  forLoopCount++;

  if (pointAreas.length <= 0) break;
}

let tbody = document.querySelector("#tableBody");

const colors = new Array(pointCount)
  .fill(null)
  .map(
    (_, index) =>
      `rgb(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)})`
  );

console.log(colors);
areaExpansionMap.forEach((row, rIndex) => {
  let tRow = document.createElement("tr");
  tRow.id = "tableRow" + rIndex;

  row.forEach((block, bIndex) => {
    let tCell = document.createElement("td");
    tCell.id = "tableCell" + bIndex;
    tCell.style.width = "16px";
    tCell.style.textAlign = "center";
    tCell.style.backgroundColor = colors[block - 1];

    tCell.appendChild(
      document.createTextNode(block.toString().padStart(3, " "))
    );

    tRow.appendChild(tCell);
  });

  tbody.appendChild(tRow);
});

//class TableRow extends HTMLElement {}
//
//window.customElements.define("table-row", TableRow);

if (false) {
  const mapForWrite = getAreaExpansionMapForWrite(areaExpansionMap);

  fs.writeFile("./maps/map.txt", mapForWrite, { flag: "w" }, (err) => {
    if (err) console.log(err);
    else console.log("finished writing map");
  });
}

function checkAvailableSurroundings(block) {
  const availableNeighbors = [];
  let outerBlockX = outerBlockCheck(block.x);
  let outerBlockY = outerBlockCheck(block.y);
  let sizeX = blockCheckSize(block.x);
  let sizeY = blockCheckSize(block.y);
  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      if (block.x === x + outerBlockX && block.y === y + outerBlockY) {
        continue;
      }
      if (areaExpansionMap[outerBlockX + x][outerBlockY + y] === 0) {
        availableNeighbors.push({
          blockIndex: block.blockIndex,
          x: outerBlockX + x,
          y: outerBlockY + y,
        });
      }
    }
  }
  return availableNeighbors;
}

function checkAvailableSurroundingsLimited(block) {
  const availableNeighbors = [];

  const plusOrMinus = (value) => 1 - 2 * value;

  switch (block.x) {
    case 0:
      if (areaExpansionMap[block.x + 1][block.y] === 0)
        availableNeighbors.push({ ...block, x: block.x + 1 });
      break;
    case worldSize - 1:
      if (areaExpansionMap[block.x - 1][block.y] === 0)
        availableNeighbors.push({ ...block, x: block.x - 1 });
      break;
    default:
      for (let i = 0; i < 2; i++) {
        let blockX = block.x + plusOrMinus(i);
        if (areaExpansionMap[blockX][block.y] === 0)
          availableNeighbors.push({ ...block, x: blockX });
      }
  }

  switch (block.y) {
    case 0:
      if (areaExpansionMap[block.x][block.y + 1] === 0)
        availableNeighbors.push({ ...block, y: block.y + 1 });
      break;
    case worldSize - 1:
      if (areaExpansionMap[block.x][block.y - 1] === 0)
        availableNeighbors.push({ ...block, y: block.y - 1 });
      break;
    default:
      for (let i = 0; i < 2; i++) {
        let blockY = block.y + plusOrMinus(i);
        if (areaExpansionMap[block.x][blockY] === 0)
          availableNeighbors.push({ ...block, y: blockY });
      }
  }

  return availableNeighbors;
}

function outerBlockCheck(blockValue) {
  return blockValue - (blockValue === 0 ? 0 : 1);
}
function blockCheckSize(axisValue) {
  return axisValue === 0 || axisValue === worldSize - 1 ? 2 : 3;
}

function getAreaExpansionMapForWrite(map) {
  let mapString = "";

  map.forEach((row) => {
    row.forEach((block) => {
      mapString += `${block}`.padStart(3, " ");
    });
    mapString += "\r\n";
  });
  return mapString;
}

function worldGenerator(size) {
  const world = new Array(size).fill(new Array(size).fill(null));
  return world;
}

function continentPoint(map) {
  const continentPointMap = structuredClone(map);
  const continentPoints = [];
  let blockIndex = 1;
  continentPointMap.forEach((row, rIndex) => {
    row.forEach((_block, bIndex) => {
      if (getRandomInt(worldSize * worldSize) < numberOfContinents) {
        continentPointMap[rIndex][bIndex] = blockIndex;
        continentPoints.push({ blockIndex, x: rIndex, y: bIndex });
        blockIndex += 1;
      } else {
        continentPointMap[rIndex][bIndex] = 0;
      }
    });
  });
  return { continentPointMap, continentPoints };
}

function getRandomInt(max, type = "round") {
  if (type === "floor") return Math.floor(Math.random() * max);
  return Math.round(Math.random() * max);
}
