import buildBaseMap from "./baseMap.js";
import { getRandomInt } from "./helperFunctions.js";

const { workingMap, continentPoints } = buildBaseMap();

const colors = new Array(continentPoints.length)
  .fill(null)
  .map(
    () =>
      `rgb(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)})`
  );

let tbody = document.querySelector("#tableBody");

workingMap.forEach((row, rIndex) => {
  let tRow = document.createElement("tr");
  tRow.id = "tableRow" + rIndex;

  row.forEach((block, bIndex) => {
    let tCell = document.createElement("td");
    tCell.id = "tableCell" + bIndex;
    tCell.style.width = "16px";
    tCell.style.textAlign = "center";
    tCell.style.backgroundColor = colors[block.continentValue - 1];

    tCell.appendChild(
      document.createTextNode(block.continentValue.toString().padStart(3, " "))
    );

    tRow.appendChild(tCell);
  });

  tbody.appendChild(tRow);
});
