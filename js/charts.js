// ***** CAMPAIGN INFORMATION


var startDate = new Date(2017, 10, 8, 11, 0);
var endDate = new Date(2017, 10, 29, 11, 0);
var duration = moment(endDate).diff(startDate, 'days');

var booked = 1000000;
var dates = getDateArray(startDate, endDate);

var currentDate = new Date(2017, 10, 22, 11, 0);
var currentDuration = moment(currentDate).diff(startDate, 'days');

var API_KEY = "AIzaSyCGoVtWCBoXY3ByQFGTs2BqOX666RVODAg";
var SHEET_ID = "1rv9ijknqTMF7OCLMxOL3yQKKaxaUGDCEp0qf4FauW00";
var chartData;
var benchData;
var dataReady = false, benchReady = false;


// ***** FETCH REQUIRED DATA

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
    dataReady = true;
    if(dataReady === true && benchReady === true){
      drawCharts();
    }
  });

  var BENCH_FIELDS = "Benchmarks!A1:F7";
  $.get('https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + BENCH_FIELDS + '?valueRenderOption=UNFORMATTED_VALUE&key=' + API_KEY, function(data) {
    benchData = convertSheetData(data);
    benchReady = true;
    if(dataReady === true && benchReady === true){
      drawCharts();
    }
  });
});

// ***** PROCESS DATA - TOTALS

function isValidDate(date){
  return date.getTime() < currentDate.getTime();
}

function getDEL(){
  var delivery = 0;
  chartData.forEach(function(entry, index){
    // will only add values for length of current duration
    if(isValidDate(entry["Date"])){
      delivery+=entry["Delivered Impressions"];
    }
  });
  return (delivery / booked * 100);
}

function getDEL_bm(){
  return Math.round((booked / duration * currentDuration) / booked * 100)
}

function getVB(){
  // get viewability average
  var viewability = 0;
  chartData.forEach(function(entry){
    if(isValidDate(entry["Date"])){
      viewability+=entry["Viewability"];
    }
  });
  return (viewability / chartData.length * 100);
}

function getVB_bm(){
  var bm = benchData.find(function(row){
    return row["Format"] === "superSkin";
  });
  return bm["Viewability"] * 100;
}

function getTIV(){
  // get TIV average
}

function drawCharts(){

 // delivery Pie Chart
  drawPie({
    metric: 'Delivery',
    container: 'chart--DEL',
    value: getDEL(),
    unit: '',
    benchmark: getDEL_bm()
  });

  drawPie({
    metric: 'Viewability',
    container: 'chart--VB',
    value: getVB(),
    unit: '%',
    benchmark: getVB_bm()
  });

  // drawProgress();
  // drawChartTree();
}



function drawPie(params) {
    // get viewability average + remainder
    $chart = $('#' + params.container);

    // Viewability Pie
    var data = new google.visualization.arrayToDataTable([
      ['Metric', 'Value'],
      [params.metric, params.value],
      ['', 100 - params.value]
    ]);

    var chart = new google.visualization.PieChart(document.getElementById(params.container));
    chart.draw(data, {
      backgroundColor: 'transparent',
      colors: [$ssBlue, $palegrey],
      pieHole: 0.6,
      pieSliceTextStyle: {
        color: 'transparent',
      },
      legend: 'none',
      slices:{
        1: {enableInteractivity: false, tooltip: false}
      }
    });

    var bmData = new google.visualization.arrayToDataTable([
      ['Benchmark', 'Value'],
      ['', params.benchmark],
      ['', 2],
      ['', 100 - params.benchmark - 2]
    ]);

    console.log(bmData);

    // chart Overlay
    $chart.closest('.chart-wrapper').append('<div id="' + params.container + '--BM" class="chart chart--bm">' +  + '</div>');

    var bmChart = new google.visualization.PieChart(document.getElementById(params.container + '--BM'));
    bmChart.draw(bmData, {
      backgroundColor: 'transparent',
      colors: ['transparent', $pink, 'transparent'],
      pieHole: 0.3,
      pieSliceTextStyle: {
        color: 'transparent',
      },
      legend: 'none',
    });

    // value number
    $chart.closest('.chart-wrapper').append('<div class="chart--pie__value">' + params.value.toFixed(1) + '</span><span class="value__unit">%</span></div>');

    // benchMark Value
    $chart.closest('.chart-wrapper').append('<div class="chart--pie__bm"><span class="bm__desc">Expected: </span><span class="bm__value">' + params.benchmark + '</span></div>');

}

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
