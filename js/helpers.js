function convertSheetData(data){
  // sheetdata arrives as an array of arrays
  // store header rows, splice from array
  var headers = data.values.splice(0, 1);
  headers = headers[0];
  var newData = []; // will be an array of objects
  // with each row, convert it to a keyed object
  data.values.forEach(function(row){
    var rowObject = {};
    row.forEach(function(cell, index){
      rowObject[headers[index]] = cell;
    });
    newData.push(rowObject);
  });
  return newData;
}

function getDateArray(start, end) {
    var arr = new Array();
    var dt = new Date(start);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}

function convertSerialDate(serial){
  // https://gist.github.com/christopherscott/2782634
  return new Date((serial - (25567 + 1))*86400*1000);
}

// color converting
function rgbVals(rgbString){
  var array = rgbString.replace(/[^\d,]/g, '').split(',');
  array.forEach(function(item, index){
    array[index] = Number(item);
  });
  return array;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var hexToRgb = function(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var values = [];
  if (result) {
    values.push(parseInt(result[1], 16));
    values.push(parseInt(result[2], 16));
    values.push(parseInt(result[3], 16));
    return values;
  } else {
    return null;
  }
};


var pickHex = function(color1, color2, weight) {
  var p = weight;
  var w = p * 2 - 1;
  var w1 = (w / 1 + 1) / 2;
  var w2 = 1 - w1;
  var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2)
  ];
  return rgb;
};
