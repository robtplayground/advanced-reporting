// Load the Google Maps Script (if #map exists)

document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelectorAll('#map').length > 0)
  {
    if (document.querySelector('html').lang)
      lang = document.querySelector('html').lang;
    else
      lang = 'en';

    var js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=getData&key=' + API_KEY + '&language=' + lang;
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});


// Get data from Google Sheet

var SHEET_ID = "1rv9ijknqTMF7OCLMxOL3yQKKaxaUGDCEp0qf4FauW00";
var GEO_RANGE = "Geo!A1:C31694";
var API_KEY = "AIzaSyCGoVtWCBoXY3ByQFGTs2BqOX666RVODAg";

var locations = [];

function getData(){
  $.get('https://sheets.googleapis.com/v4/spreadsheets/' + SHEET_ID + '/values/' + GEO_RANGE + '?valueRenderOption=UNFORMATTED_VALUE&key=' + API_KEY, function(data){
    var data = data.values;
    // remove headers
    data.splice(0,1);
    // create objects
    data.forEach(function(impression, index){
      var entry = {};
      var time = moment(impression[0]).format('DD MMMM, h:mm');
      entry.time = time;
      entry.lat = impression[1];
      entry.lng = impression[2];
      locations.push(entry);
    });
    // console.log(locations);
    // Range slider
    $('.range input').attr('max', locations.length);
    new RangeInput(document.querySelector('.range'));

    // initMap(locations);
  });
}


function initMap(){
  infowindow = new google.maps.InfoWindow();
  var noPoi = [{
    featureType: "poi",
    stylers: [{
      visibility: "off"
    }]
  }];
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -27.7441006, lng: 135.5161826},
    zoom: 4,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    styles: noPoi
  });
  locations.forEach(function(loc){
    // loc.marker = createMarker(loc);
  });
  // google.maps.event.trigger(locations[0].marker, 'click');
}

function createMarker(locationObj) {
  var thisLatLng = {lat: locationObj.lat, lng: locationObj.lng};
  var image = {
    url: "https://assets.playground.xyz/robt/15256017_map-marker-solid.png",
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(5, 5),
    scaledSize: new google.maps.Size(10, 10)
  };

  var html = '<p style="text-align: center;">' + locationObj.time + '</p>';

  var marker = new google.maps.Marker({
    map: map,
    position: thisLatLng,
    icon: image
  });

  // store marker in locations object

  locationObj.marker = marker;

  // add an infowindow to the marker object

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(html);
    infowindow.open(map, this);
  });

  // add the marker to the location

  return marker;
}

function updateMarkers(index){
  $('.output').text(locations[index].time);

  for (var i = index; i > 0; i--) {
    // console.log(index);
    if((!locations[index].hasOwnProperty('marker'))){
      createMarker(locations[index]);
    }
  }

  for (var i = (index + 1); i < locations.length; i++) {
    // console.log(locations[i]);
      if(locations[i].hasOwnProperty('marker')){
        console.log('deleting markers');
        locations[i].marker.setMap(null);
        delete locations[i].marker;
      }
  }
}
