// make bmChart paths transparent - ERROR - new style disappears as soon as you roll over on charts

//   google.visualization.events.addListener(bmChart, 'ready', function () {
//     var paths = Array.from( $bmChart[0].getElementsByTagName('path'));
//     paths.forEach(function(path){
//       var color = path.getAttribute('fill');
//       console.log(color);
//       if(color != 'none'){
//         var newColor = tinycolor(color).setAlpha(0.2).toRgbString();
//         path.setAttribute('fill', newColor);
//       }
//     });
// });
