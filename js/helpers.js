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

function convertSerialDate(serial){ // https://gist.github.com/christopherscott/2782634
  return new Date((serial - (25567 + 1))*86400*1000);
}
