var API_KEY = "AIzaSyCGoVtWCBoXY3ByQFGTs2BqOX666RVODAg";
var SHEET_ID = "1rv9ijknqTMF7OCLMxOL3yQKKaxaUGDCEp0qf4FauW00";
var chartData;

// campaign info - could be moved into an object
var startDate = new Date(2017, 10, 8, 11, 0);
var endDate = new Date(2017, 10, 29, 11, 0);
var booked = 1000000;
var dates = getDateArray(startDate, endDate);

// Load chart packages (will execute when charts/loader.js is loaded)
google.charts.load('current', {
  'packages': ['corechart', 'gauge', 'treemap']
});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(function() {

  // get chart data
  var DATA_FIELDS = "Data!A1:O20";
  $.get('https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + DATA_FIELDS + '?valueRenderOption=UNFORMATTED_VALUE&key=' + API_KEY, function(data) {
    chartData = convertSheetData(data);
    // convert dates to jsDates
    chartData.forEach(function(row, index){
      var jsDate = convertSerialDate(row["Date"]);
      chartData[index]["Date"] = jsDate;
    });

    drawViewability();
    drawProgress();
    drawDelivery();
    // drawChartTree();
  });
});

function drawProgress(){
  // benchmarking
  var expectedDaily = booked / dates.length;

  // generate blank data
  var data = [
    ['Date', 'Impressions', 'Expected']
  ];
  for(var i = 1; i < dates.length; i++){
    var entry = [dates[i], 0, i * expectedDaily];
    data.push(entry);
  }
  // map data to blank
  var expectedImps = 0;
  data.forEach(function(row, index){
    // first row of data is headers, so ignore this row
    if(typeof row[0] === 'object'){
      var dateMatch = chartData.find(function(entry){
        // find and return chartData row where date matches
        return entry["Date"].getTime() == row[0].getTime();
      });

      if(typeof dateMatch !== 'undefined'){
        expectedImps+=dateMatch["Delivered Impressions"];
      }
      data[index][1] = expectedImps;
    }
  });


  data = google.visualization.arrayToDataTable(data);

  var chart = new google.visualization.LineChart(document.getElementById('chart--PROG'));
  chart.draw(data,{
    title: 'Delivery Progress',
    curveType: 'function',
    legend: { position: 'bottom' },
    hAxis: {
      format: 'd/MM',
      viewWindow: {
        min: startDate,
        max: endDate
      }
    },
    explorer: {
      actions: ['dragToZoom', 'rightClickToReset']
    }
  });
}

function drawDelivery() {
    // get viewability average + remainder
    var delivery = 0;
    var remainder = 0;
    chartData.forEach(function(entry){
      delivery+=entry["Delivered Impressions"];
    });
    delivery = delivery / booked * 100;
    console.log('DELIVERY', delivery);
    remainder = 100 - delivery;
    // done

    // Viewability Pie
    var data = new google.visualization.arrayToDataTable([
      ['Metric', 'Delivery'],
      ['Delivered', delivery],
      ['', remainder]
    ]);

    var chart = new google.visualization.PieChart(document.getElementById('chart--DEL'));
    chart.draw(data, {
      colors: [$ssBlue, $palegrey],
      pieHole: 0.5,
      pieSliceTextStyle: {
        color: 'black',
      },
      legend: 'none'
    });
}

function drawViewability() {
    // get viewability average + remainder
    var viewability = 0;
    var remainder = 0;
    chartData.forEach(function(entry){
      viewability+=entry["Viewability"];
    });
    viewability = viewability / chartData.length * 100;
    remainder = 100 - viewability;
    // done

    // Viewability Pie
    var data = new google.visualization.arrayToDataTable([
      ['Metric', 'Viewability'],
      ['Viewability', viewability],
      ['', remainder]
    ]);

    var chart = new google.visualization.PieChart(document.getElementById('chart--VB'));
    chart.draw(data, {
      pieHole: 0.5,
      colors: [$ssBlue, $palegrey],
      pieSliceTextStyle: {
        color: 'black',
      },
      legend: 'none'
    });
}
