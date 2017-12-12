var API_KEY = "AIzaSyCGoVtWCBoXY3ByQFGTs2BqOX666RVODAg";
var SHEET_ID = "1rv9ijknqTMF7OCLMxOL3yQKKaxaUGDCEp0qf4FauW00";
var chartData;

function convertSerialDate(serial){ // https://gist.github.com/christopherscott/2782634
  return new Date((serial - (25567 + 1))*86400*1000);
}

// Load chart packages (will execute when charts/loader.js is loaded)
google.charts.load('current', {
  'packages': ['corechart', 'gauge', 'treemap']
});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(function() {

  // get chart data
  var DATA_FIELDS = "Data!A1:O20";
  $.get('https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + DATA_FIELDS + '?valueRenderOption=UNFORMATTED_VALUE&key=' + API_KEY, function(data) {
    chartData = data.values;
    // remove header rows
    chartData.splice(0, 1);

    drawChartPie();
    drawChartLine();
    // drawChartGauge();
    // drawChartTree();
  });
});

function drawChartPie() {


    // get viewability average + remainder
    var viewability = 0;
    var remainder = 0;
    chartData.forEach(function(row){
      viewability+=row[6];
    });

    viewability = viewability / chartData.length * 100;
    remainder = 100 - viewability;

    // done

    // Viewability Pie
    var data2 = new google.visualization.arrayToDataTable([
      ['Name', 'Viewability'],
      ['Justice League', viewability],
      ['Remainder', remainder]
    ]);

    var chart2 = new google.visualization.PieChart(document.getElementById('pie1'));
    chart2.draw(data2, {
      pieHole: 0.5,
      pieSliceTextStyle: {
        color: 'black',
      },
      legend: 'none'
    });

}

function drawChartGauge() {
  // Viewability Gauge
  var data1 = new google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['Viewability', 75]
  ]);

  var chart = new google.visualization.Gauge(document.getElementById('pie1'));
  chart.draw(data1, {});
}



function drawChartTree() {

  var DATA_FIELDS = "Pubs!A1:D130";

  var categories = [
    ['Item', 'Parent', 'Impressions', 'Color'],
    ['Global', null, 0, 0],
    ['Auto', 'Global', 0, 0],
    ['Entertainment', 'Global', 0, 0],
    ['Entertainment/Music', 'Global', 0, 0],
    ['Games', 'Global', 0, 0],
    ['Gaming', 'Global', 0, 0],
    ['General', 'Global', 0, 0],
    ['Parenting', 'Global', 0, 0],
    ['Home', 'Global', 0, 0],
    ['Lifestyle', 'Global', 0, 0],
    ['Lifestyle/Fashion', 'Global', 0, 0],
    ['Lifestyle/News', 'Global', 0, 0],
    ['Lifestyle/Tech', 'Global', 0, 0],
    ['Motoring', 'Global', 0, 0],
    ['Music', 'Global', 0, 0],
    ['News/Weather/Finance', 'Global', 0, 0],
    ['Other', 'Global', 0, 0],
    ['Shopping', 'Global', 0, 0],
    ['Sport', 'Global', 0, 0],
    ['Sport/Lifestyle', 'Global', 0, 0],
    ['Tech', 'Global', 0, 0],
    ['Technology', 'Global', 0, 0]
  ];

  var categoriesData;

  $.get('https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + DATA_FIELDS + '?valueRenderOption=UNFORMATTED_VALUE&key=' + API_KEY, function(data) {
    categoriesData = data.values;
    // remove column header
    categoriesData.splice(0, 1);
    categoriesData.forEach(function(array, index) {
      // join pub name and site name
      var name = array[0] + ': ' + array[1] + ': ' + array[2];
      var category = array[2];
      var imps = array[3];
      categoriesData.splice(index, 1, [name, category, imps, imps]);
      // console.log(array);
    });
    categoriesData = categories.concat(categoriesData);

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

  });

}

function drawChartLine(){
  var booked = 1000000;
  var data = [
    ['Date', 'Impressions', 'Expected']
  ];
  var progress = 0;
  // var expected = 0;
  chartData.forEach(function(row, index){
    var date = convertSerialDate(row[0]);
    var amount = progress+=row[2];
    var bench = index * (booked / chartData.length-1);
    var entry = [date, amount, bench];
    data.push(entry);
  });
  data = google.visualization.arrayToDataTable(data);

  var chart = new google.visualization.LineChart(document.getElementById('line1'));
  chart.draw(data,{
    title: 'Impressions',
    curveType: 'function',
    legend: { position: 'bottom' },
    hAxis: {
      format: 'd/MM'
    }
  });
}
