//Check for color table
const color_table = document.querySelector("body > table > tbody > tr:nth-child(1) > td.document > div.content > table.nonogram_color_table");
const is_color_table = color_table !== null;

//Nonogram table size (rows X columns)
const rowsXcolumns = document.querySelector("body > table > tbody > tr:nth-child(1) > td.document > div.content > table:nth-child(7) > tbody > tr > td:nth-child(1)");
const regex_rowsXcolumns = /(\d+)x(\d+)/;
const match = rowsXcolumns.textContent.match(regex_rowsXcolumns);
const N_COLUMNS = Number(match[1]);
const N_ROWS = Number(match[2]);

var highest_number_and_previous_color = {};

//Get elements of nonogram table
function getArrayOfNonogramElements(STR_XPATH) {
  var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
  var xnodes = [];
  var xres;
  while ((xres = xresult.iterateNext())) {
    xnodes.push(xres);
  }

  return xnodes;
}

// Setup empty row table
function setupCells(Length, name) {
  if (name == "nmv") {
    var extensionElement = document.createElement("tr");
  } else {
    var extensionElement = document.createElement("table");
  }
  for (var i = 0; i < Length; i++) {
    if (name == "nmh") {
      var row = extensionElement.insertRow(i);
      var cell = row.insertCell(0);
    } else {
      var cell = extensionElement.insertCell(i);
    }
    cell.id = `${name}_${i}`;
    cell.style.backgroundColor = "red";
    var div_element = cell.appendChild(document.createElement("div"));
    div_element.innerHTML = -1;
  }
  return extensionElement;
}

//Create new key if null, Update value if higher than previous
function updateHighestNumberAndColor(highest_number_and_previous_color, key, value, color) {
  if (highest_number_and_previous_color[key] == null) {
    highest_number_and_previous_color[key] = [value, color];
  } else {
    if (highest_number_and_previous_color[key][0] < value) {
      highest_number_and_previous_color[key][0] = value;
    }
  }
}

// Extension Cell values
function cellValues(arr) {
  const tableregex = /(nm[vh])(\d+)_(\d+)/;
  const arrayLength = arr.length;
  for (var i = 0; i < arrayLength; i++) {
    var extensionElementID = "";
    var nonogramElement = arr[i];
    var nonogramElementValue = Number(nonogramElement.firstChild.innerHTML);
    let nonogram_match = nonogramElement.id.match(tableregex);
    let name = nonogram_match[1];
    let column = nonogram_match[2];
    let row = nonogram_match[3];
    //FIX: getElementById returns: null
    if (name == "nmv") {
      extensionElementID = `${name}_${column}`;
      var cell = EXTENSION_COLUMN.querySelector(`#${extensionElementID}`);
    } else {
      extensionElementID = `${name}_${row}`;
      var cell = EXTENSION_ROW.querySelector(`#${extensionElementID}`);
    }
    //console.log(extensionElementID);
    //console.log(cell);
    if (cell == null) {
      console.log("null trigger");
      continue;
    }
    var extensionCellValue = Number(cell.firstChild.innerHTML);
    var nonogram_color = "none";
    updateHighestNumberAndColor(highest_number_and_previous_color, extensionElementID, nonogramElementValue, nonogram_color);
    var highestNumber = highest_number_and_previous_color[extensionElementID][0];
    var space = 1;
    if (is_color_table) {
      nonogram_color = nonogramElement.style.backgroundColor;
      if (highest_number_and_previous_color[extensionElementID][1] !== nonogram_color && highest_number_and_previous_color[extensionElementID][1] !== "none") {
        space = 0;
      }

      highest_number_and_previous_color[extensionElementID][1] = nonogram_color;
    }
    cell.firstChild.innerHTML = extensionCellValue + nonogramElementValue + space;
    extensionCellValue = Number(cell.firstChild.innerHTML);

    if (name == "nmv") {
      if (N_ROWS - extensionCellValue < highestNumber) {
        cell.style.backgroundColor = "green";
      }
    } else {
      if (N_COLUMNS - extensionCellValue < highestNumber) {
        cell.style.backgroundColor = "green";
      }
    }
  }
}

let arr = getArrayOfNonogramElements('//table[contains(@id, "nonogram_table")]/tbody/tr/td[not(contains(@class, "nmtc"))]//td[not(contains(@class, "num_empty"))]');
const EXTENSION_COLUMN = setupCells(N_COLUMNS, "nmv");
const EXTENSION_ROW = setupCells(N_ROWS, "nmh");

cellValues(arr);

EXTENSION_COLUMN.style.borderBottomStyle = "solid";
EXTENSION_COLUMN.style.borderBottomWidth = "2px";
//Insert extension to origin page
const nonogram_cols = document.querySelector("#nonogram_table > tbody > tr:nth-child(1) > td.nmtt > table > tbody");
const tbody_row = document.querySelector("#nonogram_table > tbody > tr:nth-child(2) > td.nmtl > table > tbody");
nonogram_cols.insertAdjacentElement("afterbegin", EXTENSION_COLUMN);

var org_childnodes = tbody_row.childNodes;
var extension_childnodes = EXTENSION_ROW.querySelectorAll("td");
var nodes_length = org_childnodes.length;
//Loop row cells and add border to rightside
for (var i = 0; i < nodes_length; i++) {
  var place = org_childnodes.item(i);
  extension_childnodes.item(i).firstChild.style.borderRightStyle = "solid";
  extension_childnodes.item(i).firstChild.style.borderRightWidth = "2px";
  place.insertAdjacentElement("afterbegin", extension_childnodes.item(i));
}
