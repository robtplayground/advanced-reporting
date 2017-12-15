function drawChartGauge() {
  // Viewability Gauge
  var data1 = new google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['Viewability', 75]
  ]);

  var chart = new google.visualization.Gauge(document.getElementById('pie1'));
  chart.draw(data1, {});
}
