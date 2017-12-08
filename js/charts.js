function loadChartsAPI(){
  // Load the Visualization API and the corechart package.
  google.charts.load('current', {'packages':['corechart', 'gauge', 'treemap']});

  // Set a callback to run when the Google Visualization API is loaded.
  google.charts.setOnLoadCallback(function(){

    drawChartTree();
    drawChartPie();
    drawChartGauge();

  });
}

// Prep data

var SHEET_ID = "1rv9ijknqTMF7OCLMxOL3yQKKaxaUGDCEp0qf4FauW00";
var PIE_DATA = "Data!A1:O20";
var API_KEY = "AIzaSyCGoVtWCBoXY3ByQFGTs2BqOX666RVODAg";

var chartData;

$.get('https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + PIE_DATA + '?valueRenderOption=UNFORMATTED_VALUE&key=' + API_KEY, function(data){
  chartData = data;
});

function drawChartPie(){





  // Viewability Pie
  var data2 = new google.visualization.arrayToDataTable([
    ['Name', 'Viewability'],
    ['Justice League', 63],
    ['Remainder', 50]
  ]);

  var chart2 = new google.visualization.PieChart(document.getElementById('pie2'));
  chart2.draw(data2, {
    pieHole: 0.5,
    pieSliceTextStyle: {
      color: 'black',
    },
    legend: 'none'
  });

}

function drawChartGauge(){

  // Viewability Gauge
  var data1 = new google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['Viewability', 50]
  ]);

  var chart = new google.visualization.Gauge(document.getElementById('pie1'));
  chart.draw(data1, {});
}



function drawChartTree() {
  // Category tree
  var catData = new google.visualization.arrayToDataTable(categoriesData);

  var categoryTree = new google.visualization.TreeMap(document.getElementById('tree1'));
  categoryTree.draw(catData, {
          minColor: '#f00',
          midColor: '#ddd',
          maxColor: '#0d0',
          headerHeight: 15,
          fontColor: 'black',
          showScale: false
        });

}
