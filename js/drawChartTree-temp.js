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
