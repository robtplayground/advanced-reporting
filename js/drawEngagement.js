
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
