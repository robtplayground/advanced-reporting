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
  var DATA_FIELDS = "Data!A1:P20";
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

// to be used later
var delivered = 0;
var viewable = 0;

function getDEL(){
  chartData.forEach(function(entry, index){
    // will only add values for length of current duration
    if(isValidDate(entry["Date"])){
      delivered+=entry["Delivered Impressions"];
    }
  });
  return (delivered / booked * 100);
}

function getVIEWABLE(){
  chartData.forEach(function(entry, index){
    // will only add values for length of current duration
    if(isValidDate(entry["Date"])){
      viewable+=entry["Viewable Impressions"];
    }
  });
  return viewable;
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
    return row["Format"] === "hangTime";
  });
  return bm["Viewability"] * 100;
}

function getTIV(){
  // get TIV average
  var tiv = 0;
  chartData.forEach(function(entry){
    if(isValidDate(entry["Date"])){

      tiv+=entry["Average Time In View"];
    }
  });
  return (tiv / chartData.length);
}

function getTIV_bm(){
  var bm = benchData.find(function(row){
    return row["Format"] === "hangTime";
  });
  return bm["Average Time In View"];
}

function getCompletionsP(){
  var values = {
    '25': 0,
    '50': 0,
    '75': 0,
    '100': 0,
  };

  chartData.forEach(function(entry){
    if(isValidDate(entry["Date"])){
      // total each
      values['25']+= entry["HangTime - Video First Quarter Views"];
      values['50']+= entry["HangTime - Video Second Quarter Views"];
      values['75']+= entry["HangTime - Video Third Quarter Views"];
      values['100']+= entry["HangTime - Video Completions"];
    }
  });
  values['25'] = Number((values['25'] / viewable * 100).toFixed(1));
  values['50'] = Number((values['50'] / viewable * 100).toFixed(1));
  values['75'] = Number((values['75'] / viewable * 100).toFixed(1));
  values['100'] = Number((values['100'] / viewable * 100).toFixed(1));
  return values;
}

function getCompletionsP_bm(){
  var bm = benchData.find(function(row){
    return row["Format"] === "hangTime";
  });
  return bm["Video Completion Rate"];
}

function drawCharts(){

  viewable = getVIEWABLE();

 // delivered Pie Chart
  var chart_DEL = drawPie({
    metric: 'Delivery',
    container: 'chart_DEL',
    value: getDEL(),
    unit: '%',
    benchmark: getDEL_bm()
  });

  var chart_VB = drawPie({
    metric: 'Viewability',
    container: 'chart_VB',
    value: getVB(),
    unit: '%',
    benchmark: getVB_bm()
  });

  var chart_TIV = drawPie({
    metric: 'Average Time in View',
    container: 'chart_TIV',
    value: getTIV(),
    unit: 's',
    benchmark: getTIV_bm()
  });



  var chart_CP = drawHeat({
    metric: 'Completions (Passive)',
    container: 'chart_CP',
    values: getCompletionsP(),
    benchmark: getCompletionsP_bm()
  });

  // drawProgress();
  // drawChartTree();
}



function drawPie(params) {

    $chart = $('#' + params.container);

    function getRemainder(unit, value){
      if(unit === 's'){
        var round10 = Math.ceil(value / 10) * 10;

        return round10 - value;
      }
      if(unit === '%'){
        return 100 - value;
      }
    }

    // Viewability Pie

    var data = new google.visualization.arrayToDataTable([
      ['Metric', 'Value'],
      [params.metric, params.value],
      ['', getRemainder(params.unit, params.value)]
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
      enableInteractivity: false,
      tooltip: false
    });

    var bmData = new google.visualization.DataTable();
        bmData.addColumn('string', 'Benchmark');
        bmData.addColumn('number', 'Value');
        bmData.addColumn({type: 'string', role: 'tooltip'});
        bmData.addRows([
          ['Benchmark', params.benchmark, ('Benchmark ' + params.benchmark + params.unit)],
          ['', getRemainder(params.unit, params.benchmark), '']
        ]);

    // chart Overlay
    $chart.closest('.chart-wrapper').append('<div id="' + params.container + '--BM" class="chart chart--bm">' +  + '</div>');

    var bmChart = new google.visualization.PieChart(document.getElementById(params.container + '--BM'));
    var $bmChart = $('#' + params.container + '--BM');

    var bmOptions = {
      backgroundColor: 'transparent',
      colors: [$palepink, 'transparent'],
      pieHole: 0.6,
      pieSliceTextStyle: {
        color: 'transparent',
      },
      legend: 'none',
      tooltip:{
        trigger:'selection'
      }
    };

    // value number
    $chart.closest('.chart-wrapper').append('<div class="chart--pie__value">' + params.value.toFixed(1) + '</span><span class="value__unit">' + params.unit + '</span></div>');

    // trigger benchmark tooltip

    google.visualization.events.addListener(bmChart, 'ready', function(e) {
        bmChart.setSelection([{row:0,column:null}]);
    });

    bmChart.draw(bmData, bmOptions);

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

  var chart = new google.visualization.LineChart(document.getElementById('chart_PROG'));
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


function drawHeat(params) {
  $chart = $('#' + params.container);

  var hotColor = hexToRgb($pink);
  var coolColor = hexToRgb($midgrey);

  // bunch of functions for getting heatmap colors from gradient - converting from hex to rgb and back again

  var heatColors = [];

  var allValues = [params.values['25'], params.values['50'], params.values['75'], params.values['100']];

  var highest = Math.max.apply(null, allValues);
  var lowest = Math.min.apply(null, allValues);

  allValues.forEach(function(value) {
    var colorPos = (value - lowest) / (highest - lowest);
    var color = 'rgb(' + pickHex(hotColor, coolColor, colorPos) + ')';
    color = rgbVals(color);
    color = rgbToHex(color[0], color[1], color[2]);
    // finally got my new hex value
    heatColors.push(color);
  });

  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Benchmark');
  data.addColumn('number', 'Value');
  data.addColumn('string', 'annotation'); // not working yet
  data.addRows([
    ['25%', 25, params.values['25'] + '%'],
    ['50%', 25, params.values['50'] + '%'],
    ['75%', 25, params.values['75'] + '%'],
    ['100%', 25, params.values['100'] + '%']
  ]);

  console.log(data);


  //
  // function heatColor(value){
  //
  // }
  var chart = new google.visualization.PieChart(document.getElementById(params.container));
  chart.draw(data, {
    backgroundColor: 'transparent',
    colors: heatColors,
    pieHole: 0.6,
    pieSliceTextStyle: {
      // color: 'transparent',
    },
    legend: {position: 'labeled'},
    // enableInteractivity: false,
    tooltip: false
  });
}
