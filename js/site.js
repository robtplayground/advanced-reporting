var API_KEY = 'AIzaSyAkaBFESkhK3w_hwoprEYDTmy2hmRfm4aA';

var keen_query = "https://api.keen.io/3.0/projects/5832749c8db53dfda8a78daf/queries/count?api_key=AED5F59B6DC24F628B9397FA6141D98598ADA28EEEBBA0798A5F992878751614F0C3E7965A8C696B0BF6528D6756846D4FC8216C9EF48195873E07FC6B74632A19BF976CE11AA2F28B7E4EEA3388C2B8AB2636E0F5D51E734075D0E03966DD0B&event_collection=impression&group_by=%5B%22dimension.geo.coordinates%22%2C%22dimension.timestamp.Australia%2FSydney%22%5D&timezone=Australia%2FSydney&timeframe=%7B%22start%22%3A%222017-06-06T00%3A00%3A00.000%22%2C%22end%22%3A%222017-06-07T00%3A00%3A00.000%22%7D&filters=%5B%7B%22property_name%22%3A%22dimension.entity.campaign%22%2C%22operator%22%3A%22eq%22%2C%22property_value%22%3A%2257cbeb94fc81f71ac4bd20dc5eccb0ac%22%7D%5D";

var locations = [];
var map;
var infowindow;
var max_locations = 2000;

// Load Google Maps APi Script IF #map is present

document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelectorAll('#map').length > 0)
  {
    if (document.querySelector('html').lang)
      lang = document.querySelector('html').lang;
    else
      lang = 'en';

    var js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=queryKeen&key=' + API_KEY + '&language=' + lang;
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});

function queryKeen(){
  $.get( keen_query, function( data ) {
    var result = data.result;
    // sort result by timestamp ascending
    result.sort(function(x, y){
        return new Date(x["dimension.timestamp.Australia/Sydney"]) - new Date(y["dimension.timestamp.Australia/Sydney"]);
    });

    // data.result.slice(0, max_locations).forEach(function(impression){
    result.forEach(function(impression){
      var entry = {};
      var timestamp = impression["dimension.timestamp.Australia/Sydney"];
      entry.time = moment(timestamp).format('DD MMMM, h:mm');
      entry.lat = impression["dimension.geo.coordinates"][1];
      entry.lng = impression["dimension.geo.coordinates"][0];
      locations.push(entry);
    });

    // Range slider
    $('.range input').attr('max', locations.length);
    new RangeInput(document.querySelector('.range'));

    initMap(locations);
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
