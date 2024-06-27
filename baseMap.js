import { getRandomInt } from "./helperFunctions.js";

let worldSize;
let numberOfContinents;

const blockTemplate = {
  x: null,
  y: null,
  continentValue: null,
  elevation: null,
  movementDirection: null,
};

let workingMap;

const continentPoints = new Map();

export default function buildBaseMap(size = 100, continentCount = 6) {
  worldSize = size;
  numberOfContinents = continentCount;

  workingMap = mapGenerator(worldSize);
  addContinentPoints(workingMap);

  spreadContinents();

  console.log(continentPoints);

  return { workingMap, continentPoints };
}

function mapGenerator(size) {
  const mapBase = [];
  for (let y = 0; y < size; y++) {
    mapBase.push([]);
    for (let x = 0; x < size; x++) {
      mapBase[y].push({ ...blockTemplate, x: x, y: y });
    }
  }

  return mapBase;
}

const continentTemplate = {
  pointIndex: null,
  occupiedPoints: null,
  availableNeighbors: null,
  neighborContinents: null,
  movementDirection: null,
};

function addContinentPoints(map) {
  for (let pointIndex = 1; pointIndex <= numberOfContinents; pointIndex++) {
    const x = getRandomInt(worldSize);
    const y = getRandomInt(worldSize);
    map[y][x]["continentValue"] = pointIndex;
    continentPoints.set(pointIndex, {
      ...continentTemplate,
      pointIndex,
      occupiedPoints: [map[y][x]],
      availableNeighbors: [...getSurroundingsAndAvailableNeighbors(map[y][x])],
      neighborContinents: new Set(),
    });
  }
}

function getAvailableNeighbors(neighbors) {
  return neighbors.filter((block) => !block.continentValue);
}

function getLimitedSurroundings(block) {
  let neighbors = [];

  if (block.x === 0) {
    neighbors.push(workingMap[block.y][block.x + 1]);
  } else if (block.x === worldSize - 1) {
    neighbors.push(workingMap[block.y][block.x - 1]);
  } else {
    neighbors.push(workingMap[block.y][block.x + 1]);
    neighbors.push(workingMap[block.y][block.x - 1]);
  }

  if (block.y === 0) {
    neighbors.push(workingMap[block.y + 1][block.x]);
  } else if (block.y === worldSize - 1) {
    neighbors.push(workingMap[block.y - 1][block.x]);
  } else {
    neighbors.push(workingMap[block.y + 1][block.x]);
    neighbors.push(workingMap[block.y - 1][block.x]);
  }

  return neighbors;
}

//TODO See if you can merge these two functions instead, looks like you could just put the
//.filter function in the getLimitedSurroundings
function getSurroundingsAndAvailableNeighbors(block) {
  return getAvailableNeighbors(getLimitedSurroundings(block));
}

function chooseAvailableNeighbor(point) {
  point["availableNeighbors"] = point["availableNeighbors"].filter(
    (block) => block["continentValue"] === null
  );

  if (point["availableNeighbors"].length > 0) {
    const chosenPoint = point["availableNeighbors"].splice(
      getRandomInt(point["availableNeighbors"].length),
      1
    )[0];

    chosenPoint["continentValue"] = point["pointIndex"];

    point["availableNeighbors"].push(
      ...getSurroundingsAndAvailableNeighbors(chosenPoint)
    );

    point["occupiedPoints"].push(chosenPoint);
  }
}

function checkPointsNeighbors() {
  let empty = true;

  for (let point of continentPoints.values()) {
    if (point["availableNeighbors"].length > 0) {
      empty = false;
      break;
    }
  }
  return empty;
}

function spreadContinents() {
  while (!checkPointsNeighbors()) {
    for (let point of continentPoints.values()) {
      if (point["availableNeighbors"].length > 0)
        chooseAvailableNeighbor(point);
    }
  }
}
