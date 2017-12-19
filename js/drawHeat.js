function drawPie(params) {
    // get viewability average + remainder
    $chart = $('#' + params.container);
    var keyColor = $ssBlue;

    function getRemainder(unit, value){
      if(unit === 's'){
        return (Math.round(value / 10) * 10) - value;
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

    // // benchMark Value
    // $chart.closest('.chart-wrapper').append('<div class="chart--pie__bm"><span class="bm__desc">Expected: </span><span class="bm__value">' + params.benchmark + '</span></div>');

    // trigger benchmark tooltip

    google.visualization.events.addListener(bmChart, 'ready', function(e) {
        bmChart.setSelection([{row:0,column:null}]);
    });

    bmChart.draw(bmData, bmOptions);

}
